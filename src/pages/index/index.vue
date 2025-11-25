<template>
	<view class="container">
		<view class="header">
			<view class="user-info">
				<text class="customer-name">{{ $store.getters.currentCustomerName }}</text>
				<text class="customer-id">客户代码: {{ userInfo.customer_id }}</text>
			</view>
		</view>
		
		<view class="balance-card">
			<view class="balance-title">账户余额</view>
			<view class="balance-amount">¥ {{ balance.available_balance.toFixed(2) }}</view>
			<view class="balance-detail">
				<view class="detail-item">
					<text class="label">冻结金额</text>
					<text class="value">¥ {{ balance.frozen_amount.toFixed(2) }}</text>
				</view>
				<view class="detail-item">
					<text class="label">授信额度</text>
					<text class="value">¥ {{ balance.credit_limit.toFixed(2) }}</text>
				</view>
			</view>
		</view>
		
		<view class="section-title">资金流水</view>
		<view class="transaction-list">
			<view v-if="loading" class="loading-text">加载中...</view>
			<view v-else-if="transactions.length === 0" class="empty-text">暂无资金流水</view>
			<view v-else v-for="(item, index) in transactions" :key="index" class="transaction-item">
				<view class="item-left">
					<text class="summary">{{ item.summary }}</text>
					<text class="time">{{ item.time }}</text>
				</view>
				<view class="item-right">
					<text class="amount" :class="{'positive': item.amount > 0, 'negative': item.amount < 0}">
						{{ item.amount > 0 ? '+' : '' }}{{ item.amount.toFixed(2) }}
					</text>
					<text class="new-balance">余额: {{ item.new_balance.toFixed(2) }}</text>
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
				userInfo: this.$store.state.userInfo || {},
				balance: {
					available_balance: 0,
					frozen_amount: 0,
					credit_limit: 0,
				},
				transactions: [],
				loading: true,
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
	.container {
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.header {
		background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
		padding: 30rpx 20rpx;
		color: white;
	}
	
	.user-info {
		display: flex;
		flex-direction: column;
	}
	
	.customer-name {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}
	
	.customer-id {
		font-size: 24rpx;
		opacity: 0.9;
	}
	
	.balance-card {
		background-color: white;
		margin: 20rpx;
		padding: 30rpx;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.balance-title {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 10rpx;
	}
	
	.balance-amount {
		font-size: 56rpx;
		font-weight: bold;
		color: #1976D2;
		margin-bottom: 20rpx;
	}
	
	.balance-detail {
		display: flex;
		justify-content: space-around;
		padding-top: 20rpx;
		border-top: 1px dashed #eee;
	}
	
	.detail-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.detail-item .label {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 5rpx;
	}
	
	.detail-item .value {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		padding: 20rpx;
		background-color: white;
		margin-top: 20rpx;
	}
	
	.transaction-list {
		background-color: white;
		padding: 0 20rpx;
	}
	
	.loading-text, .empty-text {
		text-align: center;
		padding: 50rpx;
		color: #999;
	}
	
	.transaction-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.item-left {
		display: flex;
		flex-direction: column;
	}
	
	.summary {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
	}
	
	.time {
		font-size: 24rpx;
		color: #999;
		margin-top: 5rpx;
	}
	
	.item-right {
		text-align: right;
		display: flex;
		flex-direction: column;
	}
	
	.amount {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.positive {
		color: #4CAF50;
	}
	
	.negative {
		color: #F44336;
	}
	
	.new-balance {
		font-size: 24rpx;
		color: #1976D2;
		margin-top: 5rpx;
	}
</style>
