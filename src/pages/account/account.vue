<template>
	<view class="account-container">
		<view class="section-title">客户信息</view>
		<view class="info-card">
			<view class="info-row">
				<text class="label">客户名称:</text>
				<text class="value">{{ userInfo.customer_name }}</text>
			</view>
			<view class="info-row">
				<text class="label">客户代码:</text>
				<text class="value">{{ userInfo.customer_id }}</text>
			</view>
		</view>
		
		<view class="section-title">资金概览</view>
		<view class="info-card">
			<view v-if="loading" class="loading-text">加载中...</view>
			<view v-else>
				<view class="info-row">
					<text class="label">可用余额:</text>
					<text class="value balance-value">¥ {{ balance.available_balance.toFixed(2) }}</text>
				</view>
				<view class="info-row">
					<text class="label">冻结金额:</text>
					<text class="value">¥ {{ balance.frozen_amount.toFixed(2) }}</text>
				</view>
				<view class="info-row">
					<text class="label">授信额度:</text>
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
				userInfo: this.$store.state.userInfo,
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
			this.loadAccountData();
		},
		methods: {
			async loadAccountData() {
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
	.account-container {
		padding-bottom: 20rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		padding: 20rpx;
		background-color: #f5f5f5;
		border-bottom: 1px solid #eee;
	}
	
	.info-card {
		padding: 0 20rpx;
		background-color: white;
		margin-bottom: 20rpx;
	}
	
	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 20rpx 0;
		font-size: 28rpx;
		border-bottom: 1px solid #eee;
	}
	
	.info-row:last-child {
		border-bottom: none;
	}
	
	.label {
		color: #666;
	}
	
	.value {
		color: #333;
		font-weight: bold;
	}
	
	.balance-value {
		color: #1976D2;
		font-size: 32rpx;
	}
	
	.loading-text, .empty-text {
		text-align: center;
		padding: 30rpx;
		color: #999;
	}
	
	.transaction-list {
		background-color: white;
	}
	
	.transaction-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
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
