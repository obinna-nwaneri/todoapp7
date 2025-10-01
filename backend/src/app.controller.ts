import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Roles } from './common/roles.decorator';
import { RolesGuard } from './common/roles.guard';
import { AppService } from './app.service';
import { UserRole } from './users/user-role.enum';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('admin/stats')
  @Roles(UserRole.Admin)
  getStats() {
    return this.appService.getStats();
  }
}
