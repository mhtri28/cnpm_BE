import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'suppliers' })
export class Supplier {
    @PrimaryGeneratedColumn({ type: 'integer', unsigned: true })
    id: number;

    @Column({ length: 50 })
    name: string;

    @Column({ length: 10, unique: true })
    phone: string;

    @Column({ unique: true })
    email: string;

    @Column({ length: 50 })
    address: string;
}