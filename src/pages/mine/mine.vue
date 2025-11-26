<template>
	<view class="page-container">
		<!-- 顶部用户信息区域 -->
		<view class="header-section">
			<view class="user-card">
				<view class="avatar-circle">
					<text class="avatar-letter">{{ userInfo.customer_name ? userInfo.customer_name.substring(0, 1) : '张' }}</text>
				</view>
				<view class="user-details">
					<text class="user-name">{{ userInfo.customer_name || '张三经销商' }}</text>
					<text class="user-id">客户ID: {{ userInfo.customer_id || '88291034' }}</text>
				</view>
			</view>
			<view class="logout-button" @click="handleLogout">
				<text class="logout-text">退出登录</text>
			</view>
		</view>
		
		<!-- 快捷菜单区域 -->
		<view class="menu-section">
			<view class="menu-item" @click="goToCart">
				<text class="menu-icon">🛒</text>
				<text class="menu-title">购物车</text>
				<view v-if="$store.getters.cartCount > 0" class="menu-badge">
					<text class="badge-number">{{ $store.getters.cartCount }}</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
			<view v-if="$store.getters.isSalesRep" class="menu-item" @click="goToDealerSelect">
				<text class="menu-icon">👥</text>
				<view class="menu-content">
					<text class="menu-title">代客下单</text>
					<text class="menu-subtitle">为客户代理下单</text>
				</view>
				<view class="sales-rep-badge">
					<text class="badge-text">仅业务员</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
		</view>
		
		<!-- 我的订单标题 -->
		<view class="section-header">
			<text class="section-title">我的订单</text>
		</view>
		
		<!-- 订单列表 -->
		<view class="order-list">
			<view v-if="loading" class="loading-state">
				<text class="loading-text">加载中...</text>
			</view>
			<view v-else-if="orders.length === 0" class="empty-state">
				<text class="empty-text">暂无订单</text>
			</view>
			<view v-else class="order-items">
				<view 
					v-for="order in orders" 
					:key="order.order_id" 
					class="order-card"
					@click="goToOrderDetail(order)"
				>
					<view class="order-header">
						<text class="order-number">订单 #{{ order.order_id }}</text>
						<view 
							class="status-badge" 
							:class="{
								'status-pending': order.erp_status_text === '待发货',
								'status-shipped': order.erp_status_text === '已发货',
								'status-delivered': order.erp_status_text === '已收货',
								'status-cancelled': order.erp_status_text === '已取消'
							}"
						>
							<text class="status-text">{{ order.erp_status_text }}</text>
						</view>
					</view>
					<view class="order-footer">
						<text class="order-date">{{ order.order_date }}</text>
						<text class="order-amount">¥{{ order.total_amount.toFixed(2) }}</text>
					</view>
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
				userInfo: {},
				orders: [],
				loading: false,
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
		onPullDownRefresh() {
			this.loadOrders().then(() => {
				uni.stopPullDownRefresh();
			});
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
	/* 页面容器 */
	.page-container {
		min-height: 100vh;
		background-color: #F5F5F5;
	}
	
	/* 顶部用户信息区域 */
	.header-section {
		background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
		padding: 50rpx 30rpx 40rpx;
		display: flex;
		flex-direction: column;
		gap: 32rpx;
	}
	
	.user-card {
		display: flex;
		align-items: center;
		gap: 28rpx;
	}
	
	.avatar-circle {
		width: 128rpx;
		height: 128rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.3);
		border: 4rpx solid rgba(255, 255, 255, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	
	.avatar-letter {
		font-size: 60rpx;
		font-weight: bold;
		color: #FFFFFF;
	}
	
	.user-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}
	
	.user-name {
		font-size: 42rpx;
		font-weight: bold;
		color: #FFFFFF;
	}
	
	.user-id {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.9);
	}
	
	.logout-button {
		align-self: stretch;
		height: 84rpx;
		background-color: rgba(255, 255, 255, 0.95);
		border-radius: 42rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
	}
	
	.logout-text {
		font-size: 30rpx;
		color: #1976D2;
		font-weight: 600;
	}
	
	/* 快捷菜单区域 */
	.menu-section {
		background-color: #FFFFFF;
		margin: 30rpx;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		padding: 32rpx 28rpx;
		border-bottom: 1rpx solid #F0F0F0;
		position: relative;
	}
	
	.menu-item:last-child {
		border-bottom: none;
	}
	
	.menu-icon {
		font-size: 48rpx;
		margin-right: 24rpx;
	}
	
	.menu-title {
		flex: 1;
		font-size: 32rpx;
		color: #333333;
		font-weight: 500;
	}
	
	.menu-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}
	
	.menu-subtitle {
		font-size: 24rpx;
		color: #999999;
	}
	
	.menu-badge {
		background-color: #FF5722;
		border-radius: 24rpx;
		padding: 6rpx 16rpx;
		margin-right: 16rpx;
	}
	
	.badge-number {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
	
	.sales-rep-badge {
		background-color: #E3F2FD;
		border-radius: 20rpx;
		padding: 8rpx 20rpx;
		margin-right: 16rpx;
	}
	
	.badge-text {
		font-size: 24rpx;
		color: #1976D2;
		font-weight: 500;
	}
	
	.menu-arrow {
		font-size: 60rpx;
		color: #CCCCCC;
		font-weight: 300;
	}
	
	/* 我的订单标题 */
	.section-header {
		background-color: transparent;
		padding: 32rpx 30rpx 24rpx;
	}
	
	.section-title {
		font-size: 38rpx;
		font-weight: bold;
		color: #333333;
	}
	
	/* 订单列表 */
	.order-list {
		background-color: transparent;
		padding: 0 30rpx 30rpx;
		min-height: 400rpx;
	}
	
	.loading-state,
	.empty-state {
		padding: 120rpx 0;
		text-align: center;
	}
	
	.loading-text,
	.empty-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	.order-items {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}
	
	/* 订单卡片 */
	.order-card {
		background-color: #FFFFFF;
		border-radius: 20rpx;
		padding: 28rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}
	
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.order-number {
		font-size: 30rpx;
		color: #333333;
		font-weight: bold;
	}
	
	.status-badge {
		padding: 10rpx 24rpx;
		border-radius: 24rpx;
		background-color: #E0E0E0;
	}
	
	.status-badge.status-pending {
		background-color: #1976D2;
	}
	
	.status-badge.status-shipped {
		background-color: #FF9800;
	}
	
	.status-badge.status-delivered {
		background-color: #4CAF50;
	}
	
	.status-badge.status-cancelled {
		background-color: #999999;
	}
	
	.status-text {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: 600;
	}
	
	.order-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.order-date {
		font-size: 26rpx;
		color: #999999;
	}
	
	.order-amount {
		font-size: 38rpx;
		font-weight: bold;
		color: #FF5722;
	}
</style>
