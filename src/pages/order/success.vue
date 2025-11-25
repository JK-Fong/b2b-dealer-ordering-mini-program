<template>
	<view class="success-container">
		<view class="icon-section">
			<text class="success-icon">✅</text>
		</view>
		<view class="message-section">
			<text class="main-message">订单提交成功！</text>
			<text class="sub-message">您的订单已成功提交至ERP系统处理。</text>
			<text class="order-id">ERP订单号: {{ orderId }}</text>
		</view>
		<view class="action-section">
			<button class="action-btn primary-btn" @click="goToOrderList">查看订单详情</button>
			<button class="action-btn secondary-btn" @click="goToIndex">继续订货</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderId: ''
			};
		},
		onLoad(options) {
			this.orderId = options.orderId || 'N/A';
		},
		methods: {
			goToOrderList() {
				// 假设订单列表页面的路径是 /pages/order/list
				uni.reLaunch({ url: '/pages/order/list' });
			},
			goToIndex() {
				uni.reLaunch({ url: '/pages/index/index' });
			}
		}
	}
</script>

<style scoped>
	.success-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 80rpx 40rpx;
		text-align: center;
	}
	
	.icon-section {
		margin-bottom: 40rpx;
	}
	
	.success-icon {
		font-size: 150rpx;
	}
	
	.message-section {
		margin-bottom: 80rpx;
	}
	
	.main-message {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #4CAF50;
		margin-bottom: 20rpx;
	}
	
	.sub-message {
		display: block;
		font-size: 30rpx;
		color: #666;
		margin-bottom: 10rpx;
	}
	
	.order-id {
		display: block;
		font-size: 32rpx;
		color: #1976D2;
		font-weight: bold;
	}
	
	.action-section {
		width: 100%;
	}
	
	.action-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 32rpx;
		margin-bottom: 30rpx;
		border-radius: 8rpx;
	}
	
	.primary-btn {
		background-color: #1976D2;
		color: white;
	}
	
	.secondary-btn {
		background-color: #fff;
		color: #1976D2;
		border: 1px solid #1976D2;
	}
</style>
