import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginGuard } from './core/guards/login.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [LoginGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { title: 'Dashboard' }
      },
      {
        path: 'admin/users',
        canActivate: [AuthGuard, AdminGuard],
        loadComponent: () => import('./features/user-management/user-management.component').then(m => m.UserManagementComponent),
        data: { title: 'User Management' }
      },
      {
        path: 'monthly-budget',
        canActivate: [AuthGuard],
        loadComponent: () => import('./features/monthly-budget/monthly-budget.component').then(m => m.MonthlyBudgetComponent),
        data: { title: 'Monthly Budget' }
      },
      {
        path: 'budget-template',
        canActivate: [AuthGuard],
        loadComponent: () => import('./features/budget-template/budget-template.component').then(m => m.BudgetTemplateComponent),
        data: { title: 'Budget Template' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
