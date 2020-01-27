import { Component, Input, OnChanges } from '@angular/core';

import get from 'lodash.get';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})
export class RecommendationsComponent implements OnChanges {
  @Input() recommendations: {} = {};
  public entity: string;
  public items: any;

  ngOnChanges() {
    return this.recommendations && Object.entries(this.recommendations).map(([entity, items]) => {
      this.entity = entity;
      this.items = get(items, 'items', items);
    });
  }

  horizontalScroll(e) {
    e.preventDefault();
    e.currentTarget.scrollLeft = e.deltaY > 0
      ? e.currentTarget.scrollLeft + 300
      : e.currentTarget.scrollLeft - 300;
  }

}
