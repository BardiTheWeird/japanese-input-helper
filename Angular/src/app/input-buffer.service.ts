import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TransliterationService, Kana } from './transliteration.service';
import { Stack } from 'stack-typescript';

export type Selection = {
  end : number,
  start : number
}

@Injectable({
  providedIn: 'root'
})
export class InputBufferService {
  public text : string = '';
  private selectionSource = new BehaviorSubject<Selection>({ end: 0, start: 0 });

  private prevTextValue = '';
  private undoStack = new Stack<string>();
  private redoStack = new Stack<string>();

  selection = this.selectionSource.asObservable();
  private curSelection : Selection = { end: 0, start: 0 };

  updateSelection(newSelection : Selection){
    this.selectionSource.next(newSelection);
  }

  getSelectionString(){
    return this.text.slice(this.curSelection.start, this.curSelection.end);
  }

  setSelection(replacement : string){
    const start = this.curSelection.start;
    const end = this.curSelection.end;

    const head = this.text.slice(0, start);
    const tail = this.text.slice(end, this.text.length);

    const newString = head + replacement + tail;
    if (newString === this.text)
      return;

    this.text = newString;

    this.pushToUndoStack(this.text);
  }

  transliterate(kind : Kana){
    const res = this.translit.toKana(this.getSelectionString(), kind);
    if (res)
      this.setSelection(res!);
  }

  pushToUndoStack(str : string, clearRedo? : boolean){
    clearRedo = clearRedo === undefined ? true : clearRedo;
    if (str === this.undoStack.top){
      return;
    }
    this.undoStack.push(this.prevTextValue);
    this.prevTextValue = str;
    if (clearRedo)
      this.redoStack = new Stack<string>();
  }

  undo(){
    if (!this.undoStack.length){
      return;
    }
    else if (this.undoStack.length === 1){
      if (this.text === '')
        return;
      this.pushToRedoStack(this.text);
      this.text = '';
    }
    else {
      this.pushToRedoStack(this.prevTextValue);
      const undone = this.undoStack.pop();
      this.text = undone;
      this.prevTextValue = undone;
    }
  }

  pushToRedoStack(str : string){
    this.redoStack.push(str);
  }

  redo(){
    if (this.redoStack.length) {
      this.pushToUndoStack(this.prevTextValue, false);
      const redone = this.redoStack.pop();
      this.prevTextValue = redone;
      this.text = redone;
    }
  }


  constructor(
    private translit : TransliterationService
  ) {
    this.selectionSource.subscribe(data => this.curSelection = data);
  }
}
