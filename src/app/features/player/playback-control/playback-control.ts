import {
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Player } from '@app/features/player/player';

const MOBILE_QUERY = '(max-width: 768px)';
const MINI_HEIGHT_PX = 90;
const SWIPE_THRESHOLD_PX = 80;
const INTERACTIVE_SELECTOR = 'button, a, [role="link"], mat-slider, input';

/**
 * Bottom playback bar — Material used for mat-slider only.
 * Desktop: classic three-column bar. Mobile: full-viewport bottom sheet.
 */
@Component({
  selector: 'app-playback-control',
  imports: [MatSliderModule],
  templateUrl: './playback-control.html',
  styleUrl: './playback-control.scss',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class PlaybackControl {
  protected readonly player = inject(Player);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  private readonly trackInfo = viewChild<ElementRef<HTMLElement>>('trackInfo');
  private readonly collapseBtn = viewChild<ElementRef<HTMLButtonElement>>('collapseBtn');
  private readonly miniPlayBtn = viewChild<ElementRef<HTMLButtonElement>>('miniPlayBtn');

  /** Mobile sheet open state (desktop ignores this). */
  protected readonly expanded = signal(false);

  /**
   * Distance (px) the full-viewport sheet is translated down from expanded.
   * 0 = fully expanded; collapsedY() = mini bar peeking.
   */
  protected readonly sheetY = signal(
    typeof window !== 'undefined' ? Math.max(0, window.innerHeight - MINI_HEIGHT_PX) : 0,
  );

  /** True while a vertical drag is in progress (disables CSS transitions). */
  protected readonly isDragging = signal(false);

  private readonly seek$ = new Subject<number>();
  private readonly volume$ = new Subject<number>();

  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private dragStartSheetY = 0;
  private trackingVertical: boolean | null = null;
  private suppressClick = false;
  private previousBodyOverflow = '';

  constructor() {
    this.seek$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((position) => this.player.seek(position));

    this.volume$
      .pipe(debounceTime(100), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((volume) => this.player.setVolume(volume));

    effect(() => {
      if (!this.player.isVisible()) {
        this.collapse();
      }
    });

    effect(() => {
      this.syncBodyScrollLock(this.expanded());
    });

    afterNextRender(() => {
      if (!this.expanded()) {
        this.sheetY.set(this.collapsedY());
      }
    });

    this.bindViewportCollapse();
    this.bindViewportResize();
    this.destroyRef.onDestroy(() => this.syncBodyScrollLock(false));
  }

  protected onEscape(): void {
    if (this.expanded()) {
      this.collapse();
    }
  }

  protected expand(): void {
    this.sheetY.set(0);
    this.expanded.set(true);
    afterNextRender(() => this.collapseBtn()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  protected collapse(): void {
    const wasOpen = this.expanded();
    this.isDragging.set(false);
    this.expanded.set(false);
    this.sheetY.set(this.collapsedY());
    if (wasOpen) {
      afterNextRender(() => this.miniPlayBtn()?.nativeElement.focus(), {
        injector: this.injector,
      });
    }
  }

  protected toggle(): void {
    if (this.expanded()) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /** Mini-bar tap; ignores the synthetic click that follows a swipe. */
  protected onMiniActivate(): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    this.expand();
  }

  protected onSheetPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    if (this.isInteractiveTarget(event.target)) {
      return;
    }

    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.dragStartSheetY = this.sheetY();
    this.trackingVertical = null;
    this.suppressClick = false;

    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  protected onSheetPointerMove(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;

    if (this.trackingVertical === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
        return;
      }
      this.trackingVertical = Math.abs(dy) > Math.abs(dx);
      if (!this.trackingVertical) {
        this.resetPointer();
        return;
      }
      this.isDragging.set(true);
    }

    if (!this.trackingVertical) {
      return;
    }

    event.preventDefault();

    const maxY = this.collapsedY();
    this.sheetY.set(this.clamp(this.dragStartSheetY + dy, 0, maxY));
  }

  protected onSheetPointerUp(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) {
      return;
    }

    const y = this.sheetY();
    const maxY = this.collapsedY();
    const wasDragging = this.isDragging();

    this.resetPointer();

    if (!wasDragging) {
      return;
    }

    // Prevent the synthetic click that follows a swipe from toggling again.
    this.suppressClick = true;

    const threshold = Math.min(SWIPE_THRESHOLD_PX, maxY * 0.25);

    if (this.expanded()) {
      if (y >= threshold) {
        this.collapse();
      } else {
        this.sheetY.set(0);
      }
    } else if (maxY - y >= threshold) {
      this.expand();
    } else {
      this.sheetY.set(maxY);
    }
  }

  protected onSheetPointerCancel(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) {
      return;
    }
    this.resetPointer();
    this.sheetY.set(this.expanded() ? 0 : this.collapsedY());
  }

  protected sheetTransform(): string {
    return `translateY(${this.sheetY()}px)`;
  }

  protected onSeek(value: number): void {
    this.seek$.next(value);
  }

  protected onVolume(value: number): void {
    this.volume$.next(value);
  }

  protected isNameAnimated(name: string | undefined): boolean {
    const width = this.trackInfo()?.nativeElement.offsetWidth ?? 0;
    return !!name && name.length >= width / 8;
  }

  protected isArtistAnimated(artists: { name: string }[] | undefined): boolean {
    const width = this.trackInfo()?.nativeElement.offsetWidth ?? 0;
    const len = artists?.map((a) => a.name).join('').length ?? 0;
    return len >= width / 8;
  }

  protected goToArtist(artist: { id?: string; uri?: string }): void {
    const id = artist.id ?? artist.uri?.split(':').pop();
    if (id) {
      void this.router.navigate(['/details', 'artist', id]);
    }
  }

  protected goToAlbum(): void {
    const albumId = this.player.currentTrack()?.albumId;
    if (albumId) {
      void this.router.navigate(['/details', 'album', albumId]);
    }
  }

  private collapsedY(): number {
    const height =
      typeof window !== 'undefined' ? window.innerHeight : MINI_HEIGHT_PX;
    return Math.max(0, height - MINI_HEIGHT_PX);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private bindViewportCollapse(): void {
    if (typeof matchMedia !== 'function') {
      return;
    }

    const mql = matchMedia(MOBILE_QUERY);
    const onChange = (): void => {
      if (!mql.matches) {
        this.collapse();
      }
    };
    mql.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => mql.removeEventListener('change', onChange));
  }

  private bindViewportResize(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const onResize = (): void => {
      if (this.isDragging()) {
        return;
      }
      if (this.expanded()) {
        this.sheetY.set(0);
      } else {
        this.sheetY.set(this.collapsedY());
      }
    };
    window.addEventListener('resize', onResize);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof Element && !!target.closest(INTERACTIVE_SELECTOR);
  }

  private resetPointer(): void {
    this.pointerId = null;
    this.trackingVertical = null;
    this.isDragging.set(false);
  }

  private syncBodyScrollLock(lock: boolean): void {
    const body = this.document.body;
    if (lock) {
      if (body.style.overflow !== 'hidden') {
        this.previousBodyOverflow = body.style.overflow;
        body.style.overflow = 'hidden';
      }
      return;
    }
    body.style.overflow = this.previousBodyOverflow;
    this.previousBodyOverflow = '';
  }
}
