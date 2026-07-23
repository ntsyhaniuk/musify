import { Component, ChangeDetectionStrategy, input } from '@angular/core';

/**
 * Horizontal/grid items list — Phase 2 (features-ui).
 */
@Component({
  selector: 'app-items-list',
  imports: [],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsList {
  readonly title = input('');
}
