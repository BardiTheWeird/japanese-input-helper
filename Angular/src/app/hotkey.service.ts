import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable } from 'rxjs/internal/Observable';

type Options = {
  element: any;
  keys: string;
}

@Injectable({
  providedIn: 'root'
})
export class HotkeyService {
  defaults: Partial<Options> = {
    element: this.document
  };

  constructor(
    private eventManager: EventManager,
    @Inject(DOCUMENT) private document: Document) {
  }

  addShortcut(shortcut : string) {
    const merged = { ...this.defaults, keys: shortcut };
    const event = `keydown.${merged.keys}`;

    return new Observable(observer => {
      const handler = (e : any) => {
        e.preventDefault()
        observer.next(e);
      };
      
      const dispose = this.eventManager.addEventListener(
         merged.element, event, handler
      );

      return () => {
        dispose();
      };
    })
  }
  
}
