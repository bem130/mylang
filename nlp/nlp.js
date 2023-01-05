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
    toplevel() {
        // <code> ::= { <blank-lines> <func> <blank-lines> }
        let i = 0;
        while (i<this.code.length) {
            // <func> ::= '!' [ <space> ] 'fn:' <func-name> '(' <func-def-arg> ')' [ <space> ] '{' <block> '}'
            if (this.code[i]=='!') { // '!'
                // [ <space> ]
                i++;
                while (i<this.code.length&&this.code[i]==" ") {i++;}
                // 'fn:'
                if (this.code.startsWith('fn:',i)) {
                    i+=3;
                    let func = {name:""};
                    // <func-name> '('
                    while (i<this.code.length&&this.code[i]!="(") {
                        func.name += this.code[i];
                        i++;
                    }
                    console.log(func.name);
                }
                else {
                    console.error("fn:がありません");
                }
            }
            else if (this.code[i]==" ") {
            }
            else if (this.code[i]=="\n"|(this.code[i]=="\r"&&this.code[i+1]=="\n")|this.code[i]=="\0") {
            }
            else {
                console.log(this.code[i])
                console.error("トップレベルに関数、改行、空白以外が存在します");
            }
            i++;
        }
    }
}



{
    let testcode = `
        !fn:main(
        ! fn:sub(
    `
    new NLPparse(testcode);
}
console.log("hello")