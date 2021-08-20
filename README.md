# What is this
This is a small utility for inputting and translating Japanese. 
It tackles a big problem with the conventional pronunciation-based approach which is the fact that you need to know how to pronounce kanji in order to even start using it.
However, effective methods for learning kanji (like the [one proposed by Heisig](https://www.amazon.com/Remembering-Kanji-Complete-Japanese-Characters-ebook/dp/B086763LWC))
often separate learning the meanings and the pronunciations of kanji, thus leaving you unable to type in Japanese. 

My Japanese input helper solves this problem by allowing you to search for kanji by their meanings. You can try it [here](https://barditheweird.github.io/japanese-input-helper/)

# How to use it
## Inputting kana
Almost every sentence in Japanese uses hiragana, and katakana isn't that uncommon either. 
They are usually typed by transliterating romaji (a way of writing Japanese sounds using Latin script). That's how I decided to tackle this problem as well.

You type in romaji, select the portion you want to transliterate and click a button corresponding to the kana you want. 

![](https://raw.githubusercontent.com/BardiTheWeird/japanese-input-helper/main/gifs/transliteration.gif)

## Searching for kanji
To search for a kanji, you type its meaning, select it and click "Find kanji"

![](https://raw.githubusercontent.com/BardiTheWeird/japanese-input-helper/main/gifs/kanji-search.gif)

In order to insert a kanji, you click its corresponding row

![](https://raw.githubusercontent.com/BardiTheWeird/japanese-input-helper/main/gifs/kanji-insertion.gif)

You can also  get more information about the kanji by clicking "More..."

![](https://raw.githubusercontent.com/BardiTheWeird/japanese-input-helper/main/gifs/kanji-read-more.gif)

## Translating
To translate the text you inputted, simply click the button with a name of a translation provider you wish to use. 
"Google" displays results on the same page, while "DeepL" opens up a DeepL translator page.

![](https://raw.githubusercontent.com/BardiTheWeird/japanese-input-helper/main/gifs/translation.gif)

## Shortcuts:
Transliteration:
* Ctrl+H: To hiragana
* Ctrl+K: To katakana
* Ctrl+R: To romaji

Kanji search:
* Ctrl+F: Search for selected text
* Ctrl+id: Insert kanji in the row corresponding to the number you clicked. Only 1 through 5 are allowed

Translation:
* Ctrl+Enter: Translate using Google
* Ctrl+Shift+Enter: Translate using DeepL (opens in a new page)

Misc:
* Ctrl+Z: Undo
* Ctrl+Shift+Z: Redo

# Implementation details
Kanji search by meaning utilizes a trigram search. There are two implementations of it. One uses trigram extensions of the PostgreSQL database, while the other uses a custom trigram index written in C#. The deployed application uses the latter as it produces more accurate results.

Transliteration is implemented using a decoder tree with greedy matches. 

# Deployment details
The front-end is hosted on GitHub Pages, while the back-end API is deployed as a Docker container on an AWS EC2 instance.
