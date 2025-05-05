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
    buttons?: ('edit' | 'delete' | 'view' | 'reset')[];

    // Custom disable conditions for each button
    disableConditions?: {
      // Function takes the row item and context data, returns true if button should be disabled
      edit?: (item: any, contextData?: any) => boolean;
      delete?: (item: any, contextData?: any) => boolean;
      view?: (item: any, contextData?: any) => boolean;
      reset?: (item: any, contextData?: any) => boolean;
    };

    // Custom tooltip messages when buttons are disabled
    disabledTooltips?: {
      edit?: string;
      delete?: string;
      view?: string;
      reset?: string;
    };
  };
}

export interface TableQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  flag?: string;
  status?: boolean;
  month?: number;
  year?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
