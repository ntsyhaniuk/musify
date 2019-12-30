import { Component, Input } from '@angular/core';

const MAX_TITLE_LENGTH = 140;

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})
export class ItemsListComponent {
  @Input() title: string;
  @Input() total: number;
  @Input() items: any[] = [];

  constructor() {}

  getCoverImage(item: any) {
    const images = item && (item.images || item.icons);
    return images.length ? images[0].url : '../assets/no-cover.jpg';
  }

  getTitle({name}) {
    return name.length > MAX_TITLE_LENGTH ? `${name.substring(0, MAX_TITLE_LENGTH)}...` : name;
  }

  get isEmpty() {
    return !this.items.length;
  }

  get notFullList() {
    return this.total > this.items.length;
  }
}
