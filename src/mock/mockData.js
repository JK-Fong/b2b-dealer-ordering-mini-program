// src/mock/mockData.js

// 模拟登录用户数据
const mockUsers = [
  {
    phone: '13800001111',
    token: 'mock_token_dealer_1',
    customer_id: 'CUST001',
    customer_name: 'A区核心经销商',
    is_sales_rep: false, // 普通经销商
    account: {
      available_balance: 12000.50, // 可用余额
      frozen_amount: 500.00, // 冻结金额
      credit_limit: 50000.00, // 授信额度
    },
  },
  {
    phone: '13900002222',
    token: 'mock_token_sales_rep_1',
    customer_id: 'SALES001',
    customer_name: '王牌业务员',
    is_sales_rep: true, // 业务员
    dealer_list: [
      { id: 'CUST002', name: 'B区战略伙伴' },
      { id: 'CUST003', name: 'C区小型门店' },
    ],
  },
];

// 模拟商品列表数据
const mockProducts = [
  {
    product_id: 'P001',
    name: '高端定制白酒 500ml',
    spec: '500ml/瓶',
    unit: '箱',
    min_order_qty: 10,
    price: 500.00, // 最终执行价
    category: '白酒',
    brand: '茅台',
  },
  {
    product_id: 'P002',
    name: '经典红酒 750ml',
    spec: '750ml/瓶',
    unit: '箱',
    min_order_qty: 5,
    price: 120.00,
    category: '红酒',
    brand: '拉菲',
  },
  {
    product_id: 'P003',
    name: '精酿啤酒 330ml*24',
    spec: '330ml*24/箱',
    unit: '箱',
    min_order_qty: 1,
    price: 88.00,
    category: '啤酒',
    brand: '青岛',
  },
];

// 模拟实时库存数据 (Product.Stock)
const mockStock = {
  'P001': 150,
  'P002': 0, // 模拟缺货
  'P003': 999,
};

// 模拟资金流水 (Fund.TransactionList)
const mockTransactions = [
  { time: '2025-11-20 10:00:00', summary: '期初余额', amount: 10000.00, new_balance: 10000.00 },
  { time: '2025-11-21 15:30:00', summary: '采购扣款-订单号20251121001', amount: -5000.00, new_balance: 5000.00 },
  { time: '2025-11-22 09:00:00', summary: '信用额度增加', amount: 50000.00, new_balance: 55000.00 },
  { time: '2025-11-25 11:00:00', summary: '采购扣款-订单号20251125002', amount: -299.50, new_balance: 54700.50 },
];

// 模拟订单数据 (Order.List)
const mockOrders = [
  {
    order_id: '20251125001',
    order_date: '2025-11-25 10:00:00',
    total_amount: 1000.00,
    erp_status_code: 10, // 待审核/未打印
    erp_status_text: '待发货',
    can_cancel: true,
    can_return: false,
  },
  {
    order_id: '20251124002',
    order_date: '2025-11-24 15:00:00',
    total_amount: 500.00,
    erp_status_code: 50, // 已收货
    erp_status_text: '已收货',
    can_cancel: false,
    can_return: true,
  },
  {
    order_id: '20251123003',
    order_date: '2025-11-23 09:00:00',
    total_amount: 200.00,
    erp_status_code: 30, // 已发货
    erp_status_text: '已发货',
    can_cancel: false,
    can_return: false,
  },
];

// 模拟API请求函数
export const mockApi = (apiName, params) => {
  console.log(`Mock API Call: ${apiName}`, params);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (apiName) {
        case 'User.Login':
          const user = mockUsers.find(u => u.phone === params.phone);
          if (user) {
            resolve({ code: 0, msg: '登录成功', data: user });
          } else {
            resolve({ code: 1001, msg: '非授权用户，请联系管理员' });
          }
          break;

        case 'Product.List':
          // 模拟根据客户ID过滤商品（这里简化为返回全部）
          resolve({ code: 0, msg: '成功', data: mockProducts });
          break;

        case 'Product.Stock':
          // 模拟实时库存查询
          const stockData = params.product_ids.map(id => ({
            product_id: id,
            stock: mockStock[id] || 0,
          }));
          resolve({ code: 0, msg: '成功', data: stockData });
          break;

        case 'Fund.Balance':
          // 模拟获取账户余额
          const account = mockUsers.find(u => u.customer_id === params.customer_id)?.account;
          if (account) {
            resolve({ code: 0, msg: '成功', data: account });
          } else {
            resolve({ code: 1002, msg: '客户信息不存在' });
          }
          break;

        case 'Fund.TransactionList':
          // 模拟资金流水
          resolve({ code: 0, msg: '成功', data: mockTransactions });
          break;

        case 'Order.List':
          // 模拟订单列表
          resolve({ code: 0, msg: '成功', data: mockOrders });
          break;

        case 'Order.Create':
          // 模拟下单逻辑：库存校验、余额校验、扣款、生成订单号
          const totalAmount = params.items.reduce((sum, item) => sum + item.price * item.qty, 0);
          const customerAccount = mockUsers.find(u => u.customer_id === params.customer_id)?.account;

          if (!customerAccount) {
            reject({ code: 1003, msg: '客户信息不存在' });
            return;
          }

          // 模拟余额不足
          if (customerAccount.available_balance + customerAccount.credit_limit < totalAmount) {
            const shortfall = totalAmount - (customerAccount.available_balance + customerAccount.credit_limit);
            reject({ code: 1004, msg: `账户余额不足，缺口 ¥${shortfall.toFixed(2)}` });
            return;
          }

          // 模拟库存被抢占
          if (params.items.some(item => mockStock[item.product_id] < item.qty)) {
            reject({ code: 1005, msg: '部分商品库存不足，请重新确认' });
            return;
          }

          // 模拟成功
          const newOrderId = `20251125${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
          // 实际项目中需要更新mockUsers中的余额和mockStock中的库存，这里简化
          resolve({ code: 0, msg: '下单成功', data: { order_id: newOrderId } });
          break;

        case 'Order.Cancel':
          // 模拟取消订单
          const orderToCancel = mockOrders.find(o => o.order_id === params.order_id);
          if (orderToCancel && orderToCancel.can_cancel) {
            // 模拟ERP自动回滚资金和状态更新
            orderToCancel.erp_status_code = 99;
            orderToCancel.erp_status_text = '已取消';
            orderToCancel.can_cancel = false;
            resolve({ code: 0, msg: '订单取消成功，资金已回滚' });
          } else if (orderToCancel) {
            reject({ code: 1006, msg: '当前订单状态不允许取消' });
          } else {
            reject({ code: 1007, msg: '订单不存在' });
          }
          break;

        case 'Dealer.List':
          // 模拟业务员获取客户列表
          const salesRep = mockUsers.find(u => u.customer_id === params.sales_rep_id && u.is_sales_rep);
          if (salesRep) {
            resolve({ code: 0, msg: '成功', data: salesRep.dealer_list });
          } else {
            resolve({ code: 1008, msg: '非业务员账号或ID错误' });
          }
          break;

        default:
          reject({ code: 9999, msg: '未知的API名称' });
      }
    }, 500); // 模拟网络延迟
  });
};
