import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen"
      class="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm"
      (click)="closeOnBackdropClick ? close($event) : null">

      <!-- Modal Container -->
      <div
        class="relative w-full {{sizeClass}} bg-white rounder-lg shadow max-h-[90vh] overflow-y-auto mx-4 md:mx-0"
        (click)="$event.stopPropagation()">

        <!-- Modal header -->
        <div
          class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-semibold">{{title}}</h3>
            <button class="text-gray-500 hover:text-gray-700" (click)="onClose.emit()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>

        <!-- Modal Body -->
         <div class="p-6">
          <ng-content></ng-content>
         </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Model Title';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closeOnBackdropClick: boolean = true;

  @Output() onClose = new EventEmitter<void>();

  get sizeClass(): string {
    switch(this.size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-xl';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
    }
  }

  close(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('z-50')) {
      this.onClose.emit();
    }
  }
}
