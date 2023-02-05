class NLPparse {
    constructor(code) {
        this.code = code+"\0";
        this.delete_comments();
        console.log(this.code)
        this.functions = {};
        this.toplevel_parse();
        this.parsed = {};
        console.log(this.functions)
        let functionnames = Object.keys(this.functions);
        for (let name of functionnames) {
            this.info([name,"関数の内容を読み込みます"]);
            let block = this.block_parse(this.functions[name].block);
            console.log(block)
            this.parsed[name] = block;
            if (block==false) {
                return false;
            }
        }
        return this.parsed;
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
    stat_parse(stat_code,ofs) {
        let list = [];
        let i = 0;
        let code = "";
        while (i<stat_code.length+1) {
            if (stat_code[i]==" ") {
                // console.log(code,0)
                if (code!="") {
                    list.push(code,ofs);
                }
                code = "";
                i++;
            }
            else if (i==stat_code.length) {
                // console.log(code,0)
                if (code!="") {
                    list.push(code,ofs);
                }
                code = "";
            }
            // 文字列
            if (stat_code[i]=="\"") { // <string-symbol> // 文字列内の括弧を無視する
                // <string> ::= <string-symbol> <string-letters> <string-symbol>
                // <string-symbol> ::= '"'
                // <string-letters> ::= { <string-letter> }
                // ; <string-letter>内で<string-symbol>を使用する場合は、( '\' <string-symbol> )のようにバックスラッシュを付ける
                // ; <string-letter>内で '\' を使用する場合は、 '\\' のように2つ続ける
                // ; エスケープは '\' と1文字の合計2文字で構成される
                code += stat_code[i];
                if (code[0]!="\"") {
                    console.log(" [error]")
                }
                i++;
                //  <string-letters> <string-symbol>
                while (i<stat_code.length) {
                    // ; <string-letter> 内で<string-symbol>を使用する場合は、( '\' <string-symbol> )のようにエスケープする
                    // ; <string-letter> 内で '\' を使用する場合は、 '\\' のようにエスケープする
                    // ; <string-letter> 内で、エスケープに使われない '\' は認められない
                    if (stat_code[i]=="\\") {
                        code += stat_code[i];
                        // ; エスケープは '\' と1文字の合計2文字で構成される
                        i++;
                    }
                    if (stat_code[i]=="\"") { // <string-symbol>
                        code += stat_code[i];
                        break;
                    }
                    code += stat_code[i];
                    i++;
                }
            }
            else {
                code += stat_code[i];
            }
            i++;
        }
        // if (true) {
        //     console.log(code,0)
        //     code = "";
        //     i++;
        // }
        return list;
    }
    block_parse(block_code) {
        // <block> ::= { <blank-lines> ( <stat> | <control>) } <blank-lines>
        let list = {var:{},stats:[]};
        let i = 0;
        while (i<block_code.length) {
            let stat = {
                type: "stat",
                assign: "",
                stat: "",
            }
            if ((block_code[i]==" "||(block_code[i]=="\n"|(block_code[i]=="\r"&&block_code[i+1]=="\n"&&i++)))) { // <blank-lines>
                i++;
            }
            else if (block_code[i]=="!") { // 宣言
                i++;
                while (i<block_code.length&&block_code[i]==" ") {i++;} // [ <space> ]
                if (block_code.startsWith('ctrl:',i)) { // <control>
                    // <control> ::= '!' [ <space> ] 'ctrl:(' <condition> '):' <struct-if> | <struct-while>
                    // <condition> ::= ( <stat-var-declaration> | <stat-var-assign> | <stat-run-expr> )
                    // <struct-if> ::= 'if' [ <space> ] '{' <block> '}'
                    // <struct-while> ::= 'while' [ <space> ] '{' <block> '}'
                    let ctrl = {
                        type: "",
                        condition: "",
                        block: "",
                    };
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
                    ctrl.condition = this.stat_parse(ctrl.condition,i)
                    // ':'
                    i++;
                    if (block_code[i]!=':') {
                        this.error(i,block_code,["制御構造の定義に問題があります2"]);
                        return false;
                    }
                    i++;
                    if (block_code.startsWith('if',i)) { // <struct-if> ::= 'if' [ <space> ] '{' <block> '}'
                        ctrl.type = "if";
                        i+=2;
                        while (i<block_code.length&&block_code[i]==" ") {i++;}
                    }
                    else if (block_code.startsWith('while',i)) { // <struct-while> ::= 'while' [ <space> ] '{' <block> '}'
                        ctrl.type = "while";
                        i+=5;
                        while (i<block_code.length&&block_code[i]==" ") {i++;}
                    }
                    else {
                        this.error(i,block_code,["制御構造の定義に問題があります3","制御構造の型がありません"]);
                        return false;
                    }
                    // '{'
                    if (!block_code.startsWith('{',i)) {
                        this.error(i,block_code,["関数の定義に問題があります2"]);
                        return false;
                    }
                    i+=1;
                    // <block> '}' // toplevel()内と同一コード
                    let brccnt = 1;
                    while (i<block_code.length) {
                        if (block_code[i]=="\"") {
                            ctrl.block += block_code[i];
                            i++;
                            while (i<block_code.length) {
                                if (block_code[i]=="\\") {
                                    ctrl.block += block_code[i];
                                    i++;
                                }
                                if (block_code[i]=="\"") {
                                    break;
                                }
                                ctrl.block += block_code[i];
                                i++;
                            }
                        }
                        else if (block_code[i]=="{") {
                            brccnt++;
                        }
                        else if (block_code[i]=="}") {
                            brccnt--;
                        }
                        if (brccnt==0) {
                            break;
                        }
                        ctrl.block += block_code[i];
                        i++;
                    }
                    i++;
                    ctrl.block = this.block_parse(ctrl.block);
                    if (ctrl.block==false) {
                        return false;
                    }
                    list.stats.push(ctrl);
                }
                else {
                    // <stat-var-declaration> ::= '!' [ <space> ] <var-type> ':' [ <space> ] <var-name> [ <space> ]
                    let decl = {
                        var_type: "",
                        var_name: "",
                    }
                    while (i<block_code.length&&block_code[i]!=":") {
                        decl.var_type += block_code[i];
                        i++;
                    }
                    i++;
                    while (i<block_code.length&&block_code[i]==" ") {i++;}
                    while (i<block_code.length) {
                        if (block_code[i]==" ") {
                            i++;
                            while (i<block_code.length&&block_code[i]!=";") {
                                if (block_code[i]!=" ") {
                                    this.error(i,block_code,["変数の定義に問題があります"]);
                                    return false;
                                }
                                i++;
                            }
                            break;
                        }
                        if (block_code[i]==";") {
                            i++;
                            break;
                        }
                        decl.var_name += block_code[i];
                        i++;
                    }
                    if (list.var[decl.var_name]!=null) {
                        this.error(i,block_code,["変数の定義に問題があります","同じブロック内で、同じ名前の変数は定義できません",decl.var_name]);
                        return false;
                    }
                    list.var[decl.var_name] = decl;
                }
            }
            else { // <stat>
                // <stat> ::= ( <stat-var-declaration-assign> | <stat-var-declaration> | <stat-var-assign> | <stat-run-expr> ) ';' // <stat-var-declaration> は、上位の場合分けで別処理になっている
                // <stat-var-declaration-assign> ::= <expr> [ <space> ] '=>' [ <space> ] '!' [ <space> ] <var-type> ':' [ <space> ] <var-name> [ <space> ]
                // <stat-var-assign> ::= <expr> [ <space> ]  '=>' [ <space> ]  <var-name> [ <space> ]
                // <stat-run-expr> ::= <expr> [ <space> ]
                let assign = false;
                while (i<block_code.length) {
                    if (block_code[i]==";") {
                        i++;
                        break;
                    }
                    else if (block_code.startsWith('=>',i)) {
                        i+=2;
                        assign = true;
                        break;
                    }
                    stat.stat += block_code[i];
                    i++;
                }
                if (assign) { // <stat-var-assign> , <stat-var-declaration-assign>
                    while (i<block_code.length&&block_code[i]==" ") {i++;}
                    while (i<block_code.length) {
                        if (block_code[i]==";") {
                            i++;
                            break;
                        }
                        stat.assign += block_code[i];
                        i++;
                    }
                    let si = 0;
                    if (stat.assign[si]=="!") { // '!' // <stat-var-declaration-assign>
                        let decl = {
                            var_type: "",
                            var_name: "",
                        }
                        si++;
                        while (si<stat.assign.length&&stat.assign[si]==" ") {si++;}
                        while (si<stat.assign.length&&stat.assign[si]!=":") {
                            decl.var_type += stat.assign[si];
                            si++;
                        }
                        if (stat.assign[si]!=":") {
                            this.error(i,this.code,["変数の定義に問題があります","コロンがありません"]);
                        }
                        si++;
                        while (si<stat.assign.length&&stat.assign[si]==" ") {si++;}
                        while (si<stat.assign.length) {
                            decl.var_name += stat.assign[si];
                            si++;
                        }
                        if (list.var[decl.var_name]!=null) {
                            this.error(i,block_code,["変数の定義に問題があります","同じブロック内で、同じ名前の変数は定義できません",decl.var_name]);
                            return false;
                        }
                        list.var[decl.var_name] = decl;
                        stat.assign = decl.var_name;
                    }
                }
                else {
                    stat.assign = false;
                }
                stat.stat = this.stat_parse(stat.stat,i);
                list.stats.push(stat);
            }
        }
        return list;
    }
    toplevel_parse() {
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

class NLPcompile_NVE {
    constructor(code) {
        this.parsed = new NLPparse(code);
        console.log(this.parsed);
        this.nameeval();
    }
    nameeval() {
        let functionnames = Object.keys(this.parsed);
        for (let name of functionnames) {
            console.log("関数:",name);
            let block = this.parsed[name];
            console.log(block)
            let vars = Object.keys(block.var);
            console.log("変数:",vars);
        }
    }
    makecode() {
        this.code = [];
        this.code.push(["jmp","#callmain"]);
        this.code.push(["fram",0]);

        let functionnames = Object.keys(this.parsed);
        for (let name of functionnames) {
            let block = this.parsed[name];
            console.log(block)
            this.code.push([name+":"]);
            let vars = Object.keys(block.var);
            console.log("変数:",vars);
            this.code.push(["fram",vars.length]);
            this.code.push(["pop",vars.length]);
        }
        this.code.push(["#callmain"+":"]);
        this.code.push(["pop",0]);
        console.log(this.code)
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
    !ctrl:(true):if {
        100 run;
    }
    100 run;
    "Hello World!" => !string: hw;
    return;
}
// comment
!void:(int:max):fn: run {
    !int: x;
    1 => x;
    1 => !int: y;
    2 number - => !int: z;
    !ctrl:(x max <):while {
        x out;
        y x a + => z;
        y => x;
        z => y;
    }
    return;
}
!int:():fn:number {
    return 1;
}
`
// testcode = `
// !void:():fn:main {
//     1 5 + 5 8 - *;
//     (1,5)+ (5,8)- * ;
//     "aaa" => !string: a;
//     "aaa";
//     "aaa" ;
//     "aaa"a;
//     "aaa" a;
//     a "aaa" a;
//     a "aaa";
//     a"aaa";
//     a"aaa"a;
//     "aaa"a a;
// }
// `
// testcode = `
// !void:():fn:main{(100)run;}
// !void:(int:max):fn:run{1 =>!int:x;1 =>!int:y;1 =>!int:z;while(x max <){(x)out;y x + =>z;y =>x;z =>y;}}
// `
//new NLPparse(testcode);
new NLPcompile_NVE(testcode);
}