import { Module } from '@nestjs/common';
import { DrinksService } from './drinks.service';
import { DrinksController } from './drinks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drink } from './entities/drink.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drink])],
  controllers: [DrinksController],
  providers: [DrinksService],
  exports: [DrinksService],
})
export class DrinksModule {}
