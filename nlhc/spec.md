# 自然言語にプログラムの考えを

意思疎通のための言語にプログラミングの考え方をぶち込む

オブジェクト指向 型 型変換 型推論

## ノード
```
class sentencenode {
}
class verbnode {
    args: 引数, // node
    tense: 時制, // 過去 現在 未来
    state: 状態, // 継続 断続 起動 完了 結果 終止
    view: 態, // 受動 能動 交互
    sence: 感覚, // 使役 自発 尊敬
    meaning: 意味, // s c
}
class nounnode {
    meaning: 意味, // o
    case: 格, // 主格 所有格 与格 奪格
    args: 引数, // o node
}
class adjectivenode {
    meaning: 意味, // l f
    args: 引数, // s c node
}
class conjunctionnode {
    meaning: 意味, // s c
    args: 引数, // s c o node
}
```

## 単語
単語の意味は、階層構造で表される
- s 状態 state
- c 変化 change
- o 名前 object
- d 数字 digit
- u 単位 unit
- l 見た目 looks
- f 感覚 feeling
```
class word {
    name: 名前,
    meaning: {
        o: {
            "意味": {
                意味,
                意味,
            },
            "意味": {
                意味,
                意味,
            },
        },
        c: {
            "意味",
        },
    }
}
```

## 例
`私は私の赤いバラと貴方の赤いコスモスを同じだと思う`
`私は {「≪【私の (赤い [バラ])】 と 【貴方の (赤い [コスモス])】を≫ 同じだ」 と思う}`
```js
{
    "意味": "(sentence)平叙文",
    "引数": {
        "意味": "(noun)1人称人物",
        "格": "主格",
        "引数": {
            "意味": "(verb)思考",
            "態": "能動",
            "時制": "現在",
            "引数": {
                "意味": "(sentence)平叙文",
                "引数": {
                    "意味": "(verb)同じ",
                    "引数": {
                        "意味": "(conjunction)列挙",
                        "引数": [
                            {
                                "意味": "(noun)1人称人物",
                                "格": "所有格",
                                "引数": {
                                    "意味": "(adjective)赤",
                                    "引数": {"意味": "(noun)バラ"}
                                }
                            },
                            {
                                "意味": "(noun)2人称人物",
                                "格": "所有格",
                                "引数": {
                                    "意味": "(adjective)赤",
                                    "引数": {"意味": "(noun)コスモス"}
                                }
                            }
                        ]
                    }
                }
            }
        }
    }
}
```
```
(sentence)平叙文{(noun)1人称人物{(verb)思考-能動-現在{(sentence)平叙文{(verb)同じ{(conjunction)列挙{(noun)1人称人物-所有格{(adjective)赤{(noun)バラ}},(noun)2人称人物-所有格{(adjective)赤{(noun)コスモス}}}}}}}}。
```
```
平叙文 1人称人物 (verb)思考-能動-現在 平叙文 (verb)同じ 列挙 1人称人物-所有格 (adjective)赤 バラ, 2人称人物-所有格 (adjective)赤 コスモス。
```
```
私 考える-自分で-いま 同じ わたし-の 赤い バラ と あなた-の 赤い コスモス。
```