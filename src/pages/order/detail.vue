<template>
	<view class="detail-container">
		<view v-if="loading" class="loading-text">加载中...</view>
		<view v-else-if="!order" class="empty-text">订单不存在</view>
		<view v-else>
			<view class="status-section">
				<text class="status-icon">{{ statusIcon }}</text>
				<text class="status-text">{{ order.erp_status_text }}</text>
			</view>
			
			<view class="info-section">
				<view class="section-title">订单信息</view>
				<view class="info-item">
					<text class="label">订单号:</text>
					<text class="value">{{ order.order_id }}</text>
				</view>
				<view class="info-item">
					<text class="label">下单时间:</text>
					<text class="value">{{ order.order_date }}</text>
				</view>
				<view class="info-item">
					<text class="label">订单状态:</text>
					<text class="value status-value">{{ order.erp_status_text }}</text>
				</view>
				<view class="info-item">
					<text class="label">订单金额:</text>
					<text class="value amount-value">¥ {{ order.total_amount.toFixed(2) }}</text>
				</view>
			</view>
			
			<view class="info-section">
				<view class="section-title">商品清单</view>
				<view class="product-list">
					<view v-for="(item, index) in orderItems" :key="index" class="product-item">
						<view class="item-info">
							<text class="item-name">{{ item.name }}</text>
							<text class="item-spec">{{ item.spec }}</text>
						</view>
						<view class="item-quantity">x {{ item.qty }}</view>
						<view class="item-price">¥ {{ (item.price * item.qty).toFixed(2) }}</view>
					</view>
				</view>
			</view>
			
			<view class="action-section">
				<button class="action-btn secondary-btn" @click="goToCart">去购物车</button>
				<button v-if="order.can_cancel" class="action-btn cancel-btn" @click="cancelOrder">取消订单</button>
				<button v-if="order.can_return" class="action-btn return-btn" @click="requestReturn">申请退货</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { api } from '@/utils/api';

	export default {
		data() {
			return {
				orderId: '',
				order: null,
				orderItems: [],
				loading: true,
			};
		},
		computed: {
			statusIcon() {
				if (!this.order) return '📦';
				const statusMap = {
					'待发货': '⏳',
					'已发货': '🚚',
					'已收货': '✅',
					'已取消': '❌',
				};
				return statusMap[this.order.erp_status_text] || '📦';
			}
		},
		onLoad(options) {
			this.orderId = options.orderId;
			this.loadOrderDetail();
		},
		methods: {
			async loadOrderDetail() {
				this.loading = true;
				
				// 模拟获取订单详情（实际应该有专门的订单详情接口）
				const res = await api.orderList(this.$store.state.userInfo.customer_id);
				
				this.loading = false;
				
				if (res.success) {
					this.order = res.data.find(o => o.order_id === this.orderId);
					
					if (this.order) {
						// 模拟订单商品明细（实际应该从订单详情接口获取）
						this.orderItems = [
							{ name: '高端定制白酒 500ml', spec: '500ml/瓶', qty: 10, price: 500.00 },
							{ name: '精酿啤酒 330ml*24', spec: '330ml*24/箱', qty: 5, price: 88.00 },
						];
					}
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			},
			goToCart() {
				uni.navigateTo({ url: '/pages/cart/cart' });
			},
			cancelOrder() {
				uni.showModal({
					title: '确认取消',
					content: `确定要取消订单 ${this.order.order_id} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({ title: '取消中...' });
							const cancelRes = await api.orderCancel(this.order.order_id);
							uni.hideLoading();
							
							if (cancelRes.success) {
								uni.showToast({ title: cancelRes.msg, icon: 'success' });
								// 刷新订单详情
								this.loadOrderDetail();
							} else {
								uni.showModal({ title: '取消失败', content: cancelRes.msg, showCancel: false });
							}
						}
					}
				});
			},
			requestReturn() {
				uni.showModal({
					title: '申请退货',
					content: `模拟：您正在对订单 ${this.order.order_id} 申请退货。实际流程需填写退货数量/原因。`,
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
	.detail-container {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 120rpx;
	}
	
	.loading-text, .empty-text {
		text-align: center;
		padding: 100rpx;
		color: #999;
	}
	
	.status-section {
		background-color: white;
		padding: 40rpx;
		text-align: center;
		margin-bottom: 20rpx;
	}
	
	.status-icon {
		font-size: 100rpx;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.status-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #1976D2;
	}
	
	.info-section {
		background-color: white;
		margin-bottom: 20rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		padding: 20rpx;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.info-item {
		display: flex;
		justify-content: space-between;
		padding: 20rpx;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.info-item:last-child {
		border-bottom: none;
	}
	
	.label {
		font-size: 28rpx;
		color: #666;
	}
	
	.value {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}
	
	.status-value {
		color: #1976D2;
	}
	
	.amount-value {
		color: #E64A19;
		font-size: 32rpx;
	}
	
	.product-list {
		padding: 0 20rpx;
	}
	
	.product-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.product-item:last-child {
		border-bottom: none;
	}
	
	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	
	.item-name {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 5rpx;
	}
	
	.item-spec {
		font-size: 24rpx;
		color: #999;
	}
	
	.item-quantity {
		width: 100rpx;
		text-align: right;
		font-size: 28rpx;
		color: #666;
	}
	
	.item-price {
		width: 150rpx;
		text-align: right;
		font-size: 30rpx;
		font-weight: bold;
		color: #E64A19;
	}
	
	.action-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: white;
		padding: 20rpx;
		display: flex;
		gap: 20rpx;
		box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
	}
	
	.action-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		border-radius: 8rpx;
	}
	
	.secondary-btn {
		background-color: #E3F2FD;
		color: #1976D2;
		border: 1px solid #1976D2;
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
</style>
