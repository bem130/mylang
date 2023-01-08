class NLPparse {
    constructor(code) {
        this.code = code+"\0";
        this.delete_comments();
        this.toplevel();
    }
    delete_comments() {
        let res = "";
        let i = 0;
        while (i<this.code.length) {
            if (this.code.startsWith("//",i)) {
            }
            else if (this.code.startsWith("/*",i)) {
            }
            i++;
        }
    }
    error(i,msg) {
        console.error(`[error:${i}]`,...msg);
    }
    info(msg) {
        console.log(`[info]`,...msg);
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
                    this.error(i,["引数の括弧がありません"]);
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
                    this.error(i,["関数の定義に問題があります1"]);
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
                    this.error(i,["関数の定義に問題があります2"]);
                    return false;
                }
                i+=1;
                // <block> '}'
                let brccnt = 1;
                while (i<this.code.length) {
                    // <block> ::= <stat> { <blank-lines> <stat> }
                    // ; <block> の中では、 <string> の中以外で組になっていない '{' '}' が出てくることはない
                    if (this.code[i]=="\"") { // <string-symbol>
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
                this.info([func.name,"関数を読み込みました"]);
                console.log(func)
            }
            else if (this.code[i]==" ") {
            }
            else if (this.code[i]=="\n"|(this.code[i]=="\r"&&this.code[i+1]=="\n"&&i++)|this.code[i]=="\0") {
            }
            else {
                this.error(i,["トップレベルに関数、改行、空白以外が存在します'",this.code[i],"'"]);
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
}
!void:(int:max):fn: run {
    1 => !int: x;
    1 => !int: y;
    1 => !int: z;
    while (x max <) {
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