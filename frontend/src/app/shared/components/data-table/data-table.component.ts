import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableColumn } from '../../models/table.model';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent implements OnChanges {
  // Core inputs
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'No data found';

  @Input() contextData: any = null;

  // Pagination inputs
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 10;
  @Input() totalPages: number = 1;


  // Search and filter inputs
  @Input() showSearch: boolean = true;
  @Input() searchPlaceholder: string = 'Search...';
  @Input() filterOptions: { value: string, label: string }[] = [];

  // Outputs
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() rowAction = new EventEmitter<{ action: string, item: any }>();

  // Component state
  searchQuery: string = '';
  selectedFilter: string = 'all';
  Math = Math;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {}

  // Page navigation method
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }

  // Search method
  onSearch(): void {
    this.searchChange.emit(this.searchQuery);
  }

  // Filter selection method
  onFilterChange(): void {
    this.filterChange.emit(this.selectedFilter);
  }

  // Action handler (edit, delete, etc)
  onAction(action: string, item: any): void {
    this.rowAction.emit({ action, item });
  }

  // Helper method for badge configuration
  getBadgeClasses(item: any, badgeConfig: any): string {
    const value = this.getBadgeValue(item, badgeConfig);
    const condition = badgeConfig.conditions.find((c: any) => c.value === value);
    return condition ? `${condition.bgClass} ${condition.textClass}` : '';
  }

  getBadgeValue(item: any, badgeConfig: any): any {
    if (badgeConfig.valueGetter) {
      return badgeConfig.valueGetter(item);
    }
    return item[badgeConfig.field];
  }

  getBadgeDisplay(item: any, badgeConfig: any): string {
    const value = this.getBadgeValue(item, badgeConfig);
    const condition = badgeConfig.conditions.find((c: any) => c.value === value);

    if (!condition) return '';

    if (typeof condition.display === 'function') {
      return condition.display(item);
    }

    return condition.display;
  }

  // Check if a specific action button should be shown
  isActionVisible(col: TableColumn, actionType: string): boolean {
    if (!col.actionConfig || !col.actionConfig.buttons) {
      // Default behavior: show all buttons if not configured
      return true;
    }

    return col.actionConfig.buttons.includes(actionType as any);
  }

  // Check if a specific action button should be disabled
  isActionDisabled(item: any, col: TableColumn, actionType: 'edit' | 'delete' | 'view' | 'reset'): boolean {
    if (!col.actionConfig || !col.actionConfig.disableConditions) {
      return false; // Default: not disabled
    }

    const disableCondition = col.actionConfig.disableConditions[actionType];
    if (disableCondition) {
      return disableCondition(item, this.contextData);
    }

    return false;
  }

  // Get tooltip for disabled buttons
  getDisabledTooltip(col: TableColumn, actionType: 'edit' | 'delete' | 'view' | 'reset'): string {
    if (!col.actionConfig || !col.actionConfig.disabledTooltips) {
      return `Cannot ${actionType}`; // Default tooltip
    }

    return col.actionConfig.disabledTooltips[actionType] || `Cannot ${actionType}`;
  }

  // Generate pagination numbers with ellipsis
  pageNumbers(): number[] {
    if (!this.totalPages) return [1];

    const current = this.currentPage;
    const last = this.totalPages;
    const delta = 1;
    const left = current - delta;
    const right = current + delta + 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= last; i++) {
      if (i === 1 || i === last || (i >= left && i < right)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-1); // Represents dots
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }
}
