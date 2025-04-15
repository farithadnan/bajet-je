import { AfterContentInit, Directive, ElementRef, Input, OnChanges, SimpleChanges } from "@angular/core";

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutoFocusDirective implements AfterContentInit, OnChanges {
  @Input() appAutofocus: boolean = true;

  constructor(private el: ElementRef) {}

  ngAfterContentInit(): void {
    this.setFocus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appAutofocus'] && changes['appAutofocus'].currentValue) {
      this.setFocus();
    }
  }

  private setFocus(): void {
    if (this.appAutofocus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 0);
    }
  }
}
