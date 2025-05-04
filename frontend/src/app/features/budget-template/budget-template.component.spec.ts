import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetTemplateComponent } from './budget-template.component';

describe('BudgetTemplateComponent', () => {
  let component: BudgetTemplateComponent;
  let fixture: ComponentFixture<BudgetTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
