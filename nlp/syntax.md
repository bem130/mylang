# 構文

## 文字
```bnf
<space> ::= ( ' ' )+
<empty-text> ::= ''
<eol> ::= '\n' | '\r\n'
<eols> ::= <eol>+
<blank-lines> ::= { ( [ <space> ] | [ <eols> ] ) }
```

## コード
```bnf
<toplevel-member> ::= <func>
<code> ::= <toplevel-member> { <blank-lines> <toplevel-member> }
```

## 関数
```bnf
<func> ::= '!' [ <space> ] <var-type> ':fn:' [ <space> ] <func-name> '(' <func-arg-def> ')' { ( <space> | <eol> ) } '{' <block> '}'
<func-def-arg> ::= <var-type> ':' <var-name>
<func-arg-def> ::= ( <empty-text> | <func-def-arg> | <func-def-arg> { ',' <func-def-arg> } )
```
## 関数の呼び出し
```bnf
<func-call> ::= '(' <func-arg-def> ')' <func-name>
```

## ブロック
```bnf
<block> ::= <stat> { <blank-lines> <stat> }
; <block> の中では、 <string> の中以外で組になっていない '{' '}' が出てくることはない
```

## 文
```bnf
<stat> :== ( <stat-var-declaration> | <stat-var-assign> | <stat-run-expr> )
```
### 変数の宣言
```bnf
<stat-var-declaration> ::= '!' [ <space> ] <var-type> ':' [ <space> ] <var-name> [ <space> ] ';'
```
### 初期化付の変数の宣言
```bnf
<stat-var-declaration> ::= <expr> [ <space> ] '=>' [ <space> ] '!' [ <space> ] <var-type> ':' [ <space> ] <var-name> [ <space> ] ';'
```
### 変数への代入
```bnf
<stat-var-assign> ::= <expr> [ <space> ]  '=>' [ <space> ]  <var-name> [ <space> ] ';'
```
### 式を実行
```bnf
<stat-run-expr> ::= <expr> [ <space> ] ';'
```

## 式
```bnf
<value> ::= <value> <space> <value> <space> <operator> | <value> <space> <operator> | <immediate>
<expr> ::= <value>
```

## コメント
```bnf
<inline-commnet> ::= '//' { <letter> } ( <eol> | <eof> )
<block-comment> ::= '/*' { ( <letter> | <eol> ) } '*/'
```

## 演算子
```bnf
<operator-arithmetic> ::= ( '+' | '-' | '*' | '/' | '^' )
<operator-logical> ::= ( '!' | '&' | '|' | '' )
<operator-general> ::= ( '=' , '!=' )
```

## 構造
```bnf
<condition> :== <expr>
<struct-if> ::= 'while' [ <space> ] '(' <condition> ')' [ <space> ] '{' <block> '}'
<struct-while> ::= 'while' [ <space> ] '(' <condition> ')' [ <space> ] '{' <block> '}'
```

## 型の即値
### 数値
```bnf
<digit-excluding-zero> ::= ( '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' )
<digit> ::= <digit-excluding-zero> | '0'
<natural-number> ::= <digit-excluding-zero> { <digit> }
<number> ::= ( [ '-' ] <natural-number>+ [ '.' <digit>+ ] | '0' )
```
### 真理値
```bnf
<bool> ::= 'true' | 'false'
```
### 文字列
```bnf
<string> ::= <string-symbol> <string-letters> <string-symbol>
<string-symbol> ::= '"'
<string-letters> ::= { <string-letter> }
; <string-letter> 内で<string-symbol>を使用する場合は、( '\' <string-symbol> )のようにエスケープする
; <string-letter> 内で '\' を使用する場合は、 '\\' のようにエスケープする
; <string-letter> 内で、エスケープに使われない '\' は認められない
; エスケープは '\' と1文字の合計2文字で構成される
```
### 配列
```bnf
```