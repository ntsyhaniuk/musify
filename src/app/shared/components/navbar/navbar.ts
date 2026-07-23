import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Search } from '../../../features/search/search';
import { Profile } from '../profile/profile';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Search, Profile],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {}
