import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CommandsService} from "../commands.service";

type Shortcut = {
  shortcut : string,
  description : string
}

@Component({
  selector: 'app-shortcut-help',
  templateUrl: './shortcut-help.component.html',
  styleUrls: ['./shortcut-help.component.css']
})
export class ShortcutHelpComponent implements OnInit {
  shortcuts : Shortcut[] = [];
  columnsToDisplay = ['shortcut', 'description'];

  constructor(
    private commandsService : CommandsService,
    public dialogRef : MatDialogRef<ShortcutHelpComponent>,
  ) { }

  onClose() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.shortcuts = this.commandsService.hotkeys
      .filter(hk => hk.description)
      .map(
      hk => <Shortcut> {
        shortcut: hk.repr,
        description: hk.description,
      }
    );

    const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    const commandControl = isMac ? '⌘' : 'Ctrl';

    this.shortcuts.push({
      shortcut: `${commandControl}+[id]`,
      description: 'Insert Kanji with [id] (1-5) at selection'
    })
  }

}
