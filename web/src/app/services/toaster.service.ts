import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';

export interface ToasterMessage {
  type: 'success' | 'error' | 'warning';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private toasterQueue: ToasterMessage[] = [];
  private toasterSubject = new BehaviorSubject<ToasterMessage[]>([]);
  toaster$ = this.toasterSubject.asObservable();
  private readonly maxToasters = 3;

  /**
   * Displays a new toast message.
   * If the queue exceeds the maximum number of allowed toasts, the oldest toast is removed.
   * The toast will automatically disappear after 3 seconds.
   * @param type - The type of the toast message: 'success', 'error', or 'warning'.
   * @param message - The content of the toast message.
   */
  showToast(type: 'success' | 'error' | 'warning', message: string): void {
    const newToast: ToasterMessage = { type, message };

    this.toasterQueue.push(newToast);

    if (this.toasterQueue.length > this.maxToasters) {
      this.toasterQueue.shift();
    }

    this.toasterSubject.next([...this.toasterQueue]);

    timer(3000).subscribe(() => this.removeToast(newToast));
  }

  /**
   * Removes a specific toast message from the queue.
   * @param toast - The toast message to be removed.
   */
  private removeToast(toast: ToasterMessage): void {
    this.toasterQueue = this.toasterQueue.filter(
      (existingToast) => existingToast !== toast
    );
    this.toasterSubject.next([...this.toasterQueue]);
  }

  /**
   * Clears all active toasts from the queue and notifies observers.
   */
  clearToasts(): void {
    this.toasterQueue = [];
    this.toasterSubject.next([]);
  }
}
