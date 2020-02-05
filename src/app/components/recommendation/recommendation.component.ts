import { Component, Input } from '@angular/core';

import get from 'lodash.get';

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.scss']
})
export class RecommendationComponent {
  @Input() recommendation: any;
  @Input() entity: string;

  getCoverImage(item: any) {
    const images = item && (item.images || item.icons);
    return get(images, '[0].url', '../assets/no-cover.jpg');
  }

}
