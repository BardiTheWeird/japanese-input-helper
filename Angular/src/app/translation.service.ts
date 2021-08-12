import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from "../environments/environment";

function constructTranslationQuery (query: string) {
  return `${environment.translationApiEndpoint}query=${query}`;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  constructor(
    private http : HttpClient
  ) { }

  private translationStatusStringSource = new BehaviorSubject('');
  translationStatusString = this.translationStatusStringSource.asObservable();

  private static handleError(error : HttpErrorResponse){
    console.log(`An HTTP error occured: ${error.message}`);

    return new BehaviorSubject<number>(error.status).asObservable();
  }

  translate(query : string) {
    this.translationStatusStringSource.next('translating...');
    const link = constructTranslationQuery(query);
    return this.http.get(link,
      {
        responseType: 'text'
      })
      .pipe(
        catchError(TranslationService.handleError)
      ).subscribe(result => {
        if ((result as string).length !== undefined){
          this.translationStatusStringSource.next(result as string);
        }
        else{
          let responseCode = result as number;
          this.translationStatusStringSource.next(responseCode === 504
            ? 'Request timed out'
            : 'Unexpected error');
        }
      });
  }
}
