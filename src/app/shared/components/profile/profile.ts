import { Component, ChangeDetectionStrategy } from '@angular/core';

/** User profile chip — Phase 2 after auth. */
@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {}
