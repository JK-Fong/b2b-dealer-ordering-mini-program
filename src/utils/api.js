// src/utils/api.js
import { mockApi } from '../mock/mockData';

// 模拟全局Token和客户ID
let globalToken = '';
let globalCustomerId = '';
let globalTargetDealerId = ''; // 业务员代客下单目标客户ID

export const setGlobalToken = (token) => {
  globalToken = token;
};

export const setGlobalCustomerId = (id) => {
  globalCustomerId = id;
};

export const setGlobalTargetDealerId = (id) => {
  globalTargetDealerId = id;
};

export const getGlobalCustomerId = () => {
  return globalTargetDealerId || globalCustomerId;
};

// 统一请求封装
const request = async (apiName, params = {}) => {
  // 1. 模拟异常处理规范：超时或5xx错误
  // 实际项目中，这里会是 uni.request 的封装，处理网络错误和HTTP状态码
  // 在mock中，我们直接调用mockApi
  try {
    // 模拟接口超时（Timeout）或 ERP 服务返回 5xx 错误
    if (Math.random() < 0.05) { // 5%的概率模拟失败
      throw new Error('ERP Service Unavailable');
    }

    const finalParams = {
      ...params,
      token: globalToken,
      customer_id: globalCustomerId,
      target_dealer_id: globalTargetDealerId,
    };

    const res = await mockApi(apiName, finalParams);

    if (res.code !== 0) {
      // 模拟业务错误
      console.error(`API Error [${apiName}]: ${res.msg}`);
      return { success: false, msg: res.msg, data: null };
    }

    return { success: true, msg: res.msg, data: res.data };

  } catch (error) {
    console.error(`API Request Failed [${apiName}]:`, error.message);
    // 统一展示：“系统维护中，服务暂时不可用”
    return { success: false, msg: '系统维护中，服务暂时不可用', data: null };
  }
};

// 接口清单
export const api = {
  login: (phone) => request('User.Login', { phone }),
  productList: () => request('Product.List'),
  productStock: (product_ids) => request('Product.Stock', { product_ids }),
  fundBalance: (customer_id) => request('Fund.Balance', { customer_id }),
  fundTransactionList: (customer_id) => request('Fund.TransactionList', { customer_id }),
  orderList: (customer_id) => request('Order.List', { customer_id }),
  orderCreate: (items) => request('Order.Create', { customer_id: getGlobalCustomerId(), items }),
  orderCancel: (order_id) => request('Order.Cancel', { order_id }),
  dealerList: (sales_rep_id) => request('Dealer.List', { sales_rep_id }),
};
