import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// modules
import { AppRoutingModule } from './app-routing.module';

// services
import { AuthService } from './services/auth.service';
import { HttpService } from './services/http.service';
import { SpotifyApiService } from './services/spotify.service';
import { HttpInterceptorService } from './services/http-interceptor.service';

// components
import { AppComponent } from './app.component';
import { SearchComponent } from './components/search/search.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AlbumsListComponent } from './components/albums-list/albums-list.component';
import { TrackListComponent } from './components/track-list/track-list.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    NavbarComponent,
    AlbumsListComponent,
    TrackListComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    HttpService,
    SpotifyApiService,
    {provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
