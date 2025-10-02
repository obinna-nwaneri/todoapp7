export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}
