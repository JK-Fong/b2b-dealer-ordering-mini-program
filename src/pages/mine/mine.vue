<template>
	<view class="mine-container">
		<view class="header">
			<view class="user-card">
				<view class="avatar">{{ userInfo.customer_name ? userInfo.customer_name.substring(0, 1) : '用' }}</view>
				<view class="user-info">
					<text class="user-name">{{ userInfo.customer_name }}</text>
					<text class="user-id">客户代码: {{ userInfo.customer_id }}</text>
				</view>
			</view>
			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>
		
		<view class="menu-section">
			<view class="menu-item" @click="goToCart">
				<text class="menu-icon">🛒</text>
				<text class="menu-title">购物车</text>
				<text v-if="$store.getters.cartCount > 0" class="menu-badge">{{ $store.getters.cartCount }}</text>
				<text class="menu-arrow">›</text>
			</view>
			<view class="menu-item" v-if="$store.getters.isSalesRep" @click="goToDealerSelect">
				<text class="menu-icon">👥</text>
				<text class="menu-title">代客下单</text>
				<text class="menu-arrow">›</text>
			</view>
		</view>
		
		<view class="section-title">我的订单</view>
		<view class="order-list">
			<view v-if="loading" class="loading-text">加载中...</view>
			<view v-else-if="orders.length === 0" class="empty-text">暂无订单</view>
			<view v-else v-for="order in orders" :key="order.order_id" class="order-item" @click="goToOrderDetail(order)">
				<view class="order-header">
					<text class="order-id">订单号: {{ order.order_id }}</text>
					<text class="order-status" :class="{'status-cancel': order.erp_status_text === '已取消'}">{{ order.erp_status_text }}</text>
				</view>
				<view class="order-body">
					<text class="order-date">{{ order.order_date }}</text>
					<text class="order-amount">¥ {{ order.total_amount.toFixed(2) }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { api, getGlobalCustomerId } from '@/utils/api';

	export default {
		data() {
			return {
				userInfo: this.$store.state.userInfo || {},
				orders: [],
				loading: true,
			};
		},
		onShow() {
			if (!this.$store.state.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/login' });
				return;
			}
			this.userInfo = this.$store.state.userInfo;
			this.loadOrders();
		},
		methods: {
			handleLogout() {
				uni.showModal({
					title: '确认退出',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							this.$store.commit('LOGOUT');
							uni.reLaunch({ url: '/pages/login/login' });
						}
					}
				});
			},
			goToCart() {
				uni.navigateTo({ url: '/pages/cart/cart' });
			},
			goToDealerSelect() {
				uni.navigateTo({ url: '/pages/sales/dealer-select' });
			},
			async loadOrders() {
				this.loading = true;
				const customerId = getGlobalCustomerId();
				const res = await api.orderList(customerId);
				this.loading = false;

				if (res.success) {
					this.orders = res.data;
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			},
			goToOrderDetail(order) {
				uni.navigateTo({ url: `/pages/order/detail?orderId=${order.order_id}` });
			}
		}
	}
</script>

<style scoped>
	.mine-container {
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.header {
		background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
		padding: 30rpx 20rpx;
		color: white;
	}
	
	.user-card {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48rpx;
		font-weight: bold;
		margin-right: 20rpx;
	}
	
	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	
	.user-name {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}
	
	.user-id {
		font-size: 24rpx;
		opacity: 0.9;
	}
	
	.logout-btn {
		height: 60rpx;
		line-height: 60rpx;
		font-size: 28rpx;
		background-color: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.5);
		border-radius: 30rpx;
	}
	
	.menu-section {
		background-color: white;
		margin: 20rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		padding: 25rpx 20rpx;
		border-bottom: 1px solid #f0f0f0;
		position: relative;
	}
	
	.menu-item:last-child {
		border-bottom: none;
	}
	
	.menu-icon {
		font-size: 40rpx;
		margin-right: 15rpx;
	}
	
	.menu-title {
		flex: 1;
		font-size: 30rpx;
		color: #333;
	}
	
	.menu-badge {
		background-color: #FF5722;
		color: white;
		border-radius: 20rpx;
		padding: 2rpx 10rpx;
		font-size: 20rpx;
		margin-right: 10rpx;
	}
	
	.menu-arrow {
		font-size: 48rpx;
		color: #ccc;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		padding: 20rpx;
		background-color: white;
		margin-top: 20rpx;
	}
	
	.order-list {
		background-color: white;
		padding: 0 20rpx;
	}
	
	.loading-text, .empty-text {
		text-align: center;
		padding: 50rpx;
		color: #999;
	}
	
	.order-item {
		padding: 20rpx 0;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}
	
	.order-id {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}
	
	.order-status {
		font-size: 28rpx;
		color: #1976D2;
		font-weight: bold;
	}
	
	.status-cancel {
		color: #999;
	}
	
	.order-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.order-date {
		font-size: 24rpx;
		color: #999;
	}
	
	.order-amount {
		font-size: 32rpx;
		color: #E64A19;
		font-weight: bold;
	}
</style>
