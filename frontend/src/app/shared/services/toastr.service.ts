import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type ToastType = 'success' | 'error' | 'info';
export type ToastPosition =
  | 'top-right'
  | 'bottom-right'
  | 'top-left'
  | 'bottom-left'
  | 'center-top'
  | 'center-bottom';

export interface Toast {
  type: ToastType;
  title: string;
  message: string;
  duration: number;
  position: ToastPosition;
}


@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toasts.asObservable();

  show(
    type: ToastType,
    titleOrMessage: string,
    messageOrDuration?: string | number,
    durationOrPos?: number | ToastPosition,
    maybePosition?: ToastPosition
  ) {
    let title: string;
    let message: string;
    let duration: number;
    let position: ToastPosition = 'bottom-right';

    if (typeof messageOrDuration === 'string') {
      title = titleOrMessage;
      message = messageOrDuration;
      duration = typeof durationOrPos === 'number' ? durationOrPos : 3000;
      position = (typeof durationOrPos === 'string' ? durationOrPos : maybePosition) ?? 'bottom-right';
    } else {
      title = this.capitalize(type);
      message = titleOrMessage;
      duration = messageOrDuration ?? 3000;
      position = (typeof durationOrPos === 'string' ? durationOrPos : 'bottom-right');
    }

    const toast: Toast = { type, title, message, duration, position };
    const updated = [...this.toasts.getValue(), toast];
    this.toasts.next(updated);

    setTimeout(() => this.remove(toast), duration);
  }

  dismiss(toast: Toast) {
    this.remove(toast);
  }

  private remove(toast: Toast) {
    this.toasts.next(this.toasts.getValue().filter(t => t !== toast));
  }

  private capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
