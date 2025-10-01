import { Module } from '@nestjs/common';
import { AdminModule as AdminJsModule } from '@adminjs/nestjs';
import AdminJS from 'adminjs';
import * as TypeOrmAdapter from '@adminjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Todo } from '../todos/todo.entity';

AdminJS.registerAdapter({
  Database: TypeOrmAdapter.Database,
  Resource: TypeOrmAdapter.Resource,
});

@Module({
  imports: [
    AdminJsModule.createAdminAsync({
      imports: [ConfigModule, UsersModule],
      inject: [ConfigService, getDataSourceToken(), UsersService],
      useFactory: async (
        configService: ConfigService,
        dataSource: DataSource,
        usersService: UsersService,
      ) => ({
        adminJsOptions: {
          rootPath: '/admin',
          resources: [
            { resource: { model: User, dataSource } },
            { resource: { model: Todo, dataSource } },
          ],
          branding: {
            companyName: 'Enterprise Todo Admin',
          },
        },
        auth: {
          authenticate: async (email: string, password: string) => {
            const user = await usersService.findByEmail(email);
            if (user && user.isAdmin && (await bcrypt.compare(password, user.password))) {
              return user;
            }
            return null;
          },
          cookieName: 'adminjs',
          cookiePassword: configService.get<string>('ADMIN_COOKIE_SECRET', 'admin-cookie-secret'),
        },
        sessionOptions: {
          resave: false,
          saveUninitialized: false,
          secret: configService.get<string>('ADMIN_COOKIE_SECRET', 'admin-cookie-secret'),
        },
      }),
    }),
  ],
})
export class AdminModule {}
