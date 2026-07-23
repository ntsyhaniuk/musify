import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Auth } from './core/auth/auth';
import { Background } from './core/background/background';
import { Spinner } from './core/spinner/spinner';
import { Navbar } from './shared/components/navbar/navbar';
import { Spinner as SpinnerComponent } from './shared/components/spinner/spinner';
import { PlaybackControl } from './features/player/playback-control/playback-control';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SpinnerComponent, PlaybackControl],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly auth = inject(Auth);
  protected readonly background = inject(Background);
  protected readonly spinner = inject(Spinner);

  ngOnInit(): void {
    void this.auth.init();
  }
}
