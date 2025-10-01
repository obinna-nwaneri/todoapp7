import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TodosModule } from './todos/todos.module';
import { User } from './users/user.entity';
import { Todo } from './todos/todo.entity';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('PG_HOST', 'localhost'),
        port: Number(config.get<string>('PG_PORT', '5432')),
        username: config.get<string>('PG_USER', 'postgres'),
        password: config.get<string>('PG_PASSWORD', 'postgres'),
        database: config.get<string>('PG_DB_NAME', 'postgres'),
        entities: [User, Todo],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    TodosModule,
    AdminModule,
  ],
})
export class AppModule {}
