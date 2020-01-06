import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { BackgroundService } from './services/background.service';
import { SpinnerService } from './services/spinner.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public backgroundUrl: string;
  public isLoading: Observable<boolean> = this.spinner.isLoading.pipe(delay(0));
  constructor(private auth: AuthService, private background: BackgroundService, public spinner: SpinnerService) {}

  ngOnInit(): void {
    this.auth.authorize();
    this.background.$backgroundUrl.subscribe(url => this.backgroundUrl = url);
  }
}
