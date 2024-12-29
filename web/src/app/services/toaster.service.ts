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

  showToast(type: 'success' | 'error' | 'warning', message: string) {
    const newToast: ToasterMessage = { type, message };

    this.toasterQueue.push(newToast);

    if (this.toasterQueue.length > this.maxToasters) {
      this.toasterQueue.shift();
    }

    this.toasterSubject.next([...this.toasterQueue]);

    timer(3000).subscribe(() => this.removeToast(newToast));
  }

  private removeToast(toast: ToasterMessage) {
    this.toasterQueue = this.toasterQueue.filter(
      (existingToast) => existingToast !== toast
    );
    this.toasterSubject.next([...this.toasterQueue]);
  }

  clearToasts() {
    this.toasterQueue = [];
    this.toasterSubject.next([]);
  }
}
