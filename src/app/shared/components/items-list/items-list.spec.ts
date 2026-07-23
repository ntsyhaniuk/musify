import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { ItemsList } from './items-list';

describe('ItemsList', () => {
  let component: ItemsList;
  let fixture: ComponentFixture<ItemsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemsList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows See All when sectionKey is set and total exceeds items', async () => {
    fixture.componentRef.setInput('title', 'Followed artists');
    fixture.componentRef.setInput('sectionKey', 'artists');
    fixture.componentRef.setInput('total', 40);
    fixture.componentRef.setInput('items', [
      {
        id: 'a1',
        name: 'Artist',
        type: 'artist',
        uri: 'spotify:artist:a1',
        images: [],
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const seeAll = fixture.debugElement.query(By.css('.items-list__see-all span'));
    expect(seeAll).toBeTruthy();
    expect(seeAll.nativeElement.textContent.trim()).toBe('See All');
  });

  it('hides See All without sectionKey even when truncated', async () => {
    fixture.componentRef.setInput('total', 40);
    fixture.componentRef.setInput('items', [
      {
        id: 'a1',
        name: 'Artist',
        type: 'artist',
        uri: 'spotify:artist:a1',
        images: [],
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css('.items-list__see-all'))).toBeNull();
  });
});