import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard.js';
import { UserRole } from '../../users/user.entity.js';

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  const createContext = (roles: UserRole[] | undefined, userRole?: UserRole) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(roles as any);
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: userRole } }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows requests without role metadata', () => {
    const context = createContext(undefined, UserRole.USER);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows users with matching role', () => {
    const context = createContext([UserRole.ADMIN], UserRole.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('blocks users without matching role', () => {
    const context = createContext([UserRole.ADMIN], UserRole.USER);
    expect(guard.canActivate(context)).toBe(false);
  });
});
