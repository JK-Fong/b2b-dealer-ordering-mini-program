<template>
	<view class="page-container">
		<!-- 顶部用户信息区域 -->
		<view class="header-section">
			<view class="user-info">
				<text class="user-name">{{ userInfo.customer_name || '张三经销商' }}</text>
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
			<text class="balance-label">账户余额</text>
			<text class="balance-amount">¥{{ balance.available_balance.toFixed(2) }}</text>
			<view class="balance-divider"></view>
			<view class="balance-details">
				<view class="detail-item">
					<text class="detail-icon">🔒</text>
					<view class="detail-info">
						<text class="detail-label">冻结金额</text>
						<text class="detail-value">¥{{ balance.frozen_amount.toFixed(2) }}</text>
					</view>
				</view>
				<view class="detail-item">
					<text class="detail-icon">💳</text>
					<view class="detail-info">
						<text class="detail-label">授信额度</text>
						<text class="detail-value">¥{{ balance.credit_limit.toFixed(2) }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 资金流水标题 -->
		<view class="section-header">
			<text class="section-title">资金流水记录</text>
		</view>
		
		<!-- 资金流水列表 -->
		<view class="transaction-list">
			<view v-if="loading" class="loading-state">
				<text class="loading-text">加载中...</text>
			</view>
			<view v-else-if="transactions.length === 0" class="empty-state">
				<text class="empty-text">暂无流水记录</text>
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
						<text class="transaction-balance">余额: ¥{{ item.new_balance.toFixed(2) }}</text>
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
				hasNotification: true,
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
		background-color: #000000;
	}
	
	/* 顶部用户信息区域 */
	.header-section {
		background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
		padding: 60rpx 40rpx 40rpx;
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
		font-size: 44rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-bottom: 12rpx;
	}
	
	.user-id {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.85);
	}
	
	.header-icons {
		display: flex;
		gap: 24rpx;
	}
	
	.icon-btn {
		width: 68rpx;
		height: 68rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
	
	.icon-btn .icon {
		font-size: 44rpx;
	}
	
	.red-dot {
		position: absolute;
		top: 10rpx;
		right: 10rpx;
		width: 18rpx;
		height: 18rpx;
		background-color: #FF5252;
		border-radius: 50%;
		border: 3rpx solid #4A90E2;
	}
	
	/* 账户余额卡片 */
	.balance-card {
		background-color: #FFFFFF;
		margin: -40rpx 30rpx 0;
		padding: 50rpx 40rpx;
		border-radius: 20rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
		text-align: center;
	}
	
	.balance-label {
		font-size: 30rpx;
		color: #333333;
		margin-bottom: 16rpx;
		display: block;
	}
	
	.balance-amount {
		font-size: 72rpx;
		font-weight: bold;
		color: #1976D2;
		margin-bottom: 32rpx;
		letter-spacing: 2rpx;
		display: block;
	}
	
	.balance-divider {
		height: 2rpx;
		background: linear-gradient(to right, transparent, #E0E0E0 20%, #E0E0E0 80%, transparent);
		margin-bottom: 32rpx;
	}
	
	.balance-details {
		display: flex;
		justify-content: space-around;
	}
	
	.detail-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}
	
	.detail-icon {
		font-size: 40rpx;
	}
	
	.detail-info {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.detail-label {
		font-size: 26rpx;
		color: #999999;
		margin-bottom: 8rpx;
	}
	
	.detail-value {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}
	
	/* 资金流水标题 */
	.section-header {
		background-color: transparent;
		padding: 40rpx 30rpx 24rpx;
	}
	
	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #1976D2;
	}
	
	/* 资金流水列表 */
	.transaction-list {
		background-color: transparent;
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
		gap: 16rpx;
	}
	
	.transaction-item {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 28rpx 24rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}
	
	.transaction-left {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
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
		gap: 10rpx;
	}
	
	.transaction-amount {
		font-size: 36rpx;
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
