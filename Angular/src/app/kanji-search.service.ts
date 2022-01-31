import { Inject, Injectable } from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import { KanjiEntry } from './model/kanji-entry';
import { HttpClient, HttpErrorResponse} from "@angular/common/http";
import { environment } from "../environments/environment";
import { catchError } from "rxjs/operators";

declare const GetKanjiEntryByMeaning: Function;
declare const GetKanjiEntryById: Function;

function constructKanjiSearchByMeaningQuery(meaning : string) {
  return `${environment.kanjiDictionaryApiEndpoint}meaning=${meaning}&topEntries=${5}&topMeanings=${5}&stripReadings=${true}`;
}

function constructKanjiSearchByIdQuery(id : number) {
  return `${environment.kanjiDictionaryApiEndpoint}id=${id}`;
}

@Injectable({
  providedIn: 'root'
})
export class KanjiSearchService {
  private searchByMeaningResultsSource = new BehaviorSubject<KanjiEntry[]>([]);
  searchByMeaningResults : Observable<KanjiEntry[]> = this.searchByMeaningResultsSource.asObservable();
  private curSearchResults : KanjiEntry[] = [];

  private searchStringSource = new BehaviorSubject<string>('');
  searchString = this.searchStringSource.asObservable();

  getResultByIndex(index : number) : KanjiEntry | 'index out of range' {
    if (index < 0 || index >= this.curSearchResults.length)
      return 'index out of range'
    return this.curSearchResults[index];
  }

  constructor(private http : HttpClient) {
    this.searchByMeaningResults.subscribe(data => this.curSearchResults = data);
  }

  handleError(error : HttpErrorResponse){
    console.log(`An HTTP error occured: ${error.message}`);

    return throwError(
      'Something bad happened; please try again later.');
  }

  async searchByMeaning(meaning: string): Promise<void> {
    this.searchStringSource.next(meaning);

    

    const jsonEntries : string = await (async () => {
      await new Promise(f => setTimeout(f, 100));
      return GetKanjiEntryByMeaning(meaning, 5);
    })();
    const entries : KanjiEntry[] = JSON.parse(jsonEntries)

    this.searchByMeaningResultsSource.next(entries)

    // this.http.get<KanjiEntry[]>(constructKanjiSearchByMeaningQuery(meaning))
    //   .pipe(
    //     catchError(this.handleError)
    //   )
    //   .subscribe(data => this.searchByMeaningResultsSource.next(data));
  }

  searchById(id : number): KanjiEntry {
    const jsonEntry : string = GetKanjiEntryById(id);
    const entry : KanjiEntry = JSON.parse(jsonEntry);

    return entry;

    // return this.http.get<KanjiEntry>(constructKanjiSearchByIdQuery(id))
    //   .pipe(
    //     catchError(this.handleError)
    //   );
  }
}
