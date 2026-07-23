import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Search } from '@app/features/search/search';
import { SearchState } from '@app/core/search/search-state';
import { Profile } from '@app/layout/profile/profile';

@Component({
  selector: 'app-navbar',
  imports: [Search, Profile],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
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
