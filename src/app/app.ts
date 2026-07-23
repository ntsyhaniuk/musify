import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Auth } from '@app/core/auth/auth';
import { Background } from '@app/core/background/background';
import { LoadingSpinner } from '@app/core/spinner/loading-spinner';
import { Navbar } from '@app/layout/navbar/navbar';
import { AppSpinner } from '@app/shared/components/app-spinner/app-spinner';
import { PlaybackControl } from '@app/features/player/playback-control/playback-control';
import { Player } from '@app/features/player/player';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, AppSpinner, PlaybackControl],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly auth = inject(Auth);
  private readonly player = inject(Player);
  protected readonly background = inject(Background);
  protected readonly spinner = inject(LoadingSpinner);

  ngOnInit(): void {
    void this.auth.init().then(() => {
      if (this.auth.isAuthenticated()) {
        void this.player.init();
      }
    });
  }
}
