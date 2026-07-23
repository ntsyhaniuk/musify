import { ComponentFixture, TestBed } from '@angular/core/testing';
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
});
