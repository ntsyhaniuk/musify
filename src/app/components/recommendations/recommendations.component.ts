import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})
export class RecommendationsComponent implements OnChanges {
  @Input() recommendations: {} = {};
  private entity: string;
  private items: any;

  ngOnChanges() {
    return this.recommendations && Object.entries(this.recommendations).map(([entity, items]) => {
      this.entity = entity;
      this.items = items;
    });
  }

}
