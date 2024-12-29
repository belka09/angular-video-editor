import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private loadingTimeout: any;

  /**
   * Show the loader with a minimum duration.
   * @param minDuration Minimum duration in milliseconds (default: 3000ms).
   */
  showLoader(minDuration = 3000): void {
    if (!this.loadingSubject.value) {
      this.loadingSubject.next(true);

      // Automatically hide loader after minimum duration
      this.loadingTimeout = setTimeout(() => {
        this.hideLoader();
      }, minDuration);
    }
  }

  /**
   * Hide the loader only if the minimum duration has elapsed.
   */
  hideLoader(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    this.loadingSubject.next(false);
  }
}
