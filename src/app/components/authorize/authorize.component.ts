import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {AuthService} from '../../services/auth.service';

const parseUrlFragments = (urlString) => {
  const fragmentsList = urlString.split('&');
  return fragmentsList.reduce((res, el) => {
    const [key, value] = el.split('=');
    res[key] = value;
    return res;
  }, {});
};

@Component({
  selector: 'app-authorize',
  template: '',
  styleUrls: []
})
export class AuthorizeComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    const {access_token, expires_in} = parseUrlFragments(this.route.snapshot.fragment);
    this.auth.setSessionKey(access_token);
  }

}
