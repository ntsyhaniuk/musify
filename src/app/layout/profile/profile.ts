import { Component, inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { Auth } from '@app/core/auth/auth';
import { SpotifyApi } from '@app/data-access/spotify/spotify-api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly auth = inject(Auth);
  private readonly spotify = inject(SpotifyApi);

  protected readonly user = rxResource({
    params: () => this.auth.isAuthenticated(),
    stream: ({ params: authed }) => (authed ? this.spotify.getCurrentUser() : of(undefined)),
  });

  protected readonly displayName = computed(() => this.user.value()?.display_name ?? 'Not signed in');
  protected readonly imageUrl = computed(() => this.user.value()?.images?.[0]?.url ?? null);
}
