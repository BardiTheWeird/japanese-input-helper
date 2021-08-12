import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../translation.service';

@Component({
  selector: 'app-translator',
  templateUrl: './translation-output.component.html',
  styleUrls: ['./translation-output.component.css']
})
export class TranslationOutputComponent implements OnInit {
  result : string = '';

  constructor(
    private translator : TranslationService,
  ) { }

  ngOnInit(): void {
    this.translator.translationStatusString
      .subscribe(data => this.result = data);
  }

}
