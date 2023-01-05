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
<code> ::= { <blank-lines> <func> <blank-lines> }
```
## 関数
```bnf
<func> ::= '!' [ <space> ] <var-type> ':fn:' [ <space> ] <func-name> '(' <func-arg-def> ')' [ <space> ] '{' <block> '}'
<func-def-arg> ::= <var-type> ':' <var-name>
<func-arg-def> ::= ( <empty-text> | <func-def-arg> | <func-def-arg> { ',' <func-def-arg> } )
```
## 関数の呼び出し
```bnf
<func-call> ::= '(' <func-arg-def> ')' <func-name>
```
## ブロック
## 文
### 変数の宣言
```bnf
<var-declaration> ::= '!' [ <space> ] <var-type> ':' [ <space> ] <var-name> [ <space> ] ';'
```
### 変数への代入
```bnf
<var-assign> ::= <expr> [ <space> ]  '=>' [ <space> ]  <var-name>
```
## 式
```bnf
<value> ::= <value> ' ' <value> ' ' <operator> | <immediate>
<expr> ::= <value> ( ' ' <value> )+
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
; <string-letter>内で<string-symbol>を使用する場合は、( '\' <string-symbol> )のようにバックスラッシュを付ける
; <string-letter>内で'\'を使用する場合は、'\\'のように2つ続ける
```
### 配列
```bnf
```