class NLPC {
    constructor (program) {
        this.prog = program;
    }
    make() {
        this.asm = "";
        this.sstack = 1020-1; // for stack
        this.sptr = 1020; // address of the ponter

        let functiondefs = this.topleveldefinition(this.prog);
        let remakefuncdeftable = function(funcs) {
            let ret = [];
            for (let func of funcs) {ret.push({name:func[0],args:func[1]});}
            return ret;
        }

       // console.log("functions:");
       // console.table(remakefuncdeftable(functiondefs));
        let functions = this.toplevel(this.prog);

        let remakefunctable = function(funcs) {
            let ret = [];
            for (let func of funcs) {ret.push({name:func[0],args:func[1],child:func[2]});}
            return ret;
        }
       console.log("functions:");
       console.table(remakefunctable(functions));


        this.cr = [];

        this.vars = [];
        this.oprs = ["+","-","*","add","sub","mul","and","or","xor","not","buffer","inc","dec","rshift","lshift","=",">","<","equ","less","gret","get","out","return","vmov"];
        this.oprasms = ["add","sub","mul","add","sub","mul","and","or","xor","not","buffer","inc","dec","rshift","lshift","equ","less","gret","equ","less","gret","get","out","ret","vmov"];

        this.objcnt = {"if":0,"while":0,};
        for (let i=0;i<functions.length;i++) {

            if (this.oprs.indexOf(functions[i][0])!=-1) {
                console.error("error");
                continue;
            }
            if (["0","1","2","3","4","5","6","7","8","9","#","$","&"].indexOf(functions[i][0][0])!=-1) {
                console.error("function names must not start with numbers and symbols");
                continue;
            }

            this.cr.push([5,functions[i][0]]);

            console.log(functions[i])
            this.makechild(functions[i][2]);

        }
        { // 組み込み関数
        }
        this.cr.push([5,"#callmain"]);
        this.cr.push([6,"main"]);

        this.add("ssp",this.vars.length);
        this.add("jmp","#callmain");
        this.add("");

        let indent = 0;
        for (let i=0;i<this.cr.length;i++) {
            switch (this.cr[i][0]) {
                case 0:
                    this.add("push",this.cr[i][1],indent);
                break;
                case 1:
                    this.add(this.oprasms[this.oprs.indexOf(this.cr[i][1])],"",indent);
                break;
                case 2:
                    this.add("push",this.vars.indexOf(this.cr[i][1]),indent);
                    this.add("popvar","",indent);
                break;
                case 3:
                    this.add("push",this.vars.indexOf(this.cr[i][1]),indent);
                    this.add("pushvar","",indent);
                break;
                case 5:
                    indent = 0;
                    this.add("label",this.cr[i][1],indent);
                    indent++;
                break;
                case 6:
                    this.add("call",this.cr[i][1],indent);
                break;
                case 7:
                    this.add(";",this.cr[i][1],indent);
                    indent++;
                break;
                case 8:
                    indent--;
                    this.add("label",this.cr[i][1],indent);
                break;
                case 9:
                    this.add("label",this.cr[i][1],indent);
                    indent++;
                break;

                default:
                    this.add(this.cr[i][0],this.cr[i][1],indent);
                break;
            }
        }

       // console.log("variables:",this.vars)

        return this;
    }
    intrinsicfunc() {
        let intrinsicFunction = {
            "vmov":function() {
                this.cr.push([5,"vmov"]);
            }
        }
        return intrinsicFunction;
    }
    topleveldefinition(program) {
        let functionnames = [];
        let codes = program.split("\n");
        let fcode = "";
        let itmain = false;
        for (code of codes) {
            let spc = 0;
            while (code[spc]==" ") {spc++;}
            code = code.slice(spc);
            if (code.indexOf(";")!=-1) {code = code.slice(0,code.indexOf(";"));}
            code+=";";
            if (code.length>1) {fcode+=code.replace(/{;/g,"{").replace(/};/g,"}");}
        }
        let cc = 0;
        while (cc<fcode.length) {
            if (fcode[cc]!="!") {
                console.log("can't define anything that isn't a function in the top-level");
            }
            else {
                cc++;
                let funcname = "";
                while(fcode[cc]!="(") { // 関数名
                    funcname += fcode[cc];cc++;
                }
                let brcnt = 1;
                let args = "";
                while(!(brcnt==0&&fcode[cc]==")")) { // 引数
                    cc++;
                    if (fcode[cc]=="(") {brcnt++;}
                    else if (fcode[cc]==")") {brcnt--;}
                    args+=fcode[cc];
                }
                args = args.slice(0,args.length-1);
                brcnt = 0;
                while(!(brcnt==0&&fcode[cc]=="}")) { // 関数の中身
                    cc++;
                    if (fcode[cc]=="{") {brcnt++;}
                    else if (fcode[cc]=="}") {brcnt--;}
                }
                if (funcname=="main") {itmain=true;}
                functionnames.push([funcname,args]);
            }
            cc++;
        }
        if (!itmain) {console.error("there is not the main function");return [];}
        return functionnames;
    }
    toplevel(program) {
        let functions = [];
        let codes = program.split("\n");
        let fcode = "";
        for (code of codes) {
            let spc = 0;
            while (code[spc]==" ") {spc++;}
            code = code.slice(spc);
            if (code.indexOf(";")!=-1) {code = code.slice(0,code.indexOf(";"));}
            code+=";";
            if (code.length>1) {fcode+=code.replace(/{;/g,"{").replace(/};/g,"}");}
        }
        let cc = 0;
        while (cc<fcode.length) {
            if (fcode[cc]!="!") {
                console.log("can't define anything that isn't a function in the top-level");
            }
            else {
                cc++;
                let funcname = "";
                while(fcode[cc]!="(") { // 関数名
                    funcname += fcode[cc];cc++;
                }
                let brcnt = 1;
                let args = "";
                while(!(brcnt==0&&fcode[cc]==")")) { // 引数
                    cc++;
                    if (fcode[cc]=="(") {brcnt++;}
                    else if (fcode[cc]==")") {brcnt--;}
                    args+=fcode[cc];
                }
                args = args.slice(0,args.length-1);
                brcnt = 0;
                let child = "";
                while(!(brcnt==0&&fcode[cc]=="}")) { // 関数の中身
                    cc++;
                    if (fcode[cc]=="{") {brcnt++;}
                    else if (fcode[cc]=="}") {brcnt--;}
                    child+=fcode[cc];
                }
                child = child.slice(1,child.length-1);
                console.log(child)
                child = this.parsechild([child],funcname);
                functions.push([funcname,args,child]);
            }
            cc++;
        }
        return functions;
    }
    block(blkcode) {
        let codes = blkcode.split(";")[0];
        {
            let code = codes;
            // console.log("code",code)
            let sp = code.split(" ");
            let spa = sp.indexOf("=>");
            if (!(spa==sp.length-2||spa==-1)) {
                console.error("assignment error");
            }
            else if (spa==-1) {
            }
            else if (spa==sp.length-2) {
                if (this.vars.indexOf(sp[sp.length-1])==-1&&this.oprs.indexOf(sp[sp.length-1])==-1) {
                    this.vars.push(sp[sp.length-1]);
                }
                // console.log(code,spa,sp)
            }


            for (let i=0;i<sp.length;i++) {
                if (this.oprs.indexOf(sp[i])!=-1) { // 演算子
                    this.cr.push([1,sp[i]]);
                }
                else if (sp[i]=="=>") { // 代入
                    this.cr.push([2,sp[i+1]]);
                    i++;
                }
                else if (["false","true"].indexOf(sp[i])!=-1) { // 論理値
                    this.cr.push([0,[["false","true"].indexOf(sp[i])]]);
                }
                else if (sp[i][0]=="!") { // 関数呼び出し
                    this.cr.push([6,sp[i].slice(1)]);
                }
                else if (this.vars.indexOf(sp[i])!=-1) { // 変数
                    this.cr.push([3,sp[i]]);
                }
                else if (parseInt(sp[i])!=NaN) { // 数字
                    this.cr.push([0,parseInt(sp[i])]);
                }
            }
        }
    }
    makechild(block) {
        
        for (let fcc=0;fcc<block.length;fcc++) {

            if (typeof block[fcc] === 'object') {
                // console.log(block[fcc])
                switch (block[fcc].type) {
                    case "block":
                        this.makechild(block[fcc].child);
                    break;
                    case "if":
                        this.ifstat(block[fcc]);
                    break;
                    case "while":
                        console.log("aaa")
                        this.whilestat(block[fcc]);
                    break;
                }
            }
            else {
                this.block(block[fcc]);
            }


        }
    }
    ifstat(ifobj) {
        this.objcnt["if"]++;
        let thisifn = this.objcnt["if"];
        this.cr.push([7,"ifbegan"+thisifn]);
        this.block(ifobj.condition+";");
        this.cr.push(["ifjmp","#ifend"+thisifn]);
        this.makechild(ifobj.then);
        this.cr.push([8,"#ifend"+thisifn]);
    }
    whilestat(whileobj) {
        console.log("fa")
        this.objcnt["while"]++;
        let thisifn = this.objcnt["while"];
        this.cr.push([9,"#whilebegan"+thisifn]);
        this.block(whileobj.condition+";");
        this.cr.push(["ifjmp","#whileend"+thisifn]);
        this.makechild(whileobj.then);
        this.cr.push(["jmp","#whilebegan"+thisifn]);
        this.cr.push([8,"#whileend"+thisifn]);
    }
    parsechild(blocks) {

        let child = [];
        for (let i=0;i<blocks.length;i++) {
            let fcode = blocks[i];
            let cc = 0;
            let coms = "";
            while (cc<fcode.length) {
                if (fcode[cc]=="{") { // ブロック
                    if (coms.length>1) {
                        child.push(coms);
                        coms = "";
                    }

                    let brcnt = 1;
                    let conte = "";
                    while(!(brcnt==0&&fcode[cc]=="}")) { // ブロックの中身
                        cc++;
                        if (fcode[cc]=="{") {brcnt++;}
                        else if (fcode[cc]=="}") {brcnt--;}
                        conte+=fcode[cc];
                    }
                    conte = conte.slice(0,conte.length-1);
                    conte = this.parsechild([conte]);
                    child.push({type:"block",child:conte,});
                }
                else if (fcode.startsWith('if',cc)) { // if文
                    if (coms.length>1) {
                        child.push(coms);
                        coms = "";
                    }
    
                    console.log("found the if statemet")
                    cc+=2;
                    let brcnt = 1;
                    let condit = "";
                    while(!(brcnt==0&&fcode[cc]==")")) { // 条件式
                        cc++;
                        if (fcode[cc]=="(") {brcnt++;}
                        else if (fcode[cc]==")") {brcnt--;}
                        condit+=fcode[cc];
                    }
                    condit = condit.slice(0,condit.length-1);
                    brcnt = 0;
                    let thens = "";
                    while(!(brcnt==0&&fcode[cc]=="}")) { // ifの中身
                        cc++;
                        if (fcode[cc]=="{") {brcnt++;}
                        else if (fcode[cc]=="}") {brcnt--;}
                        thens+=fcode[cc];
                    }
                    thens = thens.slice(1,thens.length-1);
                    thens = this.parsechild([thens]);
                    child.push({type:"if",condition:condit,then:thens,});
                }
                else if (fcode.startsWith('while',cc)) { // while文
                    if (coms.length>1) {
                        child.push(coms);
                        coms = "";
                    }

                    console.log("found the while statemet")
    
                    cc+=5;
                    let brcnt = 1;
                    let condit = "";
                    while(!(brcnt==0&&fcode[cc]==")")) { // 条件式
                        cc++;
                        if (fcode[cc]=="(") {brcnt++;}
                        else if (fcode[cc]==")") {brcnt--;}
                        condit+=fcode[cc];
                    }
                    condit = condit.slice(0,condit.length-1);
                    brcnt = 0;
                    let thens = "";
                    while(!(brcnt==0&&fcode[cc]=="}")) { // whileの中身
                        cc++;
                        if (fcode[cc]=="{") {brcnt++;}
                        else if (fcode[cc]=="}") {brcnt--;}
                        thens+=fcode[cc];
                    }
                    thens = thens.slice(1,thens.length-1);
                    console.log("while found",condit,thens)
                    thens = this.parsechild([thens]);
                    console.log("while found",condit,thens)
                    child.push({type:"while",condition:condit,then:thens,});
                }
                else {
                    coms += fcode[cc];
                }
                cc++;
            }
            if (coms.length>1) {
                let scoms = coms.split(";");
                //console.log("coms",coms)
                for (let s=0;s<scoms.length;s++) {
                    //console.log(scoms[s])
                    let [formu,ttype] = this.parseformula(scoms[s]);
                    //console.log("formu:",formu);
                    //console.log("ttype:",ttype);
                    let td = this.transformula(formu,ttype);
                    let tdformu = td[0]
                    let tdttype = td[1]
                    // console.log(" ");
                    //console.log("result:",tdformu.join(" "));
                    // console.log(" ");
                    for (let j=0;j<tdformu.length;j++) {
                        if (tdttype[j]=="fun") {
                            tdformu[j] = "!"+tdformu[j];
                        }
                    }
                    child.push(tdformu.join(" "));
                }
                coms = "";
            }
        }
        // console.log(child)
        // console.log("")
        if (child[child.length-1]==""){
            child.pop();
        }
        return child;
    }
    parseformula(fotxt) {
       // console.log("input:",fotxt);
        if (fotxt[0]=="+") {
            fotxt = fotxt.slice(1);
        }
        else if (fotxt[0]=="-") {
            fotxt = "0"+fotxt;
        }
        fotxt = fotxt.replace(/\(\+/,"(").replace(/\(\-/,"(0-");
        let formu = [];
        let ttype = [];
        let nums = ["0","1","2","3","4","5","6","7","8","9"];
        let opr = ["^","*","+","-","<",">","!=","=>"];
        let ft = "";
        let tmpa = "";
        let ptmpa = "";
        let revtxt = function(text) {
            text = text.split("");
            let ret = [];
            while (text.length>0) {
                ret.push(text.pop());
            }
            return ret.join("");
        }
        fotxt = revtxt(fotxt);
        for (let i=0;i<fotxt.length;i++) {
            let bft = ft;
            ptmpa = fotxt[i];
            if (false){}
            else if (fotxt[i]==" ") {continue;}
            else if (fotxt[i]==",") {ft="com";}
            else if (fotxt[i]=="(") {ft="bro";}
            else if (fotxt[i]==")") {ft="brc";}
            else if (nums.indexOf(fotxt[i])!=-1) {ft="num";}
            else {
                ft="var";
                for(let oc=0;oc<opr.length;oc++) {
                    if (fotxt.slice(i).startsWith(revtxt(opr[oc]))) {
                        //console.log(opr[oc])
                        i+=opr[oc].length-1;
                        ft = "opr";
                        ptmpa = opr[oc];
                    }
                }
            }
            if (bft != ft && tmpa.length>0) {
                formu.push(tmpa);
                ttype.push(bft);
                tmpa = "";
            }
            //console.log(fotxt.slice(i))
            tmpa = ptmpa+tmpa;
        }
        if (tmpa.length>0) {
            formu.push(tmpa);
            ttype.push(ft);
            tmpa = "";
        }
       // console.log(formu)
        for (let i=0;i<formu.length;i++) {
            if (ttype[i]=="num") {
                formu[i] = Number(formu[i]);
            }
            if (ttype[i]=="bro"&&ttype[i+1]=="var") {
                ttype[i+1] = "fun"
            }
        }
        let rformu = []
        let rttype = []
        while (formu.length>0) {
            rformu.push(formu.pop());
            rttype.push(ttype.pop());
        }
        // console.log("formu:",formu);
        // console.log("ttype:",ttype);
        return [rformu,rttype];
    }
    transformula(fotokens,tokenstype) {
        let res = [];
        let resty = [];
        let roprs = [];
        let precd = {
            "^":[5,"r"],
            "*":[4,"l"],
            "+":[3,"l"],
            "-":[3,"l"],
            ">":[2,"l"],
            "<":[2,"l"],
            "!=":[1,"l"],
        }

        let tokass = []
        let typass = []
        if (fotokens.indexOf("=>")!=-1) {
           // console.log("fotokens",fotokens)
            tokass = fotokens.slice(fotokens.indexOf("=>"))
            typass = ["opr","var"]
            fotokens = fotokens.slice(0,fotokens.indexOf("=>"))
        }
       // console.log("fotokens",fotokens)

        for (let foc=0;foc<fotokens.length;foc++) {
            let fo = fotokens[foc];
            let tt = tokenstype[foc];
            if (false) {}
            else if (tt=="num"||tt=="var") {
                res.push(fo);
                resty.push(tt);
            }
            else if (tt=="fun") {
                roprs.push([fo,"fun"]);
            }
            else if (tt=="com") {
                while (roprs.length>0) {
                    let sto = roprs.pop();
                    if (sto[0]=="(") {
                        break;
                    }
                    res.push(sto[0]);
                    resty.push(sto[1]);
                }
            }
            else if (tt=="opr") {
                while (roprs.length>0) {
                    let sto = roprs.pop();
                    //console.log(sto,fo);
                    if (precd[sto[0]]!=null&&((precd[sto[0]][1]=="l"&&precd[sto[0]][0]>=precd[fo][0])||precd[sto[0]][0]>precd[fo][0])) {
                        res.push(sto[0]);
                        resty.push("opr");
                    }
                    else {
                        roprs.push(sto);
                        break;
                    }
                }
                roprs.push([fo,"opr"]);
            }
            else if (tt=="bro") {
                roprs.push([fo,"bra"]);
            }
            else if (tt=="brc") {
                while (roprs.length>0) {
                    let sto = roprs.pop();
                    if (sto[0]=="(") {
                        break;
                    }
                    res.push(sto[0]);
                    resty.push(sto[1]);
                }
                let tgs = roprs.pop();
                if (tgs!=null&&tgs[1]=="fun") {
                    res.push(tgs[0]);
                    resty.push(tgs[1]);
                }
                else roprs.push(tgs);
            }
        }
        while (roprs.length>0) {
            let sto = roprs.pop();
            if (sto!=null) {
                res.push(sto[0]);
                resty.push(sto[1]);
            }
        }

        //console.log("parsed",res,resty)
        res = res.concat(tokass)
        resty = resty.concat(typass)
        //console.log("parsed",res,resty)
        return [res,resty];

    }
    add(ins,imme="",indent=0) {
        imme = imme.toString();
        for (let i=0;i<indent*4;i++) {
            this.asm += " ";
        }
        if (ins=="label") {
            this.asm += imme+":"+"\n";
            return;
        }
        if (imme.length>0) {
            this.asm += ins+" "+imme+"\n";
        }
        else {
            this.asm += ins+"\n";
        }
    }
}

let code

prog = `

!main(){
    1 => x;
    1 => y;
    1 => z;
    100 => c;
    run();
    return;
}
!run(){
    while(x c <){
        out(x);
        y+x => z;
        y => x;
        z => y;
    }
    return;
}
!test(a){
    out(x);
    return;
}

`;
console.log("");
console.log("---- code ----");
console.log(prog);
console.log("--------------");
console.log("");

code = new NLPC(prog).make();


console.log("");
console.log("---- asm ----");
console.log(code.asm);
console.log("--------------");
console.log("");

// formu = [12,"+",10,"*",2];
// ttype = ["num","opr","num","opr","num"];
// console.log(formu);
// console.log("result:",code.transformula(formu,ttype));
// console.log(" ");

// formu = ["(",12,"+",10,")","*",2];
// ttype = ["bro","num","opr","num","brc","opr","num"];
// console.log(formu);
// console.log("result:",code.transformula(formu,ttype));
// console.log(" ");

// [formu,ttype] = code.parseformula("15+56*(1+5)");
// console.log(" ");
// console.log("result:",code.transformula(formu,ttype));
// console.log(" ");

// [formu,ttype] = code.parseformula("54+sin(12)*4");
// console.log(" ");
// console.log("result:",code.transformula(formu,ttype));
// console.log(" ");

// [formu,ttype] = code.parseformula("-5+1");
// console.log(" ");
// console.log("result:",code.transformula(formu,ttype));
// console.log(" ");

// [formu,ttype] = code.parseformula("-(5+1)");
// console.log(" ");
// console.log("result:",code.transformula(formu,ttype));
// console.log(" ");

// [formu,ttype] = code.parseformula("1+(-1)");
// console.log(" ");
// console.log("result:",code.transformula(formu,ttype));
// console.log(" ");

// [formu,ttype] = code.parseformula("sin(x)+x");
// console.log(" ");
// console.log("result:",code.transformula(formu,ttype));
// console.log(" ");

// [formu,ttype] = code.parseformula("add(a,b+5)");
// console.log(" ");
// console.log("result:",code.transformula(formu,ttype));
// console.log(" ");

// [formu,ttype] = code.parseformula("45vmov21");
// console.log(" ");
// console.log("result:",code.transformula(formu,ttype));
// console.log(" ");