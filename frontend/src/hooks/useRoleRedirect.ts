import { useMemo } from 'react';

import { UserRole } from '../types/auth';

export function roleToRoute(role: UserRole | null) {
  switch (role) {
    case 'ADMIN':
      return '/admin-panel/dashboard';
    case 'DOCTOR':
      return '/doctor-panel/dashboard';
    case 'PATIENT':
      return '/patient-panel/dashboard';
    default:
      return '/login';
  }
}

export function useRoleRedirect(role: UserRole | null) {
  return useMemo(() => roleToRoute(role), [role]);
}
