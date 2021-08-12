import { Injectable } from '@angular/core';
import { HotkeyService } from './hotkey.service';
import { KanjiSearchService } from './kanji-search.service';
import { KanjiEntry } from './model/kanji-entry';
import { Kana, TransliterationService } from './transliteration.service';
import { InputBufferService } from './input-buffer.service';
import { TranslationService } from './translation.service';

class HotkeyBinding{
  hotkey : string;
  repr : string;
  callback : () => void;
  description? : string;

  constructor(hotkey : string, repr : string, callback : () => void, description? : string) {
    this.hotkey = hotkey;
    this.repr = repr;
    this.callback = callback;
    this.description = description
  }
}

@Injectable({
  providedIn: 'root'
})
export class CommandsService {
  transliterate(mode : Kana){
    const selection = this.buffer.getSelectionString();
    const translit = this.translit.toKana(selection, mode);
    if (Boolean(translit))
      this.buffer.setSelection(translit!);
  }

  undo(){
    this.buffer.undo();
  }

  redo(){
    this.buffer.redo();
  }

  findKanji(){
    const query = this.buffer.getSelectionString();
    if (query.trim().length)
      this.kanjiSearch.searchByMeaning(query);
  }

  insertKanjiByEntry(entry : KanjiEntry) {
    this.buffer.setSelection(entry.literal);
  }

  insertKanjiByResultIndex(index : number) {
    const entry = this.kanjiSearch.getResultByIndex(index);
    if (entry === 'index out of range')
      return;

    this.insertKanjiByEntry(entry);
  }

  translate() {
    if (this.buffer.text.trim().length)
      this.translation.translate(this.buffer.text);
  }

  translateInDeepl() {
    window.open(`https://www.deepl.com/translator?il=en#ja/en/${this.buffer.text}`, '_blank');
  }

  constructor(
    private buffer : InputBufferService,
    private translit : TransliterationService,
    private kanjiSearch : KanjiSearchService,
    private hotkeyService : HotkeyService,
    private translation : TranslationService,
  ) {
    this.subscribeToHotkeys();
  }

  hotkeys : HotkeyBinding[] = [
    new HotkeyBinding('control.r', 'Ctrl+R', () => this.transliterate(Kana.Romaji), 'Convert selected text to Romaji'),
    new HotkeyBinding('control.h', 'Ctrl+H', () => this.transliterate(Kana.Hiragana), 'Convert selected text to Hiragana'),
    new HotkeyBinding('control.k', 'Ctrl+K', () => this.transliterate(Kana.Katakana), 'Convert selected text to Katakana'),
    new HotkeyBinding('control.f', 'Ctrl+F', () => this.findKanji(), 'Search Kanji with a meaning of selected text'),
    new HotkeyBinding('control.1', 'Ctrl+1', () => this.insertKanjiByResultIndex(0)),
    new HotkeyBinding('control.2', 'Ctrl+2', () => this.insertKanjiByResultIndex(1)),
    new HotkeyBinding('control.3', 'Ctrl+3', () => this.insertKanjiByResultIndex(2)),
    new HotkeyBinding('control.4', 'Ctrl+4', () => this.insertKanjiByResultIndex(3)),
    new HotkeyBinding('control.5', 'Ctrl+5', () => this.insertKanjiByResultIndex(4)),
    new HotkeyBinding('control.z', 'Ctrl+Z', () => this.undo(), 'Undo'),
    new HotkeyBinding('control.shift.z', 'Ctrl+Shift+Z', () => this.redo(), 'Redo'),
    new HotkeyBinding('control.enter', 'Ctrl+Enter', () => this.translate(), 'Translate'),
    new HotkeyBinding('control.shift.enter', 'Ctrl+Shift+Enter', () => this.translateInDeepl(), 'Translate in DeepL'),
  ]

  subscribeToHotkeys(){
    const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    if (isMac) {
      this.hotkeys.map(
        hk => {
          hk.hotkey = hk.hotkey.replace('control', 'meta');
          hk.repr = hk.repr.replace('Ctrl', '⌘');
        }
      )
    }

    this.hotkeys.forEach(
      hk => this.hotkeyService.addShortcut(hk.hotkey)
        .subscribe(_ => hk.callback()));
  }
}
