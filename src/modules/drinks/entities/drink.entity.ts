import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('drinks')
export class Drink {
  @ApiProperty({
    description: 'ID của đồ uống',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({
    description: 'Tên của đồ uống',
    example: 'Cà phê sữa đá',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Giá của đồ uống',
    example: 29000,
  })
  @Column('decimal', { precision: 8, scale: 2 })
  price: number;

  @ApiProperty({
    description: 'Số lượng đã bán',
    example: 150,
  })
  @Column({ type: 'bigint', default: 0 })
  soldCount: number;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2023-04-01T08:30:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật gần nhất',
    example: '2023-04-15T10:45:00Z',
  })
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ApiProperty({
    description: 'Thời gian xóa',
    example: null,
  })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ApiProperty({
    description: 'Công thức của đồ uống',
    type: () => [Recipe],
  })
  @OneToMany(() => Recipe, (recipe) => recipe.drink)
  recipes: Recipe[];

  @ApiProperty({
    description: 'Các đơn hàng chứa đồ uống này',
    type: () => [OrderItem],
  })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.drink)
  orderItems: OrderItem[];
}
