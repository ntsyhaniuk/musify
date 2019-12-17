import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { BackgroundService } from './services/background.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public backgroundUrl: string;
  constructor(private auth: AuthService, private background: BackgroundService) {}

  ngOnInit(): void {
    this.auth.authorize();
    this.background.$backgroundUrl.subscribe(url => this.backgroundUrl = url);
  }
}
