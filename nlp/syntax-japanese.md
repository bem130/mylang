# 構文

## 文字
```bnf
<space> ::= ( ' ' | '　' )+
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
<func> ::= '宣言:' <var-type> 'を返す関数' <func-name> 'を 引数' <func-arg-def> ' 処理「' <block> '」とする。'
<func-def-arg> ::= <var-type> ':' <var-name>
<func-arg-def> ::= ( '無し' | <func-def-arg> | <func-def-arg> { ',' <func-def-arg> } )
```
## 関数の呼び出し
```bnf
<func-call> ::= '引数' <func-arg-def> 'で関数' <func-name> 'を呼び出したもの'
```
## ブロック
## 文
### 変数の宣言
```bnf
<var-declaration> ::= '宣言:' <var-type> 'の変数' <var-name> 'を用意する。'
```
### 変数への代入
```bnf
<var-assign> ::= <expr>  'の値を変数' <var-name> 'へ代入する。'
```
## 式
```bnf
<value> ::= ( <value> 'と' <value> 'の' <operator> | <value> 'と' <value> 'が' <operator-compare> ) | <value> 'の' <operator> | <immediate>
<expr> ::= <value>
```
## コメント
```bnf
<inline-commnet> ::= '//' { <letter> } ( <eol> | <eof> )
<block-comment> ::= '/*' { ( <letter> | <eol> ) } '*/'
```
## 演算子
```bnf
<operator-arithmetic> ::= ( '和' | '差' | '積' | '商' | '冪' )
<operator-logical> ::= ( '否定' | '論理積' | '論理和' )
<operator-compare> ::= ( '等しいか' , '等しくないか' )
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
<bool> ::= '真' | '偽'
```
### 文字列
```bnf
<string> ::= <string-symbol> <string-letters> <string-symbol>
<string-symbol> ::= '「'
<string-symbol-end> ::= '」'
<string-letters> ::= { <string-letter> }
; <string-letter>内で<string-symbol-end>を使用する場合は、( '\' <string-symbol> )のようにバックスラッシュを付ける
; <string-letter>内で'\'を使用する場合は、'\\'のように2つ続ける
```
### 配列
```bnf
```