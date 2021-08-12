import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DecoderTrie } from 'src/misc/decoderTrie';
import * as to_romajiObj from 'src/assets/to-romaji.json'
import * as to_hiraganaObj from 'src/assets/to-hiragana.json'
import * as to_katakanaObj from 'src/assets/to-katakana.json'

export enum Kana {
  Romaji,
  Hiragana,
  Katakana
}

@Injectable({
  providedIn: 'root'
})
export class TransliterationService {
  private readonly toRomajiTrie : DecoderTrie;
  private readonly toHiraganaTrie : DecoderTrie;
  private readonly toKatakanaTrie : DecoderTrie;

  private trieMap : Map<Kana, DecoderTrie>;

  toKana(str : string, kind : Kana){
    return this.trieMap.get(kind)?.decode(str);
  }

  constructor() {
    const [to_romaji, to_hiragana, to_katakana] = [to_romajiObj, to_hiraganaObj, to_katakanaObj]
      .map(data =>
        Object.keys(data)
        .map(i => data[Number(i)])
        .filter(x => Boolean(x))
      )

    this.toRomajiTrie = new DecoderTrie(to_romaji);
    this.toHiraganaTrie = new DecoderTrie(to_hiragana);
    this.toKatakanaTrie = new DecoderTrie(to_katakana);

    this.trieMap = new Map([
      [Kana.Romaji, this.toRomajiTrie],
      [Kana.Hiragana, this.toHiraganaTrie],
      [Kana.Katakana, this.toKatakanaTrie],
    ]);
  }
}
