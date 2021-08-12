import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {ShortcutHelpComponent} from "./shortcut-help/shortcut-help.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'japanese-helper';
  isMobile = false;

  constructor(
    private dialog : MatDialog,
  ) {
  }

  onShortcutWindowRequested(){
    this.dialog.open(ShortcutHelpComponent, {
      width: "500px",
    })
  }

  ngOnInit() {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
      this.isMobile = true;
    }

    console.log(`is mobile: ${this.isMobile}`);
  }
}
