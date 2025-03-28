import { DataSource } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';

export const permissionSeeder = async (dataSource: DataSource) => {
  const permissionRepository = dataSource.getRepository(Permission);

  const permissions = [
    // Quản lý người dùng
    { name: 'view-users', description: 'Xem danh sách người dùng' },
    { name: 'create-users', description: 'Thêm người dùng mới' },
    { name: 'edit-users', description: 'Chỉnh sửa thông tin người dùng' },
    { name: 'delete-users', description: 'Xóa người dùng' },

    // Quản lý sản phẩm
    { name: 'view-products', description: 'Xem danh sách sản phẩm' },
    { name: 'create-products', description: 'Thêm sản phẩm mới' },
    { name: 'edit-products', description: 'Chỉnh sửa thông tin sản phẩm' },
    { name: 'delete-products', description: 'Xóa sản phẩm' },

    // Quản lý đơn hàng
    { name: 'view-orders', description: 'Xem danh sách đơn hàng' },
    { name: 'create-orders', description: 'Tạo đơn hàng mới' },
    { name: 'edit-orders', description: 'Chỉnh sửa đơn hàng' },
    { name: 'delete-orders', description: 'Hủy đơn hàng' },

    // Quản lý kho
    { name: 'view-inventory', description: 'Xem tồn kho' },
    { name: 'create-inventory', description: 'Tạo phiếu nhập kho' },
    { name: 'approve-inventory', description: 'Duyệt phiếu nhập kho' },
  ];

  for (const permission of permissions) {
    const exists = await permissionRepository.findOne({ where: { name: permission.name } });
    if (!exists) {
      await permissionRepository.save(permission);
    }
  }
};
