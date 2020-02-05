import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// modules
import { AppRoutingModule } from './app-routing.module';

// services
import { AuthService } from './services/auth.service';
import { HttpService } from './services/http.service';
import { AudioService } from './services/audio.service';
import { MusicApiService } from './services/music-api.service';
import { HttpInterceptorService } from './services/http-interceptor.service';

// components
import { AppComponent } from './app.component';
import { TrackComponent } from './components/track/track.component';
import { SearchComponent } from './components/search/search.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DetailsComponent } from './components/details/details.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { CategoryComponent } from './components/category/category.component';
import { ItemsListComponent } from './components/items-list/items-list.component';
import { TrackListComponent } from './components/track-list/track-list.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { RecommendationComponent } from './components/recommendation/recommendation.component';
import { RecommendationsComponent } from './components/recommendations/recommendations.component';
import { PlaybackControlComponent } from './components/playback-control/playback-control.component';

@NgModule({
  declarations: [
    AppComponent,
    TrackComponent,
    SearchComponent,
    NavbarComponent,
    DetailsComponent,
    ProfileComponent,
    SpinnerComponent,
    CategoryComponent,
    ItemsListComponent,
    TrackListComponent,
    CategoriesComponent,
    RecommendationComponent,
    RecommendationsComponent,
    PlaybackControlComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    MatSliderModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    AuthService,
    HttpService,
    AudioService,
    MusicApiService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
