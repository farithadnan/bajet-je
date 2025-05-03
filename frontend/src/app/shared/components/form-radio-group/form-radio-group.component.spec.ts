import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRadioGroupComponent } from './form-radio-group.component';

describe('FormRadioGroupComponent', () => {
  let component: FormRadioGroupComponent;
  let fixture: ComponentFixture<FormRadioGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRadioGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRadioGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
