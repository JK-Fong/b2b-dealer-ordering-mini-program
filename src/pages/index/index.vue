<template>
	<view class="page-container">
		<!-- 顶部用户信息区域 -->
		<view class="header-section">
			<view class="user-info">
				<text class="user-name">{{ userInfo.customer_name || 'Zhang San Dealer' }}</text>
				<text class="user-id">ID: {{ userInfo.customer_id || '88234567' }}</text>
			</view>
			<view class="header-icons">
				<view class="icon-btn notification">
					<text class="icon">🔔</text>
					<view v-if="hasNotification" class="red-dot"></view>
				</view>
				<view class="icon-btn settings">
					<text class="icon">⚙️</text>
				</view>
			</view>
		</view>
		
		<!-- 账户余额卡片 -->
		<view class="balance-card">
			<view class="balance-label">Account Balance</view>
			<view class="balance-amount">¥{{ balance.available_balance.toFixed(2) }}</view>
			<view class="balance-divider"></view>
			<view class="balance-details">
				<view class="detail-item">
					<text class="detail-icon">🔒</text>
					<view class="detail-info">
						<text class="detail-label">Frozen Amount</text>
						<text class="detail-value">¥{{ balance.frozen_amount.toFixed(2) }}</text>
					</view>
				</view>
				<view class="detail-item">
					<text class="detail-icon">💳</text>
					<view class="detail-info">
						<text class="detail-label">Credit Limit</text>
						<text class="detail-value">¥{{ balance.credit_limit.toFixed(2) }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 资金流水标题 -->
		<view class="section-header">
			<text class="section-title">Fund Flow Records</text>
		</view>
		
		<!-- 资金流水列表 -->
		<view class="transaction-list">
			<view v-if="loading" class="loading-state">
				<text class="loading-text">Loading...</text>
			</view>
			<view v-else-if="transactions.length === 0" class="empty-state">
				<text class="empty-text">No transaction records</text>
			</view>
			<view v-else class="transaction-items">
				<view 
					v-for="(item, index) in transactions" 
					:key="index" 
					class="transaction-item"
				>
					<view class="transaction-left">
						<text class="transaction-title">{{ item.summary }}</text>
						<text class="transaction-time">{{ item.time }}</text>
					</view>
					<view class="transaction-right">
						<text 
							class="transaction-amount" 
							:class="item.amount > 0 ? 'positive' : 'negative'"
						>
							{{ item.amount > 0 ? '+' : '' }}¥{{ Math.abs(item.amount).toFixed(2) }}
						</text>
						<text class="transaction-balance">Balance: ¥{{ item.new_balance.toFixed(2) }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { api } from '@/utils/api';

	export default {
		data() {
			return {
				userInfo: {},
				balance: {
					available_balance: 12000.50,
					frozen_amount: 1500.00,
					credit_limit: 50000.00,
				},
				transactions: [],
				loading: false,
				hasNotification: true, // 是否有未读通知
			};
		},
		onShow() {
			if (!this.$store.state.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/login' });
				return;
			}
			this.userInfo = this.$store.state.userInfo;
			this.loadData();
		},
		onPullDownRefresh() {
			this.loadData().then(() => {
				uni.stopPullDownRefresh();
			});
		},
		methods: {
			async loadData() {
				this.loading = true;
				const customerId = this.userInfo.customer_id;
				
				const [balanceRes, transactionRes] = await Promise.all([
					api.fundBalance(customerId),
					api.fundTransactionList(customerId)
				]);
				
				this.loading = false;
				
				if (balanceRes.success) {
					this.balance = balanceRes.data;
				} else {
					uni.showToast({ title: balanceRes.msg, icon: 'none' });
				}
				
				if (transactionRes.success) {
					this.transactions = transactionRes.data;
				} else {
					uni.showToast({ title: transactionRes.msg, icon: 'none' });
				}
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
		background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
		padding: 40rpx 30rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	
	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	
	.user-name {
		font-size: 40rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-bottom: 8rpx;
	}
	
	.user-id {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.9);
	}
	
	.header-icons {
		display: flex;
		gap: 20rpx;
	}
	
	.icon-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
	
	.icon-btn .icon {
		font-size: 40rpx;
	}
	
	.red-dot {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 16rpx;
		height: 16rpx;
		background-color: #FF5722;
		border-radius: 50%;
		border: 2rpx solid #1976D2;
	}
	
	/* 账户余额卡片 */
	.balance-card {
		background-color: #FFFFFF;
		margin: 30rpx;
		padding: 40rpx 30rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	}
	
	.balance-label {
		font-size: 28rpx;
		color: #666666;
		margin-bottom: 12rpx;
	}
	
	.balance-amount {
		font-size: 64rpx;
		font-weight: bold;
		color: #1976D2;
		margin-bottom: 24rpx;
		letter-spacing: 1rpx;
	}
	
	.balance-divider {
		height: 1rpx;
		background: linear-gradient(to right, transparent, #E0E0E0, transparent);
		margin-bottom: 24rpx;
	}
	
	.balance-details {
		display: flex;
		justify-content: space-around;
	}
	
	.detail-item {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}
	
	.detail-icon {
		font-size: 36rpx;
	}
	
	.detail-info {
		display: flex;
		flex-direction: column;
	}
	
	.detail-label {
		font-size: 24rpx;
		color: #999999;
		margin-bottom: 4rpx;
	}
	
	.detail-value {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
	}
	
	/* 资金流水标题 */
	.section-header {
		background-color: #FFFFFF;
		padding: 24rpx 30rpx;
		margin-top: 20rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #1976D2;
	}
	
	/* 资金流水列表 */
	.transaction-list {
		background-color: #FFFFFF;
		padding: 0 30rpx 30rpx;
		min-height: 400rpx;
	}
	
	.loading-state,
	.empty-state {
		padding: 100rpx 0;
		text-align: center;
	}
	
	.loading-text,
	.empty-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	.transaction-items {
		display: flex;
		flex-direction: column;
	}
	
	.transaction-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #F0F0F0;
	}
	
	.transaction-item:last-child {
		border-bottom: none;
	}
	
	.transaction-left {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	
	.transaction-title {
		font-size: 30rpx;
		color: #333333;
		font-weight: 500;
	}
	
	.transaction-time {
		font-size: 24rpx;
		color: #999999;
	}
	
	.transaction-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8rpx;
	}
	
	.transaction-amount {
		font-size: 34rpx;
		font-weight: bold;
	}
	
	.transaction-amount.positive {
		color: #4CAF50;
	}
	
	.transaction-amount.negative {
		color: #F44336;
	}
	
	.transaction-balance {
		font-size: 24rpx;
		color: #1976D2;
	}
</style>
