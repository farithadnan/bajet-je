import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';


// Column definition interface
export interface TableColumn {
  header: string;      // Column header text
  field: string;       // Property name in data object
  type?: 'text' | 'avatar' | 'badge' | 'date' | 'actions' | 'custom'; // Column type
  hidden?: boolean;    // Hide on mobile/small screens
  badgeConfig?: {      // For badge type columns
    field: string;     // Field to check
    conditions: {
      value: any;
      bgClass: string;
      textClass: string;
      display: string;
    }[];
  };
  dateFormat?: string; // For date type columns
  actionConfig?: {
    // Define which buttons to show (default is all)
    buttons?: ('edit' | 'delete' | 'view')[];

    // Custom disable conditions for each button
    disableConditions?: {
      // Function takes the row item and context data, returns true if button should be disabled
      edit?: (item: any, contextData?: any) => boolean;
      delete?: (item: any, contextData?: any) => boolean;
      view?: (item: any, contextData?: any) => boolean;
    };

    // Custom tooltip messages when buttons are disabled
    disabledTooltips?: {
      edit?: string;
      delete?: string;
      view?: string;
    };
  };
}

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
  getBadgeClasses(item: any, badgeConfig: TableColumn['badgeConfig']): string {
    if (!badgeConfig) return '';

    const condition = badgeConfig.conditions.find(c => c.value === item[badgeConfig.field]);
    if (!condition) return '';

    return `${condition.bgClass} ${condition.textClass}`;
  }

  // Helper method for badge display text
  getBadgeDisplay(item: any, badgeConfig: TableColumn['badgeConfig']): string {
    if (!badgeConfig) return '';

    const condition = badgeConfig.conditions.find(c => c.value === item[badgeConfig.field]);
    return condition?.display || '';
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
  isActionDisabled(item: any, col: TableColumn, actionType: 'edit' | 'delete' | 'view'): boolean {
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
  getDisabledTooltip(col: TableColumn, actionType: 'edit' | 'delete' | 'view'): string {
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
