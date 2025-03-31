import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'ID của người dùng',
    example: 1
  })
  @PrimaryGeneratedColumn({ type: 'integer', unsigned: true })
  id: number;

  @ApiProperty({
    description: 'Tên người dùng',
    example: 'John Doe',
    maxLength: 50
  })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0123456789',
    maxLength: 10
  })
  @Column({ length: 10, unique: true })
  phone: string;

  @ApiProperty({
    description: 'Email',
    example: 'john@example.com'
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu đã được mã hóa'
  })
  @Column()
  password: string;

  @ApiProperty({
    description: 'Thời gian tạo'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Thời gian xóa'
  })
  @DeleteDateColumn()
  deletedAt: Date;

  @ApiProperty({
    description: 'Role của người dùng',
    type: () => Role
  })
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ApiProperty({
    description: 'ID của role',
    example: 1
  })
  @Column({ type: 'integer', unsigned: true })
  roleId: number;
}
