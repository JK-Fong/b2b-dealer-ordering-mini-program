<template>
	<view class="page-container">
		<!-- 顶部用户信息区域 -->
		<view class="header-section">
			<view class="user-info">
				<text class="user-name">{{ userInfo.customer_name || '张三经销商' }}</text>
				<text class="user-id">ID: {{ userInfo.customer_id || '88234567' }}</text>
			</view>
			<view class="header-actions">
				<view class="action-btn notification" @click="handleNotification">
					<text class="action-icon">🔔</text>
					<view v-if="hasNotification" class="red-dot"></view>
				</view>
			</view>
		</view>
		
		<!-- 账户余额卡片 -->
		<view class="balance-card">
			<view class="balance-header">
				<text class="balance-label">账户余额</text>
				<text class="balance-unit">元</text>
			</view>
			<text class="balance-amount">{{ balance.available_balance.toFixed(2) }}</text>
			<view class="balance-divider"></view>
			<view class="balance-details">
				<view class="detail-item">
					<view class="detail-icon-wrapper frozen">
						<text class="detail-icon">🔒</text>
					</view>
					<view class="detail-content">
						<text class="detail-label">冻结金额</text>
						<text class="detail-value">¥{{ balance.frozen_amount.toFixed(2) }}</text>
					</view>
				</view>
				<view class="detail-divider"></view>
				<view class="detail-item">
					<view class="detail-icon-wrapper credit">
						<text class="detail-icon">💳</text>
					</view>
					<view class="detail-content">
						<text class="detail-label">授信额度</text>
						<text class="detail-value">¥{{ balance.credit_limit.toFixed(2) }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 资金流水标题 -->
		<view class="section-header">
			<text class="section-title">资金流水</text>
			<text class="section-more">查看全部 ›</text>
		</view>
		
		<!-- 资金流水列表 -->
		<view class="transaction-list">
			<view v-if="loading" class="loading-state">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
			<view v-else-if="transactions.length === 0" class="empty-state">
				<text class="empty-icon">📊</text>
				<text class="empty-text">暂无流水记录</text>
			</view>
			<view v-else class="transaction-container">
				<view 
					v-for="(item, index) in transactions" 
					:key="index" 
					class="transaction-item"
				>
					<view class="transaction-icon-wrapper" :class="item.amount > 0 ? 'income' : 'expense'">
						<text class="transaction-icon">{{ item.amount > 0 ? '↓' : '↑' }}</text>
					</view>
					<view class="transaction-content">
						<text class="transaction-title">{{ item.summary }}</text>
						<text class="transaction-time">{{ item.time }}</text>
					</view>
					<view class="transaction-amount-wrapper">
						<text 
							class="transaction-amount" 
							:class="item.amount > 0 ? 'positive' : 'negative'"
						>
							{{ item.amount > 0 ? '+' : '' }}¥{{ Math.abs(item.amount).toFixed(2) }}
						</text>
						<text class="transaction-balance">余额 ¥{{ item.new_balance.toFixed(2) }}</text>
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
			handleNotification() {
				uni.showToast({ title: '暂无新通知', icon: 'none' });
			},
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
		background: linear-gradient(to bottom, #F7F8FA 0%, #FFFFFF 100%);
	}
	
	/* 顶部用户信息区域 */
	.header-section {
		background: linear-gradient(135deg, #576BDB 0%, #4A5FC1 100%);
		padding: 60rpx 32rpx 120rpx;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		position: relative;
	}
	
	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	
	.user-name {
		font-size: 44rpx;
		font-weight: bold;
		color: #FFFFFF;
	}
	
	.user-id {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.header-actions {
		display: flex;
		gap: 20rpx;
	}
	
	.action-btn {
		width: 72rpx;
		height: 72rpx;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		backdrop-filter: blur(10rpx);
	}
	
	.action-icon {
		font-size: 40rpx;
	}
	
	.red-dot {
		position: absolute;
		top: 12rpx;
		right: 12rpx;
		width: 16rpx;
		height: 16rpx;
		background: linear-gradient(135deg, #FA5151 0%, #E64340 100%);
		border-radius: 50%;
		border: 3rpx solid #576BDB;
		box-shadow: 0 2rpx 8rpx rgba(250, 81, 81, 0.4);
	}
	
	/* 账户余额卡片 */
	.balance-card {
		background: #FFFFFF;
		margin: -80rpx 32rpx 0;
		padding: 40rpx 32rpx;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	}
	
	.balance-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}
	
	.balance-label {
		font-size: 28rpx;
		color: #999999;
	}
	
	.balance-unit {
		font-size: 24rpx;
		color: #CCCCCC;
	}
	
	.balance-amount {
		font-size: 80rpx;
		font-weight: bold;
		color: #576BDB;
		line-height: 1.2;
		margin-bottom: 32rpx;
		display: block;
	}
	
	.balance-divider {
		height: 1rpx;
		background: linear-gradient(to right, transparent, #E5E5E5 20%, #E5E5E5 80%, transparent);
		margin-bottom: 32rpx;
	}
	
	.balance-details {
		display: flex;
		align-items: center;
	}
	
	.detail-item {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 16rpx;
	}
	
	.detail-divider {
		width: 1rpx;
		height: 60rpx;
		background: #E5E5E5;
		margin: 0 24rpx;
	}
	
	.detail-icon-wrapper {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.detail-icon-wrapper.frozen {
		background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
	}
	
	.detail-icon-wrapper.credit {
		background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
	}
	
	.detail-icon {
		font-size: 36rpx;
	}
	
	.detail-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}
	
	.detail-label {
		font-size: 24rpx;
		color: #999999;
	}
	
	.detail-value {
		font-size: 30rpx;
		font-weight: bold;
		color: #1A1A1A;
	}
	
	/* 资金流水标题 */
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
	
	/* 资金流水列表 */
	.transaction-list {
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
	
	.transaction-container {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}
	
	.transaction-item {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 24rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		transition: all 0.3s;
	}
	
	.transaction-item:active {
		transform: scale(0.98);
	}
	
	.transaction-icon-wrapper {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	
	.transaction-icon-wrapper.income {
		background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
	}
	
	.transaction-icon-wrapper.expense {
		background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
	}
	
	.transaction-icon {
		font-size: 40rpx;
		font-weight: bold;
	}
	
	.transaction-icon-wrapper.income .transaction-icon {
		color: #4CAF50;
	}
	
	.transaction-icon-wrapper.expense .transaction-icon {
		color: #F44336;
	}
	
	.transaction-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	
	.transaction-title {
		font-size: 30rpx;
		color: #1A1A1A;
		font-weight: 500;
	}
	
	.transaction-time {
		font-size: 24rpx;
		color: #999999;
	}
	
	.transaction-amount-wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8rpx;
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
		font-size: 22rpx;
		color: #999999;
	}
</style>
