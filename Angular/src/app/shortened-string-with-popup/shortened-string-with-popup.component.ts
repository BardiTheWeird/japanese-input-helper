import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-shortened-string-with-popup',
  templateUrl: './shortened-string-with-popup.component.html',
  styleUrls: ['./shortened-string-with-popup.component.css']
})
export class ShortenedStringWithPopupComponent implements OnInit {
  @Input() str = '';
  @Input() maxLen = 20;
  showTooltip = true;

  cutOffString(){
    if (this.str.length > this.maxLen){
      let outStr = '...';
      if (this.maxLen - 3 > 0)
        outStr = this.str.slice(0, this.maxLen - 3) + outStr;
      return outStr;
    }
    return this.str;
  }

  constructor() { }

  ngOnInit(): void {
    this.showTooltip = this.str.length > this.maxLen;
  }

}
