import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {
  public $backgroundUrl = new Subject<any>();

  updateBackgroundUrl(image) {
    if (image) {
      this.$backgroundUrl.next(image.url);
    }
  }
}
