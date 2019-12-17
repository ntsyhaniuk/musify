import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {
  public $backgroundUrl = new Subject<any>();

  constructor() { }

  updateBackgroundUrl(images) {
    const first = images[0];
    if (first) {
      this.$backgroundUrl.next(first.url);
    }
  }
}
