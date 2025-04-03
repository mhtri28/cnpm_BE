import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
/*import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { IngredientsModule } from './ingredients/ingredients.module';*/
import { config } from 'dotenv';
import { SupplierModule } from './modules/suppliers/suppliers.module';
config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      entities: [],
      synchronize: false,
      migrations: ['src/database/migrations/*.ts'],
    }),
     SupplierModule,
  /*  RolesModule,
    PermissionsModule,
    UsersModule,
    AuthModule,
    OrderModule,
    IngredientsModule,*/
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
