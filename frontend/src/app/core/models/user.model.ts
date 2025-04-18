export enum UserRole {
  Admin = 'admin',
  User = 'users'
}

export interface User extends LastLoginInfo {
  _id: string,
  username: string,
  email: string,
  role: UserRole,
  status: boolean,
  isActive?: boolean,
}

export interface SafeUser {
  _id: string;
  username: string;
  email: string;
  isActive: boolean;
  role?: string;
}


export interface LastLoginInfo extends AuditInfo {
  lastLogin: string,
  lastLoginIp: string,
  lastLoginLocation: string,
  lastLoginBrowser: string,
  lastLoginOs: string,
  lastLoginDevice: string,
}

export interface AuditInfo {
  createdBy: string,
  updatedBy: string,
  deletedBy: string,
  deletedDate: string,
  createdDate: string,
  updatedDate: string,
}



