import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Toast, ToastPosition, ToastService } from "../services/toastr.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngFor="let pos of positions">
      <div
        class="fixed z-50 space-y-2 w-80 max-w-full"
        [ngClass]="getPositionClass(pos)"
      >
        <div
          *ngFor="let toast of toastsByPosition[pos]"
          class="relative px-4 py-3 rounded shadow text-white bg-opacity-90 animate-slide-in"
          [ngClass]="{
            'bg-green-700': toast.type === 'success',
            'bg-red-700': toast.type === 'error',
            'bg-blue-700': toast.type === 'info'
          }"
        >
          <button
            (click)="toastService.dismiss(toast)"
            class="absolute top-1 right-1 mr-2 text-white hover:text-gray-200 text-2xl"
          >
            &times;
          </button>

          <div class="flex items-center gap-4">
            <div class="flex-shrink-0">
              <ng-container [ngSwitch]="toast.type">
                <svg *ngSwitchCase="'success'" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white/90" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <svg *ngSwitchCase="'error'" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white/90" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <svg *ngSwitchCase="'info'" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white/90" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              </ng-container>
            </div>
            <div class="flex-1">
              <div class="font-extrabold text-lg mb-1 leading-tight">{{ toast.title }}</div>
              <div class="leading-snug">{{ toast.message }}</div>
            </div>
          </div>

        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  toastsByPosition: Record<ToastPosition, Toast[]> = {
    'top-right': [],
    'bottom-right': [],
    'top-left': [],
    'bottom-left': [],
    'center-top': [],
    'center-bottom': [],
  };

  readonly positions: ToastPosition[] = [
    'top-right',
    'bottom-right',
    'top-left',
    'bottom-left',
    'center-top',
    'center-bottom',
  ];

  private sub?: Subscription;

  constructor(public toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toasts$.subscribe((t) => {
      this.toasts = t;
      this.toastsByPosition = this.groupByPosition(t);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private groupByPosition(toasts: Toast[]): Record<ToastPosition, Toast[]> {
    return this.positions.reduce((acc, pos) => {
      acc[pos] = toasts.filter((t) => t.position === pos);
      return acc;
    }, {} as Record<ToastPosition, Toast[]>);
  }

  getPositionClass(pos: ToastPosition): string {
    const map: Record<ToastPosition, string> = {
      'top-right': 'top-5 right-5',
      'bottom-right': 'bottom-5 right-5',
      'top-left': 'top-5 left-5',
      'bottom-left': 'bottom-5 left-5',
      'center-top': 'top-5 left-1/2 transform -translate-x-1/2',
      'center-bottom': 'bottom-5 left-1/2 transform -translate-x-1/2',
    };
    return map[pos];
  }
}
