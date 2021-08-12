import { Component, OnInit, ViewChild } from '@angular/core';
import { CommandsService } from '../commands.service';
import { KanjiSearchService } from '../kanji-search.service';
import { KanjiEntry } from '../model/kanji-entry';
import { MediaObserver } from "@angular/flex-layout";
import {MatDialog} from "@angular/material/dialog";
import {KanjiDetailsComponent} from "../kanji-details/kanji-details.component";

type KanjiTableRow = {
  id : number,
  entry : KanjiEntry,
}

@Component({
  selector: 'app-jisho-search',
  templateUrl: './kanji-search-results.component.html',
  styleUrls: ['./kanji-search-results.component.css']
})
export class KanjiSearchResults implements OnInit {
  searchResults : KanjiTableRow[] = [];

  allColumns  = ['id', 'literal', 'm1', 'm2', 'm3', 'm4', 'm5'];
  readMoreColumnLabel = 'read-more';
  columnsToDisplay  = this.allColumns;
  mediaSizeToColNumber = new Map<string, number[]>(
    [
      ['xs', [1, 10]],
      ['sm', [3, 12]],
      ['md', [4, 15]],
      ['lg', [5, 15]],
      ['xl', [5, 15]],
    ]
  );
  maxMeaningLength = 15;

  clickedRowId = -1;
  searching = false;

  constructor(
    private kanjiSearch : KanjiSearchService,
    private commands : CommandsService,
    private mediaObserver : MediaObserver,
    private dialog : MatDialog,
  ) { }

  changeColumnRenderAmount(cols : number) {
    if (cols < 0 || cols > 5) {
      console.log(`can't render ${cols} columns`);
      return;
    }

    this.columnsToDisplay = this.allColumns.slice(0, 2 + cols);
    this.columnsToDisplay.push(this.readMoreColumnLabel);
  }

  onRowClicked(id : number){
    console.log(`clicked row ${id}`);
    this.clickedRowId = id;
    this.commands.insertKanjiByResultIndex(id);
  }

  onOpenDetails(i : number) {
    const entry = this.searchResults[i].entry;
    console.log(`opening ReadMore dialog for entry ${JSON.stringify(entry)}`);
    this.dialog.open(KanjiDetailsComponent, {
      width: '500px',
      data: entry.id,
    })
  }

  ngOnInit(): void {
    this.kanjiSearch.searchByMeaningResults.subscribe(
      data => {
        this.searchResults = data.map((entry, i) =>
          <KanjiTableRow> { id: i, entry: entry });
        this.searching = false;
      }
    );

    this.kanjiSearch.searchString.subscribe(
      _ => {
        this.searchResults = [];
        this.clickedRowId = -1;
        this.searching = true;
      }
    );
    this.searching = false;

    this.mediaObserver.asObservable().subscribe(
      data => {
        console.log(`####### ${data[0].mqAlias}`);
        const numOfColsAndSymbols = this.mediaSizeToColNumber.get(data[0].mqAlias);
        if (numOfColsAndSymbols) {
          const numOfCols = numOfColsAndSymbols[0];
          this.maxMeaningLength = numOfColsAndSymbols[1];
          console.log(`changing the number of rendered columns to ${numOfCols}`)
          this.changeColumnRenderAmount(numOfCols);
        }
      }
    )
  }
}
