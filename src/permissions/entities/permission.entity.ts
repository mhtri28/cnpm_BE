import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn({ type: 'integer', unsigned: true })
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 100 })
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
