import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FlexLayoutModule } from '@angular/flex-layout';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from "@angular/material/icon";

import { KanjiSearchResults } from './kanji-search-results/kanji-search-results.component';
import { TranslationOutputComponent } from './translation-output/translation-output.component';
import { InputComponent } from './input/input.component';
import { TranslationStationComponent } from './translation-station/translation-station.component';
import { ShortenedStringWithPopupComponent } from './shortened-string-with-popup/shortened-string-with-popup.component';
import { ShortcutHelpComponent } from './shortcut-help/shortcut-help.component';
import { KanjiDetailsComponent } from './kanji-details/kanji-details.component';


@NgModule({
  declarations: [
    AppComponent,
    KanjiSearchResults,
    TranslationOutputComponent,
    InputComponent,
    TranslationStationComponent,
    ShortenedStringWithPopupComponent,
    ShortcutHelpComponent,
    KanjiDetailsComponent,
  ],
    imports: [
      BrowserModule,
      AppRoutingModule,
      BrowserAnimationsModule,
      FormsModule,
      MatProgressSpinnerModule,
      MatDialogModule,
      MatTooltipModule,
      MatTableModule,
      MatButtonModule,
      MatFormFieldModule,
      MatInputModule,
      HttpClientModule,
      FlexLayoutModule,
      MatIconModule,
    ],
  exports: [
    MatInputModule,
    MatTooltipModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
