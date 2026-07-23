import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Search } from '../../../features/search/search';
import { SearchState } from '../../../features/search/search-state';
import { Profile } from '../profile/profile';

@Component({
  selector: 'app-navbar',
  imports: [Search, Profile],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly searchState = inject(SearchState);
  private readonly router = inject(Router);

  protected goHome(event: Event): void {
    event.preventDefault();
    this.searchState.clear();
    void this.router.navigateByUrl('/');
  }
}
