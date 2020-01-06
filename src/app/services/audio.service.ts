import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { ITrack, IStreamState } from '../types/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private stop$ = new Subject();
  private audioObj = new Audio();
  private currentTrack: ITrack;
  private tracks: ITrack[];
  private audioID: string;
  private listId: string;
  private isRandom = false;
  private onRepeat = false;
  audioEvents = [
    'ended',
    'error',
    'play',
    'playing',
    'pause',
    'timeupdate',
    'canplay'
  ];

  private state: IStreamState = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    currentId: undefined,
    canplay: false,
    error: false
  };

  private stateChange: BehaviorSubject<IStreamState> = new BehaviorSubject(
    this.state
  );

  private updateStateEvents(event: Event): void {
    switch (event.type) {
      case 'canplay':
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;
      case 'playing':
        this.state.playing = true;
        this.state.currentId = this.audioID;
        break;
      case 'pause':
        this.state.playing = false;
        break;
      case 'timeupdate':
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
        break;
      case 'error':
        this.resetState();
        this.state.error = true;
        break;
    }
    this.stateChange.next(this.state);
  }

  private resetState() {
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      currentId: undefined,
      canplay: false,
      error: false
    };
  }

  private streamObservable(url: string): any {
    return new Observable(observer => {
      // Play audio
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };

      this.addEvents(this.audioObj, this.audioEvents, handler);
      return () => {
        // Stop Playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        // remove event listeners
        this.removeEvents(this.audioObj, this.audioEvents, handler);
        // reset state
        this.resetState();
      };
    });
  }

  playStream(track: ITrack) {
    const { previewUrl, id } = track;

    this.audioID = id;
    this.currentTrack = track;
    this.streamObservable(previewUrl).pipe(takeUntil(this.stop$))
      .subscribe((event: Event) => {
        if (event.type === 'ended') {
          this.playNextTrack();
        }
      });
  }

  private addEvents(obj, events, handler) {
    events.forEach(event => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj, events, handler) {
    events.forEach(event => {
      obj.removeEventListener(event, handler);
    });
  }

  play(track: ITrack) {
    track.isPlaying = true;
    if (track.id === this.audioID) {
      this.audioObj.play();
    } else {
      if (this.currentTrack) {
        this.stop();
      }
      this.playStream(track);
    }
  }

  playNextTrack() {
    let nextTrack;
    if (this.onRepeat) {
      nextTrack = this.currentTrack;
    } else if (this.isRandom) {
      nextTrack = this.tracks[Math.floor(Math.random() * this.tracks.length)];
    } else {
      const currentTrackOrder = this.currentTrack.trackOrder;
      nextTrack = this.tracks.find(track => track.trackOrder - 1 === currentTrackOrder);
      const isTrackListEnd = this.tracks.length === (currentTrackOrder + 1);
      if (isTrackListEnd) {
        this.pause(this.currentTrack);
        return;
      }
    }
    this.play(nextTrack);
  }

  pause(track: ITrack) {
    track.isPlaying = false;
    this.audioObj.pause();
  }

  stop() {
    this.currentTrack.isPlaying = false;
    this.stop$.next();
  }

  rewindTo(seconds: number) {
    this.audioObj.currentTime = seconds;
  }

  formatTime(time: number, format: string = 'mm:ss') {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }

  getState(): Observable<IStreamState> {
    return this.stateChange.asObservable();
  }

  randomize(status) {
    this.isRandom = status;
  }

  getRandom() {
    return this.isRandom;
  }

  repeat(status) {
    this.onRepeat = status;
  }

  getRepeat() {
    return this.onRepeat;
  }

  setListData(listId: string, tracks: ITrack[]) {
    const isTheSameList = listId && this.listId && listId === this.listId;
    if (isTheSameList && this.audioID) {
      const currentTrack = this.tracks.find(({id}) => id === this.audioID);
      currentTrack.isPlaying = true;
      this.currentTrack = currentTrack;
    } else {
      this.tracks = tracks;
    }
    this.listId = listId;
  }
}
