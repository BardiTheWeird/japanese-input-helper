import { Component, OnInit } from '@angular/core';
import { CommandsService } from '../commands.service';
import { Kana } from '../transliteration.service';

type toKanaButton = {
  label : string,
  shortLabel : string,
  callback : () => void,
};

@Component({
  selector: 'app-translation-station',
  templateUrl: './translation-station.component.html',
  styleUrls: ['./translation-station.component.css']
})
export class TranslationStationComponent implements OnInit {
  toKanaButtons : toKanaButton[] = [
    { label: 'To Hiragana', shortLabel: '➪か', callback: () => this.onToKana(Kana.Hiragana) },
    { label: 'To Katakana', shortLabel: '➪カ', callback: () => this.onToKana(Kana.Katakana) },
    { label: 'To Romaji', shortLabel: '➪ka', callback: () => this.onToKana(Kana.Romaji) },
  ];

  onSearchRequested(){
    this.commands.findKanji();
  }

  onToKana(kind : Kana){
    this.commands.transliterate(kind);
  }

  onTranslate(){
    this.commands.translate();
  }

  onTranslateInDeepl(){
    this.commands.translateInDeepl();
  }

  constructor(
    private commands : CommandsService,
  ) { }

  ngOnInit(): void {
  }

}
