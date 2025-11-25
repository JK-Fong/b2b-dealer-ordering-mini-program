<template>
	<view class="checkout-container">
		<view class="section-title">订单商品</view>
		<view class="product-list">
			<view v-for="item in cartItems" :key="item.product_id" class="product-item">
				<view class="item-info">
					<text class="item-name">{{ item.name }}</text>
					<text class="item-spec">{{ item.unit }}</text>
				</view>
				<view class="item-quantity">x {{ item.qty }}</view>
				<view class="item-price">¥ {{ (item.price * item.qty).toFixed(2) }}</view>
			</view>
		</view>
		
		<view class="section-title">资金预检</view>
		<view class="balance-info">
			<view class="info-row">
				<text class="label">订单总额:</text>
				<text class="value total-amount">¥ {{ cartTotal.toFixed(2) }}</text>
			</view>
			<view class="info-row">
				<text class="label">账户可用余额:</text>
				<text class="value" :class="{'insufficient': balance.available_balance < cartTotal}">¥ {{ balance.available_balance.toFixed(2) }}</text>
			</view>
			<view class="info-row">
				<text class="label">授信额度:</text>
				<text class="value">¥ {{ balance.credit_limit.toFixed(2) }}</text>
			</view>
			<view class="info-row total-check">
				<text class="label">总可用资金 (余额+授信):</text>
				<text class="value" :class="{'insufficient': totalAvailable < cartTotal}">¥ {{ totalAvailable.toFixed(2) }}</text>
			</view>
			
			<view v-if="!isBalanceSufficient" class="warning-box">
				<text class="warning-text">账户余额不足，缺口 ¥ {{ shortfall.toFixed(2) }}</text>
			</view>
		</view>
		
		<view class="section-title">收货信息</view>
		<view class="address-info">
			<text>收货人: {{ $store.getters.currentCustomerName }}</text>
			<text>地址: 模拟地址（需对接ERP获取）</text>
		</view>
		
		<view class="submit-bar">
			<view class="total-display">
				<text>应付总额:</text>
				<text class="final-amount">¥ {{ cartTotal.toFixed(2) }}</text>
			</view>
			<button class="submit-btn" 
					:disabled="!isBalanceSufficient || isSubmitting" 
					@click="handleSubmitOrder"
					:loading="isSubmitting">
				{{ isSubmitting ? '提交中...' : '确认下单' }}
			</button>
		</view>
	</view>
</template>

<script>
	import { api, getGlobalCustomerId } from '@/utils/api';

	export default {
		data() {
			return {
				cartItems: [],
				balance: {
					available_balance: 0,
					frozen_amount: 0,
					credit_limit: 0,
				},
				isSubmitting: false,
			};
		},
		computed: {
			cartTotal() {
				return this.cartItems.reduce((total, item) => total + item.price * item.qty, 0);
			},
			totalAvailable() {
				return this.balance.available_balance + this.balance.credit_limit;
			},
			isBalanceSufficient() {
				return this.totalAvailable >= this.cartTotal;
			},
			shortfall() {
				return this.cartTotal - this.totalAvailable;
			}
		},
		onLoad() {
			this.cartItems = this.$store.state.cart;
			if (this.cartItems.length === 0) {
				uni.showToast({ title: '购物车为空', icon: 'none' });
				setTimeout(() => uni.navigateBack(), 1000);
				return;
			}
			this.loadPreCheckData();
		},
		methods: {
			async loadPreCheckData() {
				uni.showLoading({ title: '资金/库存预检中' });
				
				const customerId = getGlobalCustomerId();
				const productIds = this.cartItems.map(item => item.product_id);
				
				// 并发调用两个接口：GetStock 和 GetBalance
				const [stockRes, balanceRes] = await Promise.all([
					api.productStock(productIds),
					api.fundBalance(customerId)
				]);
				
				uni.hideLoading();
				
				// 1. 校验库存
				if (!stockRes.success) {
					uni.showModal({ title: '库存预检失败', content: stockRes.msg, showCancel: false });
					return;
				}
				
				const stockMap = stockRes.data.reduce((map, item) => {
					map[item.product_id] = item.stock;
					return map;
				}, {});
				
				let stockCheckPassed = true;
				for (const item of this.cartItems) {
					if (item.qty > stockMap[item.product_id]) {
						stockCheckPassed = false;
						uni.showModal({ title: '库存不足', content: `${item.name} 库存仅剩 ${stockMap[item.product_id]}，请返回购物车修改数量。`, showCancel: false });
						return;
					}
				}
				
				// 2. 校验余额
				if (balanceRes.success) {
					this.balance = balanceRes.data;
				} else {
					uni.showModal({ title: '资金预检失败', content: balanceRes.msg, showCancel: false });
				}
			},
			
			async handleSubmitOrder() {
				if (!this.isBalanceSufficient) {
					uni.showToast({ title: `账户余额不足，缺口 ¥${this.shortfall.toFixed(2)}`, icon: 'none' });
					return;
				}
				
				this.isSubmitting = true;
				uni.showLoading({ title: '订单提交中', mask: true }); // 全屏遮罩，防止重复点击
				
				const orderItems = this.cartItems.map(item => ({
					product_id: item.product_id,
					qty: item.qty,
					price: item.price,
				}));
				
				const res = await api.orderCreate(orderItems);
				
				uni.hideLoading();
				this.isSubmitting = false;
				
				if (res.success) {
					this.$store.commit('CLEAR_CART'); // 清空购物车
					uni.reLaunch({ url: `/pages/order/success?orderId=${res.data.order_id}` });
				} else {
					// 失败：Toast 提示具体错误
					uni.showToast({ title: res.msg, icon: 'none', duration: 3000 });
					// 重新加载资金和库存信息
					this.loadPreCheckData();
				}
			}
		}
	}
</script>

<style scoped>
	.checkout-container {
		padding-bottom: 120rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		padding: 20rpx;
		background-color: #f5f5f5;
		border-bottom: 1px solid #eee;
	}
	
	.product-list {
		padding: 0 20rpx;
		background-color: white;
		margin-bottom: 20rpx;
	}
	
	.product-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.item-info {
		flex: 1;
	}
	
	.item-name {
		font-size: 28rpx;
		color: #333;
	}
	
	.item-spec {
		font-size: 24rpx;
		color: #999;
		margin-left: 10rpx;
	}
	
	.item-quantity {
		width: 100rpx;
		text-align: right;
		font-size: 28rpx;
		color: #666;
	}
	
	.item-price {
		width: 150rpx;
		text-align: right;
		font-size: 30rpx;
		font-weight: bold;
		color: #E64A19;
	}
	
	.balance-info, .address-info {
		padding: 20rpx;
		background-color: white;
		margin-bottom: 20rpx;
	}
	
	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 10rpx 0;
		font-size: 28rpx;
		border-bottom: 1px dashed #eee;
	}
	
	.info-row:last-child {
		border-bottom: none;
	}
	
	.total-check {
		font-weight: bold;
		margin-top: 10rpx;
		border-top: 1px solid #eee;
	}
	
	.label {
		color: #666;
	}
	
	.value {
		color: #333;
		font-weight: bold;
	}
	
	.total-amount {
		color: #1976D2;
	}
	
	.insufficient {
		color: #F44336; /* 余额不足时变红 */
	}
	
	.warning-box {
		margin-top: 20rpx;
		padding: 15rpx;
		background-color: #FFEBEE;
		border: 1px solid #F44336;
		border-radius: 8rpx;
	}
	
	.warning-text {
		color: #F44336;
		font-size: 28rpx;
		font-weight: bold;
	}
	
	.address-info text {
		display: block;
		padding: 5rpx 0;
		font-size: 28rpx;
		color: #333;
	}
	
	/* 底部提交栏 */
	.submit-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: white;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}
	
	.total-display {
		flex: 1;
		display: flex;
		align-items: baseline;
		font-size: 28rpx;
		color: #666;
	}
	
	.final-amount {
		font-size: 40rpx;
		font-weight: bold;
		color: #E64A19;
		margin-left: 10rpx;
	}
	
	.submit-btn {
		width: 250rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 32rpx;
		background-color: #1976D2;
		color: white;
		padding: 0;
	}
	
	.submit-btn[disabled] {
		background-color: #999;
	}
</style>
