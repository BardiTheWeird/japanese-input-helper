import {AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import {KanjiEntry} from "../model/kanji-entry";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {KanjiSearchService} from "../kanji-search.service";

@Component({
  selector: 'app-kanji-details',
  templateUrl: './kanji-details.component.html',
  styleUrls: ['./kanji-details.component.css']
})
export class KanjiDetailsComponent implements OnInit {
  id : number | null | undefined = this.data;
  entry : KanjiEntry | undefined = undefined;
  literal = '';
  meanings = '';
  on = '';
  kun = '';
  nanori = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data : number,
    public dialogRef : MatDialogRef<KanjiDetailsComponent>,
    private kanjiSearch : KanjiSearchService,
    private cd: ChangeDetectorRef,
  ) { }

  updateFieldsFromEntry() {
    console.log(`updating data from entry ${JSON.stringify(this.entry)}`);

    if (this.entry) {
      this.literal = this.entry.literal;
      this.meanings = this.entry.meanings.join(', ');
      this.on = this.entry.on.join(', ');
      this.kun = this.entry.kun.join(', ');
      this.nanori = this.entry.nanori.join(', ');
    }

    this.cd.detectChanges();
  }

  onClose() {
    this.dialogRef.close();
  }

  onOpenJisho(){
    window.open(`https://jisho.org/search/${this.literal}#kanji`, '_blank');
  }

  ngOnInit(): void {
    if (this.id) {
      console.log(`searching for kanji with id ${this.id}`);
      this.kanjiSearch.searchById(this.id)
        .subscribe(data => {
          if (data) {
            this.entry = data;
            this.updateFieldsFromEntry();
          }
        })
    }
  }
}
