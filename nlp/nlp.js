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
        console.error(`[error:${i}]`,...msg)
    }
    info(msg) {
        console.log(`[info]`,...msg)
    }
    toplevel() {
        // <code> ::= { <blank-lines> <func> <blank-lines> }
        let i = 0;
        while (i<this.code.length) {
            // <func> ::= '!' [ <space> ] <var-type> ':fn:' [ <space> ] <func-name> '(' <func-arg-def> ')' [ <space> ] '{' <block> '}'
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
                // 'fn:'
                i++;
                if (!this.code.startsWith('fn:',i)) {
                    this.error(i,["関数の定義に問題があります"]);
                    return false;
                }
                i+=3;
                // [ <space> ]
                i++;
                while (i<this.code.length&&this.code[i]==" ") {i++;}
                // <func-name> '('
                while (i<this.code.length&&this.code[i]!="(") {
                    func.name += this.code[i];
                    i++;
                }
                // <func-arg-def> ')'
                i++;
                while (i<this.code.length&&this.code[i]!=")") {
                    func.args += this.code[i];
                    i++;
                }
                this.info(["関数を読み込みました",func]);
            }
            else if (this.code[i]==" ") {
            }
            else if (this.code[i]=="\n"|(this.code[i]=="\r"&&this.code[i+1]=="\n")|this.code[i]=="\0") {
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
        !void:fn:main()
        ! int:fn: sub (int:x)
        ! int:fn: add (int:x,int:y)
    `
    new NLPparse(testcode);
}