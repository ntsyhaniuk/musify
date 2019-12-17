import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})
export class ItemsListComponent {
  @Input() title: string;
  @Input() items: any[] = [];

  constructor() {}

  getCoverImage(item: any) {
    const images = item && (item.images || item.icons);
    return images.length ? images[0].url : '../assets/no-cover.jpg';
  }
}
