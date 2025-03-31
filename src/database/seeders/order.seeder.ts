import { DataSource } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

export const orderSeeder = async (dataSource: DataSource) => {
  const orderRepository = dataSource.getRepository(Order);
  const userRepository = dataSource.getRepository(User);

  // Lấy một waiter và một bartender
  const waiter = await userRepository.findOne({
    where: { role: { name: 'Waiter' } }
  });
  const bartender = await userRepository.findOne({
    where: { role: { name: 'Bartender' } }
  });

  const orders = [
    {
      tableNumber: 'T001',
      waiter: waiter,
      bartender: bartender,
      status: 'pending',
      totalAmount: 50000,
      items: [
        {
          name: 'Cà phê sữa',
          price: 25000,
          quantity: 2,
          note: 'Ít đường'
        }
      ]
    },
    // Thêm các order mẫu khác...
  ];

  for (const order of orders) {
    const exists = await orderRepository.findOne({
      where: {
        tableNumber: order.tableNumber,
        createdAt: new Date()
      }
    });

    if (!exists) {
      await orderRepository.save(order as any);
    }
  }
};
