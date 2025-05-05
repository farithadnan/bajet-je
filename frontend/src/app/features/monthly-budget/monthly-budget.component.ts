import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-monthly-budget',
  imports: [
    CommonModule
  ],
  templateUrl: './monthly-budget.component.html',
  styleUrl: './monthly-budget.component.css'
})
export class MonthlyBudgetComponent implements OnInit {
  loading: boolean = false;

  constructor() {

  }

  ngOnInit(): void {

  }

}
