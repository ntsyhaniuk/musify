import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Search } from './search';
import { SearchState } from './search-state';

describe('Search', () => {
  let component: Search;
  let fixture: ComponentFixture<Search>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Search],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('allows re-searching the same query after SearchState.clear()', async () => {
    const searchState = TestBed.inject(SearchState);
    const input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    const waitForDebounce = () => new Promise((resolve) => setTimeout(resolve, 450));

    input.value = 'SOAD';
    input.dispatchEvent(new Event('input'));
    await waitForDebounce();
    await fixture.whenStable();
    expect(searchState.query()).toBe('SOAD');

    searchState.clear();
    await fixture.whenStable();
    expect(searchState.query()).toBe('');

    input.value = 'SOAD';
    input.dispatchEvent(new Event('input'));
    await waitForDebounce();
    await fixture.whenStable();
    expect(searchState.query()).toBe('SOAD');
  });
});
