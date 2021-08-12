import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { HotkeyService } from '../hotkey.service';
import { Kana, TransliterationService } from '../transliteration.service';
import { InputBufferService, Selection } from '../input-buffer.service';
import {CommandsService} from "../commands.service";

@Component({
  selector: 'app-free-text',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {
  selectionStart : number = 0;
  selectionEnd : number = 0;

  @ViewChild('txtArea') inputTextArea! : ElementRef;

  onModelChanged() {
    this.buffer.pushToUndoStack(this.buffer.text);
  }

  onSelectionChanged(ev:any){
    this.buffer.updateSelection({
      start: ev.target.selectionStart,
      end: ev.target.selectionEnd
    });
  }

  setSelection(options : {start? : number, end? : number}){
    const start = options.start === undefined ? this.selectionStart : options.start;
    const end = options.end === undefined ? this.selectionEnd : options.end;
    this.buffer.updateSelection({
      start: start,
      end: end
    })
  }


  buffer : InputBufferService;

  constructor(
    buffer : InputBufferService,
  ) {
    this.buffer = buffer;
  }

  ngOnInit(): void {
    this.buffer.selection.subscribe(data => {
      this.selectionStart = data.start;
      this.selectionEnd = data.end;
    })
  }
}
