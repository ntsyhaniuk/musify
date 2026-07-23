import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './app-spinner.html',
  styleUrl: './app-spinner.scss',
})
export class AppSpinner {
  protected readonly bars = Array.from({ length: 10 });
}
