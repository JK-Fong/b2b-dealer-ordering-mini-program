<template>
	<view class="order-list-container">
		<view v-if="loading" class="loading-text">加载中...</view>
		<view v-else-if="orders.length === 0" class="empty-text">暂无订单</view>
		<view v-else class="order-list">
			<view v-for="order in orders" :key="order.order_id" class="order-item">
				<view class="order-header">
					<text class="order-id">订单号: {{ order.order_id }}</text>
					<text class="order-status" :class="{'status-cancel': order.erp_status_text === '已取消'}">{{ order.erp_status_text }}</text>
				</view>
				<view class="order-body">
					<text class="order-date">下单时间: {{ order.order_date }}</text>
					<text class="order-amount">总金额: ¥ {{ order.total_amount.toFixed(2) }}</text>
				</view>
				<view class="order-actions">
					<button v-if="order.can_cancel" class="action-btn cancel-btn" @click="cancelOrder(order)">取消订单</button>
					<button v-if="order.can_return" class="action-btn return-btn" @click="requestReturn(order)">申请退货</button>
					<button class="action-btn detail-btn">查看详情</button>
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
				orders: [],
				loading: true,
			};
		},
		onShow() {
			if (!this.$store.state.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/login' });
				return;
			}
			this.loadOrders();
		},
		methods: {
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
			cancelOrder(order) {
				uni.showModal({
					title: '确认取消',
					content: `确定要取消订单 ${order.order_id} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({ title: '取消中...' });
							const cancelRes = await api.orderCancel(order.order_id);
							uni.hideLoading();
							
							if (cancelRes.success) {
								uni.showToast({ title: cancelRes.msg, icon: 'success' });
								this.loadOrders(); // 刷新列表
								// 实际应用中，还需要刷新账户余额
							} else {
								uni.showModal({ title: '取消失败', content: cancelRes.msg, showCancel: false });
							}
						}
					}
				});
			},
			requestReturn(order) {
				uni.showModal({
					title: '申请退货',
					content: `模拟：您正在对订单 ${order.order_id} 申请退货。实际流程需填写退货数量/原因。`,
					confirmText: '提交申请',
					success: (res) => {
						if (res.confirm) {
							uni.showToast({ title: '退货申请已提交 (Mock)', icon: 'success' });
						}
					}
				});
			}
		}
	}
</script>

<style scoped>
	.order-list-container {
		padding: 20rpx;
	}
	
	.loading-text, .empty-text {
		text-align: center;
		padding: 50rpx;
		color: #999;
	}

	.order-item {
		background-color: white;
		border-radius: 8rpx;
		margin-bottom: 20rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 10rpx;
		border-bottom: 1px solid #eee;
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
		padding: 10rpx 0;
		font-size: 26rpx;
		color: #666;
	}
	
	.order-date {
		display: block;
		margin-bottom: 5rpx;
	}
	
	.order-amount {
		display: block;
		font-size: 32rpx;
		color: #E64A19;
		font-weight: bold;
	}

	.order-actions {
		display: flex;
		justify-content: flex-end;
		padding-top: 10rpx;
		border-top: 1px solid #eee;
		margin-top: 10rpx;
	}

	.action-btn {
		height: 60rpx;
		line-height: 60rpx;
		font-size: 26rpx;
		padding: 0 20rpx;
		margin-left: 20rpx;
		border-radius: 30rpx;
	}
	
	.cancel-btn {
		background-color: #FFEBEE;
		color: #F44336;
		border: 1px solid #F44336;
	}
	
	.return-btn {
		background-color: #FFF3E0;
		color: #FF9800;
		border: 1px solid #FF9800;
	}
	
	.detail-btn {
		background-color: #E3F2FD;
		color: #1976D2;
		border: 1px solid #1976D2;
	}
</style>
