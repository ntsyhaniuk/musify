import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { UserProfile, IUser } from './user-profile';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private user: IUser;

  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.auth.getUserData().subscribe(user => {
      this.user = new UserProfile(user);
    });
  }

}
