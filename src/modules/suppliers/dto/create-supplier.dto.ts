import { IsEmail, IsNumber, IsPhoneNumber, MinLength } from "class-validator";

import { Length } from "class-validator";

import { IsNotEmpty } from "class-validator";
import { ManyToOne } from "typeorm";
import { JoinColumn } from "typeorm";
import { Supplier } from "../entities/supplier.entity";

export class CreateSupplierDto {
    @IsNotEmpty()
    @Length(1, 50)
    name: string;
  
    @IsNotEmpty()
    @IsPhoneNumber('VN')
    phone: string;
  
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsNotEmpty()
    @Length(1, 50)
    address: string;
}