import { DataSource } from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
export const supplierSeeder = async (dataSource: DataSource) => {
    const supplierRepository = dataSource.getRepository(Supplier);

    const suppliers = [
        {
            name: 'Công ty TNHH Thực phẩm An Khang',
            phone: '0123450089',
            email: 'ankhang@example.com',
            address: '123 Đường Lê Lợi, Quận 1, TP.HCM'
        },
        {
            name: 'Công ty CP Thương mại Dịch vụ Thành Phát',
            phone: '0987654321',
            email: 'thanhphat@example.com',
            address: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM'
        },
        {
            name: 'Công ty TNHH Thực phẩm Minh Thành',
            phone: '0369852147',
            email: 'minhthanh@example.com',
            address: '789 Đường Lê Lai, Quận 1, TP.HCM'
        },
        {
            name: 'Công ty CP Thương mại Dịch vụ Phú Thọ',
            phone: '0147852369',
            email: 'phutho@example.com',
            address: '321 Đường Trần Hưng Đạo, Quận 1, TP.HCM'
        },
        {
            name: 'Công ty TNHH Thực phẩm Hưng Thịnh',
            phone: '0258963147',
            email: 'hungthinh@example.com',
            address: '654 Đường Nguyễn Thị Minh Khai, Quận 1, TP.HCM'
        }
    ];

    await supplierRepository.save(suppliers);
};
