<template>
	<view class="page-container">
		<!-- 顶部用户信息区域 -->
		<view class="header-section">
			<view class="user-card">
				<view class="avatar-wrapper">
					<text class="avatar-text">{{ userInfo.customer_name ? userInfo.customer_name.substring(0, 1) : '张' }}</text>
				</view>
				<view class="user-details">
					<text class="user-name">{{ userInfo.customer_name || '张三经销商' }}</text>
					<text class="user-id">客户ID: {{ userInfo.customer_id || '88291034' }}</text>
				</view>
			</view>
			<view class="logout-button" @click="handleLogout">
				<text class="logout-icon">⎋</text>
				<text class="logout-text">退出登录</text>
			</view>
		</view>
		
		<!-- 快捷菜单区域 -->
		<view class="menu-section">
			<view class="menu-item" @click="goToCart">
				<view class="menu-icon-wrapper cart">
					<text class="menu-icon">🛒</text>
				</view>
				<view class="menu-content">
					<text class="menu-title">购物车</text>
					<text class="menu-subtitle">查看已选商品</text>
				</view>
				<view v-if="$store.getters.cartCount > 0" class="menu-badge">
					<text class="badge-number">{{ $store.getters.cartCount }}</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
			<view v-if="$store.getters.isSalesRep" class="menu-item" @click="goToDealerSelect">
				<view class="menu-icon-wrapper proxy">
					<text class="menu-icon">👥</text>
				</view>
				<view class="menu-content">
					<text class="menu-title">代客下单</text>
					<text class="menu-subtitle">为客户代理下单</text>
				</view>
				<view class="sales-badge">
					<text class="sales-badge-text">业务员</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>
		</view>
		
		<!-- 我的订单标题 -->
		<view class="section-header">
			<text class="section-title">我的订单</text>
			<text class="section-more">查看全部 ›</text>
		</view>
		
		<!-- 订单列表 -->
		<view class="order-list">
			<view v-if="loading" class="loading-state">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
			<view v-else-if="orders.length === 0" class="empty-state">
				<text class="empty-icon">📦</text>
				<text class="empty-text">暂无订单</text>
			</view>
			<view v-else class="order-container">
				<view 
					v-for="order in orders" 
					:key="order.order_id" 
					class="order-card"
					@click="goToOrderDetail(order)"
				>
					<view class="order-header">
						<text class="order-number">订单号 {{ order.order_id }}</text>
						<view 
							class="status-tag" 
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
					<view class="order-body">
						<text class="order-date">{{ order.order_date }}</text>
						<text class="order-amount">¥{{ order.total_amount.toFixed(2) }}</text>
					</view>
					<view class="order-footer">
						<text class="order-action">查看详情 ›</text>
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
		background: linear-gradient(to bottom, #F7F8FA 0%, #FFFFFF 100%);
	}
	
	/* 顶部用户信息区域 */
	.header-section {
		background: linear-gradient(135deg, #576BDB 0%, #4A5FC1 100%);
		padding: 60rpx 32rpx 40rpx;
		display: flex;
		flex-direction: column;
		gap: 32rpx;
	}
	
	.user-card {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}
	
	.avatar-wrapper {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%);
		border: 4rpx solid rgba(255, 255, 255, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(10rpx);
	}
	
	.avatar-text {
		font-size: 56rpx;
		font-weight: bold;
		color: #FFFFFF;
	}
	
	.user-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	
	.user-name {
		font-size: 40rpx;
		font-weight: bold;
		color: #FFFFFF;
	}
	
	.user-id {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.logout-button {
		align-self: stretch;
		height: 88rpx;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10rpx);
	}
	
	.logout-icon {
		font-size: 32rpx;
		color: #576BDB;
	}
	
	.logout-text {
		font-size: 30rpx;
		color: #576BDB;
		font-weight: 600;
	}
	
	/* 快捷菜单区域 */
	.menu-section {
		background: #FFFFFF;
		margin: 24rpx 32rpx;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		padding: 32rpx 24rpx;
		border-bottom: 1rpx solid #F0F0F0;
		position: relative;
		transition: all 0.3s;
	}
	
	.menu-item:last-child {
		border-bottom: none;
	}
	
	.menu-item:active {
		background: #F7F8FA;
	}
	
	.menu-icon-wrapper {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}
	
	.menu-icon-wrapper.cart {
		background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
	}
	
	.menu-icon-wrapper.proxy {
		background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
	}
	
	.menu-icon {
		font-size: 44rpx;
	}
	
	.menu-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}
	
	.menu-title {
		font-size: 32rpx;
		color: #1A1A1A;
		font-weight: 600;
	}
	
	.menu-subtitle {
		font-size: 24rpx;
		color: #999999;
	}
	
	.menu-badge {
		min-width: 40rpx;
		height: 40rpx;
		background: linear-gradient(135deg, #FA5151 0%, #E64340 100%);
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 12rpx;
		margin-right: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(250, 81, 81, 0.3);
	}
	
	.badge-number {
		font-size: 22rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
	
	.sales-badge {
		padding: 8rpx 20rpx;
		background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
		border-radius: 20rpx;
		margin-right: 16rpx;
	}
	
	.sales-badge-text {
		font-size: 22rpx;
		color: #576BDB;
		font-weight: 600;
	}
	
	.menu-arrow {
		font-size: 56rpx;
		color: #CCCCCC;
		font-weight: 300;
	}
	
	/* 我的订单标题 */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 40rpx 32rpx 24rpx;
	}
	
	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #1A1A1A;
	}
	
	.section-more {
		font-size: 26rpx;
		color: #999999;
	}
	
	/* 订单列表 */
	.order-list {
		padding: 0 32rpx 32rpx;
		min-height: 400rpx;
	}
	
	.loading-state,
	.empty-state {
		padding: 120rpx 0;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24rpx;
	}
	
	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid #F0F0F0;
		border-top-color: #576BDB;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.loading-text,
	.empty-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	.empty-icon {
		font-size: 120rpx;
		opacity: 0.3;
	}
	
	.order-container {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
	
	/* 订单卡片 */
	.order-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		transition: all 0.3s;
	}
	
	.order-card:active {
		transform: scale(0.98);
	}
	
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.order-number {
		font-size: 28rpx;
		color: #666666;
	}
	
	.status-tag {
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		background: #E0E0E0;
	}
	
	.status-tag.status-pending {
		background: linear-gradient(135deg, #576BDB 0%, #4A5FC1 100%);
	}
	
	.status-tag.status-shipped {
		background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
	}
	
	.status-tag.status-delivered {
		background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
	}
	
	.status-tag.status-cancelled {
		background: linear-gradient(135deg, #999999 0%, #757575 100%);
	}
	
	.status-text {
		font-size: 22rpx;
		color: #FFFFFF;
		font-weight: 600;
	}
	
	.order-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.order-date {
		font-size: 26rpx;
		color: #999999;
	}
	
	.order-amount {
		font-size: 40rpx;
		font-weight: bold;
		color: #FA5151;
	}
	
	.order-footer {
		display: flex;
		justify-content: flex-end;
		padding-top: 16rpx;
		border-top: 1rpx solid #F0F0F0;
	}
	
	.order-action {
		font-size: 26rpx;
		color: #576BDB;
		font-weight: 500;
	}
</style>
