class NLPparse {
    constructor(code) {
        this.code = code+"\0";
        this.delete_comments();
        console.log(this.code)
        this.functions = {};
        this.toplevel();
        console.log(this.functions)
        let functionnames = Object.keys(this.functions);
        for (let name of functionnames) {
            this.block(this.functions[name].block);
        }
    }
    delete_comments() {
        let code = "";
        let i = 0;
        while (i<this.code.length) {
            if (this.code[i]=="\"") { // <string-symbol> // 文字列内の括弧を無視する
                // <string> ::= <string-symbol> <string-letters> <string-symbol>
                // <string-symbol> ::= '"'
                // <string-letters> ::= { <string-letter> }
                // ; <string-letter>内で<string-symbol>を使用する場合は、( '\' <string-symbol> )のようにバックスラッシュを付ける
                // ; <string-letter>内で '\' を使用する場合は、 '\\' のように2つ続ける
                // ; エスケープは '\' と1文字の合計2文字で構成される
                code += this.code[i];
                i++;
                //  <string-letters> <string-symbol>
                while (i<this.code.length) {
                    // ; <string-letter> 内で<string-symbol>を使用する場合は、( '\' <string-symbol> )のようにエスケープする
                    // ; <string-letter> 内で '\' を使用する場合は、 '\\' のようにエスケープする
                    // ; <string-letter> 内で、エスケープに使われない '\' は認められない
                    if (this.code[i]=="\\") {
                        code += this.code[i];
                        // ; エスケープは '\' と1文字の合計2文字で構成される
                        i++;
                    }
                    if (this.code[i]=="\"") { // <string-symbol>
                        code += this.code[i];
                        break;
                    }
                    code += this.code[i];
                    i++;
                }
            }
            else if (this.code.startsWith("//",i)) {
                while (i<this.code.length) {
                    if (this.code[i]=="\n") {
                        break;
                    }
                    i++;
                }
            }
            // else if (this.code.startsWith("/*",i)) {
            // }
            else {
                code += this.code[i];
            }
            i++;
        }
        this.code = code;
    }
    error(i,level,msg) {
        console.error(`[error:${i}]`,...msg);
    }
    info(msg) {
        console.log(`[info]`,...msg);
    }
    block(block_code) {
        // <block> ::= { <blank-lines> ( <stat> | <control>) } <blank-lines>
        let i = 0;
        while (i<block_code.length) {
            if ((block_code[i]==" "||(block_code[i]=="\n"|(block_code[i]=="\r"&&block_code[i+1]=="\n"&&i++)))) { // <blank-lines>
                i++;
            }
            else if (block_code[i]=="!") { // <control>
                // <control> ::= '!' [ <space> ] 'ctrl:(' <condition> '):' <struct-if> | <struct-while>
                // <condition> ::= ( <stat-var-declaration> | <stat-var-assign> | <stat-run-expr> )
                // <struct-if> ::= 'if' [ <space> ] '{' <block> '}'
                // <struct-while> ::= 'while' [ <space> ] '{' <block> '}'
                let ctrl = {
                    type: "",
                    condition: "",
                    block: "",
                };
                i++;
                while (i<block_code.length&&block_code[i]==" ") {i++;}
                if (!block_code.startsWith('ctrl:',i)) {
                    this.error(i,block_code,["制御構造の定義に問題があります0"]);
                    return false;
                }
                i+=5;
                // '('
                if (block_code[i]!='(') {
                    this.error(i,block_code,["制御構造の定義に問題があります1","条件の括弧がありません"]);
                    return false;
                }
                // <condition> ')'
                i++;
                while (i<block_code.length&&block_code[i]!=")") {
                    ctrl.condition += block_code[i];
                    i++;
                }
                // ':'
                i++;
                if (block_code[i]!=':') {
                    this.error(i,block_code,["制御構造の定義に問題があります2"]);
                    return false;
                }
                i++;
                if (block_code.startsWith('if',i)) { // <struct-if> ::= 'if' [ <space> ] '{' <block> '}'
                    console.log("if");
                    ctrl.type = "if";
                }
                else if (block_code.startsWith('while',i)) { // <struct-while> ::= 'while' [ <space> ] '{' <block> '}'
                    console.log("while");
                    ctrl.type = "while";
                }
                else {
                    this.error(i,block_code,["制御構造の定義に問題があります3","制御構造の型がありません"]);
                    return false;
                }
                console.log(ctrl)
            }
            else { // <stat>
                // <stat> ::= ( <stat-var-declaration> | <stat-var-assign> | <stat-run-expr> ) ';'
                while (i<block_code.length) {
                    if (block_code[i]==";") {
                        i++;
                        break;
                    }
                    i++;
                }
            }
        }
    }
    toplevel() {
        // <code> ::= { <blank-lines> <func> <blank-lines> }
        let i = 0;
        while (i<this.code.length) {
            // <func> ::= '!' [ <space> ] <var-type> ':(' <func-arg-def> '):fn:' [ <space> ] <func-name> { ( <space> | <eol> ) } '{' <block> '}'
            if (this.code[i]=='!') { // '!'
                let func = {
                    name: "",
                    args: "",
                    return: "",
                    block: "",
                };
                // [ <space> ]
                i++;
                while (i<this.code.length&&this.code[i]==" ") {i++;}
                // <var-type> ':'
                while (i<this.code.length&&this.code[i]!=":") {
                    func.return += this.code[i];
                    i++;
                }
                i++;
                // '('
                if (this.code[i]!='(') {
                    this.error(i,this.code,["関数の定義に問題があります1","引数の括弧がありません"]);
                    return false;
                }
                // <func-arg-def> ')'
                i++;
                while (i<this.code.length&&this.code[i]!=")") {
                    func.args += this.code[i];
                    i++;
                }
                // ':fn:'
                i++;
                if (!this.code.startsWith(':fn:',i)) {
                    this.error(i,this.code,["関数の定義に問題があります1"]);
                    return false;
                }
                i+=4;
                // [ <space> ]
                while (i<this.code.length&&this.code[i]==" ") {i++;}
                // <func-name> { ( <space> | <eol> ) } 
                while (i<this.code.length) {
                    if (this.code[i]=="\n"|(this.code[i]=="\r"&&this.code[i+1]=="\n"&&i++)) {
                        break;
                    }
                    if (this.code[i]==" ") {
                        break;
                    }
                    func.name += this.code[i];
                    i++;
                }
                while (i<this.code.length) {
                    if (!(this.code[i]==" "||(this.code[i]=="\n"|(this.code[i]=="\r"&&this.code[i+1]=="\n"&&i++)))) {
                        break;
                    }
                    i++;
                }
                // '{'
                if (!this.code.startsWith('{',i)) {
                    this.error(i,this.code,["関数の定義に問題があります2"]);
                    return false;
                }
                i+=1;
                // <block> '}'
                let brccnt = 1;
                while (i<this.code.length) {
                    // <block> ::= <stat> { <blank-lines> <stat> }
                    // ; <block> の中では、 <string> の中以外で組になっていない '{' '}' が出てくることはない
                    if (this.code[i]=="\"") { // <string-symbol> // 文字列内の括弧を無視する
                        // <string> ::= <string-symbol> <string-letters> <string-symbol>
                        // <string-symbol> ::= '"'
                        // <string-letters> ::= { <string-letter> }
                        // ; <string-letter>内で<string-symbol>を使用する場合は、( '\' <string-symbol> )のようにバックスラッシュを付ける
                        // ; <string-letter>内で '\' を使用する場合は、 '\\' のように2つ続ける
                        // ; エスケープは '\' と1文字の合計2文字で構成される
                        func.block += this.code[i];
                        i++;
                        //  <string-letters> <string-symbol>
                        while (i<this.code.length) {
                            // ; <string-letter> 内で<string-symbol>を使用する場合は、( '\' <string-symbol> )のようにエスケープする
                            // ; <string-letter> 内で '\' を使用する場合は、 '\\' のようにエスケープする
                            // ; <string-letter> 内で、エスケープに使われない '\' は認められない
                            if (this.code[i]=="\\") {
                                func.block += this.code[i];
                                // ; エスケープは '\' と1文字の合計2文字で構成される
                                i++;
                            }
                            if (this.code[i]=="\"") { // <string-symbol>
                                break;
                            }
                            func.block += this.code[i];
                            i++;
                        }
                    }
                    else if (this.code[i]=="{") {
                        brccnt++;
                    }
                    else if (this.code[i]=="}") {
                        brccnt--;
                    }
                    if (brccnt==0) {
                        break;
                    }
                    func.block += this.code[i];
                    i++;
                }
                if (this.functions[func.name]!=null) {
                    this.error(i,this.code,["関数の定義に問題があります1","同じ名前の関数は定義できません",func.name]);
                    return false;
                }
                this.functions[func.name] = func;
                this.info([func.name,"関数を読み込みました"]);
            }
            else if (this.code[i]==" ") {
            }
            else if (this.code[i]=="\n"|(this.code[i]=="\r"&&this.code[i+1]=="\n"&&i++)|this.code[i]=="\0") {
            }
            else {
                this.error(i,this.code,["関数の定義に問題があります1","トップレベルに関数、改行、空白以外が存在します'",this.code[i],"'"]);
                return false;
            }
            i++;
        }
    }
}

{
let testcode = `
!void:fn:main(){
    10;
}

! int:fn: sub(int:x) {
    10;
    "";
    "abc";
    "\\n\\n";
    "ab\\0c\\{aaa" "{" +;
}

! int:fn: add(int:x,int:y){
    return;
}
`
testcode = `
! void:fn:main() {(100)run;}
!void:fn: run(int:max) {
    !int: x;
    !int: y;
    !int: z;
    1 => x;
    1 => y;
    1 => z;
    while (x max <) {
        (x)out;
        y x + => z;
        y => x;
        z => y;
    }
}
`
testcode = `
!void:():fn:main {
    (100)run;
    "string//comment test" => !string: s;
}
// comment
!void:(int:max):fn: run {
    1 => !int: x;
    1 => !int: y;
    1 => !int: z;
    !ctrl:(x max <):while {
        (x)out;
        y x + => z;
        y => x;
        z => y;
    }
}
`
// testcode = `
// !void:():fn:main{(100)run;}
// !void:(int:max):fn:run{1 =>!int:x;1 =>!int:y;1 =>!int:z;while(x max <){(x)out;y x + =>z;y =>x;z =>y;}}
// `
new NLPparse(testcode);
}