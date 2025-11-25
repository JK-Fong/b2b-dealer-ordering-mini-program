<template>
	<view class="cart-container">
		<view v-if="cartItems.length === 0" class="empty-cart">
			<text class="empty-text">购物车空空如也</text>
			<button class="go-shopping-btn" @click="goBack">去逛逛</button>
		</view>
		
		<view v-else class="cart-content">
			<view class="cart-list">
				<view v-for="item in cartItems" :key="item.product_id" class="cart-item">
					<view class="item-info">
						<text class="item-name">{{ item.name }}</text>
						<text class="item-spec">{{ item.unit }}</text>
						<text class="item-price">¥ {{ item.price.toFixed(2) }}</text>
					</view>
					<view class="item-actions">
						<text class="item-subtotal">小计: ¥ {{ (item.price * item.qty).toFixed(2) }}</text>
						<view class="quantity-control">
							<button class="qty-btn" @click="changeQuantity(item, -item.min_order_qty)">-</button>
							<input class="qty-input" type="number" v-model.number="item.qty" @blur="validateQuantity(item)" />
							<button class="qty-btn" @click="changeQuantity(item, item.min_order_qty)">+</button>
						</view>
						<text class="delete-btn" @click="removeItem(item.product_id)">删除</text>
					</view>
				</view>
			</view>
			
			<view class="cart-summary-fixed">
				<view class="summary-info">
					<text class="total-label">总计:</text>
					<text class="total-amount">¥ {{ $store.getters.cartTotal.toFixed(2) }}</text>
				</view>
				<button class="checkout-btn" @click="goToCheckout">去结算 ({{ $store.getters.cartCount }})</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 直接从store获取购物车数据
				cartItems: this.$store.state.cart,
			};
		},
		onShow() {
			// 实时校验：进入购物车时，静默校验商品状态（是否下架、价格变动）
			// 简化处理：仅检查购物车是否为空
			if (this.cartItems.length === 0) {
				uni.showToast({ title: '购物车已清空', icon: 'none' });
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			changeQuantity(item, delta) {
				let newQty = item.qty + delta;
				if (newQty < item.min_order_qty) {
					newQty = 0; // 数量小于起订量时，直接清空
				}
				
				if (newQty === 0) {
					this.removeItem(item.product_id);
					return;
				}
				
				// 确保数量是起订量的倍数
				if (newQty % item.min_order_qty !== 0) {
					newQty = Math.floor(newQty / item.min_order_qty) * item.min_order_qty;
					uni.showToast({ title: `数量必须是起订量 ${item.min_order_qty} 的倍数`, icon: 'none' });
				}
				
				item.qty = newQty;
				this.$store.commit('UPDATE_CART_QTY', { product_id: item.product_id, qty: item.qty });
			},
			validateQuantity(item) {
				if (item.qty < item.min_order_qty || isNaN(item.qty)) {
					item.qty = item.min_order_qty;
					uni.showToast({ title: `数量不能小于起订量 ${item.min_order_qty}`, icon: 'none' });
				}
				
				// 确保数量是起订量的倍数
				if (item.qty % item.min_order_qty !== 0) {
					item.qty = Math.floor(item.qty / item.min_order_qty) * item.min_order_qty;
					uni.showToast({ title: `数量必须是起订量 ${item.min_order_qty} 的倍数`, icon: 'none' });
				}
				
				this.$store.commit('UPDATE_CART_QTY', { product_id: item.product_id, qty: item.qty });
			},
			removeItem(product_id) {
				uni.showModal({
					title: '确认删除',
					content: '确定从购物车中删除该商品吗？',
					success: (res) => {
						if (res.confirm) {
							this.$store.commit('REMOVE_FROM_CART', product_id);
							this.cartItems = this.$store.state.cart; // 强制更新视图
							uni.showToast({ title: '删除成功', icon: 'success' });
						}
					}
				});
			},
			goToCheckout() {
				if (this.$store.getters.cartCount > 0) {
					uni.navigateTo({ url: '/pages/checkout/checkout' });
				}
			}
		}
	}
</script>

<style scoped>
	.cart-container {
		padding-bottom: 120rpx; /* 留出底部结算栏空间 */
	}
	
	.empty-cart {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 80vh;
	}
	
	.empty-text {
		font-size: 32rpx;
		color: #999;
		margin-bottom: 40rpx;
	}
	
	.go-shopping-btn {
		width: 300rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 32rpx;
		background-color: #1976D2;
		color: white;
	}

	.cart-list {
		padding: 20rpx;
	}

	.cart-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.item-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.item-spec {
		font-size: 24rpx;
		color: #999;
		margin-top: 5rpx;
	}

	.item-price {
		font-size: 30rpx;
		color: #E64A19;
		margin-top: 10rpx;
	}

	.item-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	
	.item-subtotal {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 10rpx;
	}

	.quantity-control {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.qty-btn {
		width: 50rpx;
		height: 50rpx;
		line-height: 50rpx;
		font-size: 36rpx;
		text-align: center;
		border: 1px solid #ccc;
		background-color: #fff;
		padding: 0;
		margin: 0;
	}

	.qty-input {
		width: 80rpx;
		height: 50rpx;
		line-height: 50rpx;
		text-align: center;
		border-top: 1px solid #ccc;
		border-bottom: 1px solid #ccc;
		font-size: 28rpx;
		margin: 0 5rpx;
	}
	
	.delete-btn {
		font-size: 24rpx;
		color: #F44336;
		margin-top: 10rpx;
	}
	
	/* 底部结算栏 */
	.cart-summary-fixed {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: white;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}
	
	.summary-info {
		flex: 1;
		display: flex;
		align-items: baseline;
	}
	
	.total-label {
		font-size: 32rpx;
		color: #333;
		margin-right: 10rpx;
	}
	
	.total-amount {
		font-size: 40rpx;
		font-weight: bold;
		color: #E64A19;
	}
	
	.checkout-btn {
		width: 250rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 32rpx;
		background-color: #FF5722;
		color: white;
		padding: 0;
	}
</style>
