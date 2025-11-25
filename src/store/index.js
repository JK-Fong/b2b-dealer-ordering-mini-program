// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import { setGlobalCustomerId, setGlobalToken, setGlobalTargetDealerId } from '../utils/api';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isLoggedIn: false,
    userInfo: null,
    targetDealer: null, // 业务员代客下单的目标经销商
    cart: [], // 购物车商品列表: [{ product_id, name, price, qty, unit, min_order_qty }]
  },
  mutations: {
    // 登录成功
    LOGIN(state, userInfo) {
      state.isLoggedIn = true;
      state.userInfo = userInfo;
      setGlobalToken(userInfo.token);
      setGlobalCustomerId(userInfo.customer_id);
      uni.setStorageSync('userInfo', userInfo);
    },
    // 登出
    LOGOUT(state) {
      state.isLoggedIn = false;
      state.userInfo = null;
      state.targetDealer = null;
      state.cart = [];
      setGlobalToken('');
      setGlobalCustomerId('');
      setGlobalTargetDealerId('');
      uni.removeStorageSync('userInfo');
      uni.removeStorageSync('targetDealer');
    },
    // 设置代客下单目标
    SET_TARGET_DEALER(state, dealer) {
      state.targetDealer = dealer;
      setGlobalTargetDealerId(dealer ? dealer.id : '');
      uni.setStorageSync('targetDealer', dealer);
    },
    // 购物车操作
    ADD_TO_CART(state, product) {
      const item = state.cart.find(i => i.product_id === product.product_id);
      if (item) {
        item.qty += product.qty;
      } else {
        state.cart.push(product);
      }
    },
    UPDATE_CART_QTY(state, { product_id, qty }) {
      const item = state.cart.find(i => i.product_id === product_id);
      if (item) {
        item.qty = qty;
      }
    },
    REMOVE_FROM_CART(state, product_id) {
      state.cart = state.cart.filter(i => i.product_id !== product_id);
    },
    CLEAR_CART(state) {
      state.cart = [];
    },
    // 从本地存储恢复状态
    INIT_STORE(state) {
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo) {
        state.isLoggedIn = true;
        state.userInfo = userInfo;
        setGlobalToken(userInfo.token);
        setGlobalCustomerId(userInfo.customer_id);
      }
      const targetDealer = uni.getStorageSync('targetDealer');
      if (targetDealer) {
        state.targetDealer = targetDealer;
        setGlobalTargetDealerId(targetDealer.id);
      }
    }
  },
  getters: {
    cartTotal: state => {
      return state.cart.reduce((total, item) => total + item.price * item.qty, 0);
    },
    cartCount: state => {
      return state.cart.reduce((count, item) => count + item.qty, 0);
    },
    isSalesRep: state => {
      return state.userInfo ? state.userInfo.is_sales_rep : false;
    },
    currentCustomerId: state => {
      return state.targetDealer ? state.targetDealer.id : (state.userInfo ? state.userInfo.customer_id : null);
    },
    currentCustomerName: state => {
      return state.targetDealer ? state.targetDealer.name : (state.userInfo ? state.userInfo.customer_name : '未登录');
    }
  },
  actions: {
    // 可以在这里封装异步操作，例如登录
  }
});

export default store;
