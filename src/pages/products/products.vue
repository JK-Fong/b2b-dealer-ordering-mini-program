<template>
	<view class="page-container">
		<!-- 顶部用户信息栏 -->
		<view class="top-bar">
			<text class="current-customer">{{ $store.getters.currentCustomerName }}</text>
			<view class="logout-btn" @click="handleLogout">
				<text class="logout-text">退出登录</text>
			</view>
		</view>
		
		<!-- 搜索栏 -->
		<view class="search-section">
			<view class="search-bar">
				<text class="search-icon">🔍</text>
				<input 
					class="search-input" 
					placeholder="搜索商品" 
					v-model="searchKeyword" 
					@confirm="loadProducts"
				/>
			</view>
			<view class="search-btn" @click="loadProducts">
				<text class="search-btn-text">搜索</text>
			</view>
		</view>
		
		<!-- 商品列表 -->
		<scroll-view class="product-list" scroll-y @scrolltolower="loadMore">
			<view v-if="loading && products.length === 0" class="loading-state">
				<text class="loading-text">加载中...</text>
			</view>
			<view v-else-if="products.length === 0" class="empty-state">
				<text class="empty-text">暂无商品</text>
			</view>
			<view v-else class="product-items">
				<view 
					v-for="product in products" 
					:key="product.product_id" 
					class="product-card"
				>
					<!-- 商品图片 -->
					<image 
						class="product-image" 
						:src="product.image || '/static/placeholder.png'" 
						mode="aspectFill"
					></image>
					
					<!-- 商品信息 -->
					<view class="product-info">
						<text class="product-name">{{ product.name }}</text>
						<text class="product-spec">{{ product.spec }}</text>
						<text class="product-price">¥{{ product.price.toFixed(2) }}</text>
						<view class="stock-badge" :class="product.stock <= 0 ? 'out-of-stock' : ''">
							<text class="stock-text">库存: {{ product.stock > 0 ? product.stock : '缺货' }}</text>
						</view>
					</view>
					
					<!-- 操作区域 -->
					<view class="product-actions">
						<text class="min-order-label">起订: {{ product.min_order_qty }}</text>
						<view class="quantity-stepper">
							<view 
								class="stepper-btn minus" 
								:class="product.qty <= 0 ? 'disabled' : ''"
								@click="changeQuantity(product, -product.min_order_qty)"
							>
								<text class="stepper-icon">−</text>
							</view>
							<input 
								class="quantity-input" 
								type="number" 
								v-model.number="product.qty"
								@blur="validateQuantity(product)"
							/>
							<view 
								class="stepper-btn plus"
								@click="changeQuantity(product, product.min_order_qty)"
							>
								<text class="stepper-icon">+</text>
							</view>
						</view>
						<view 
							class="add-cart-btn" 
							:class="product.stock <= 0 ? 'disabled' : ''"
							@click="addToCart(product)"
						>
							<text class="cart-icon">🛒</text>
							<text class="cart-text">加入购物车</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部购物车悬浮栏 -->
		<view class="cart-float-bar" @click="goToCart">
			<view class="cart-icon-wrapper">
				<text class="cart-icon-large">🛒</text>
				<view v-if="$store.getters.cartCount > 0" class="cart-badge">
					<text class="badge-text">{{ $store.getters.cartCount }}</text>
				</view>
			</view>
			<view class="cart-summary">
				<text class="cart-total">¥{{ $store.getters.cartTotal.toFixed(2) }}</text>
				<text class="cart-count">{{ $store.state.cart.length }} 件商品</text>
			</view>
			<view class="checkout-btn" :class="$store.getters.cartCount === 0 ? 'disabled' : ''">
				<text class="checkout-icon">💳</text>
				<text class="checkout-text">去结算</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { api } from '@/utils/api';

	export default {
		data() {
			return {
				products: [],
				loading: false,
				searchKeyword: '',
			};
		},
		onShow() {
			if (!this.$store.state.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/login' });
				return;
			}
			this.loadProducts();
		},
		onPullDownRefresh() {
			this.loadProducts().then(() => {
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
			async loadProducts() {
				this.loading = true;
				const res = await api.productList();
				this.loading = false;

				if (res.success) {
					let productList = res.data;
					
					if (this.searchKeyword) {
						productList = productList.filter(p => 
							p.name.includes(this.searchKeyword) || 
							p.product_id.includes(this.searchKeyword)
						);
					}
					
					const productIds = productList.map(p => p.product_id);
					const stockRes = await api.productStock(productIds);
					
					if (stockRes.success) {
						const stockMap = stockRes.data.reduce((map, item) => {
							map[item.product_id] = item.stock;
							return map;
						}, {});
						
						this.products = productList.map(p => {
							const cartItem = this.$store.state.cart.find(c => c.product_id === p.product_id);
							return {
								...p,
								stock: stockMap[p.product_id] || 0,
								qty: cartItem ? cartItem.qty : 0,
								image: p.image || '/static/placeholder.png',
							};
						});
					} else {
						uni.showToast({ title: stockRes.msg, icon: 'none' });
					}
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			},
			changeQuantity(product, delta) {
				let newQty = product.qty + delta;
				if (newQty < 0) newQty = 0;
				if (newQty > product.stock && product.stock > 0) {
					newQty = product.stock;
					uni.showToast({ title: '已达最大库存', icon: 'none' });
				}
				product.qty = newQty;
				this.updateCart(product);
			},
			validateQuantity(product) {
				if (product.qty < 0 || isNaN(product.qty)) {
					product.qty = 0;
				}
				if (product.qty > product.stock && product.stock > 0) {
					product.qty = product.stock;
					uni.showToast({ title: '已达最大库存', icon: 'none' });
				}
				if (product.qty % product.min_order_qty !== 0) {
					product.qty = Math.floor(product.qty / product.min_order_qty) * product.min_order_qty;
					uni.showToast({ title: `数量必须是${product.min_order_qty}的倍数`, icon: 'none' });
				}
				this.updateCart(product);
			},
			updateCart(product) {
				if (product.qty > 0) {
					this.$store.commit('ADD_TO_CART', {
						product_id: product.product_id,
						name: product.name,
						price: product.price,
						qty: product.qty,
						unit: product.unit,
						min_order_qty: product.min_order_qty,
					});
				} else {
					this.$store.commit('REMOVE_FROM_CART', product.product_id);
				}
			},
			addToCart(product) {
				if (product.stock <= 0) return;
				if (product.qty <= 0) {
					product.qty = product.min_order_qty;
				}
				this.updateCart(product);
				uni.showToast({ title: '已加入购物车', icon: 'success' });
			},
			goToCart() {
				if (this.$store.getters.cartCount > 0) {
					uni.navigateTo({ url: '/pages/cart/cart' });
				}
			},
			loadMore() {
				// 分页加载逻辑
			}
		}
	}
</script>

<style scoped>
	/* 页面容器 */
	.page-container {
		min-height: 100vh;
		background-color: #F5F5F5;
		padding-bottom: 140rpx;
	}
	
	/* 顶部用户信息栏 */
	.top-bar {
		background-color: #FFFFFF;
		padding: 24rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1rpx solid #E0E0E0;
	}
	
	.current-customer {
		font-size: 34rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.logout-btn {
		padding: 16rpx 32rpx;
		background-color: #FFFFFF;
		border: 2rpx solid #E0E0E0;
		border-radius: 28rpx;
	}
	
	.logout-text {
		font-size: 26rpx;
		color: #666666;
	}
	
	/* 搜索栏 */
	.search-section {
		background-color: #FFFFFF;
		padding: 24rpx 30rpx;
		display: flex;
		gap: 20rpx;
		border-bottom: 1rpx solid #E0E0E0;
	}
	
	.search-bar {
		flex: 1;
		display: flex;
		align-items: center;
		background-color: #F5F5F5;
		border-radius: 32rpx;
		padding: 0 28rpx;
		height: 76rpx;
	}
	
	.search-icon {
		font-size: 34rpx;
		margin-right: 16rpx;
	}
	
	.search-input {
		flex: 1;
		font-size: 28rpx;
		color: #333333;
	}
	
	.search-btn {
		width: 140rpx;
		height: 76rpx;
		background-color: #1976D2;
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.search-btn-text {
		font-size: 28rpx;
		color: #FFFFFF;
		font-weight: 500;
	}
	
	/* 商品列表 */
	.product-list {
		height: calc(100vh - 280rpx);
		padding: 24rpx 30rpx;
	}
	
	.loading-state,
	.empty-state {
		padding: 120rpx 0;
		text-align: center;
	}
	
	.loading-text,
	.empty-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	.product-items {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}
	
	/* 商品卡片 */
	.product-card {
		background-color: #FFFFFF;
		border-radius: 20rpx;
		padding: 28rpx;
		display: flex;
		gap: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}
	
	.product-image {
		width: 180rpx;
		height: 180rpx;
		border-radius: 16rpx;
		background-color: #F5F5F5;
		flex-shrink: 0;
	}
	
	.product-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		justify-content: center;
	}
	
	.product-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.product-spec {
		font-size: 26rpx;
		color: #999999;
	}
	
	.product-price {
		font-size: 40rpx;
		font-weight: bold;
		color: #FF5722;
		margin-top: 8rpx;
	}
	
	.stock-badge {
		display: inline-flex;
		align-items: center;
		padding: 8rpx 20rpx;
		background-color: #1976D2;
		border-radius: 24rpx;
		align-self: flex-start;
	}
	
	.stock-badge.out-of-stock {
		background-color: #F44336;
	}
	
	.stock-text {
		font-size: 22rpx;
		color: #FFFFFF;
		font-weight: 500;
	}
	
	/* 操作区域 */
	.product-actions {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		align-items: flex-end;
		justify-content: center;
	}
	
	.min-order-label {
		font-size: 22rpx;
		color: #999999;
		background-color: #F5F5F5;
		padding: 6rpx 16rpx;
		border-radius: 16rpx;
	}
	
	.quantity-stepper {
		display: flex;
		align-items: center;
		border: 2rpx solid #E0E0E0;
		border-radius: 10rpx;
		overflow: hidden;
		background-color: #FFFFFF;
	}
	
	.stepper-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #F5F5F5;
	}
	
	.stepper-btn.disabled {
		opacity: 0.4;
	}
	
	.stepper-icon {
		font-size: 36rpx;
		color: #666666;
		font-weight: bold;
	}
	
	.quantity-input {
		width: 88rpx;
		height: 56rpx;
		text-align: center;
		font-size: 28rpx;
		color: #333333;
		background-color: #FFFFFF;
	}
	
	.add-cart-btn {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 16rpx 28rpx;
		background-color: #4CAF50;
		border-radius: 28rpx;
	}
	
	.add-cart-btn.disabled {
		background-color: #CCCCCC;
		opacity: 0.6;
	}
	
	.cart-icon,
	.cart-text {
		color: #FFFFFF;
	}
	
	.cart-icon {
		font-size: 28rpx;
	}
	
	.cart-text {
		font-size: 26rpx;
		font-weight: 500;
	}
	
	/* 底部购物车悬浮栏 */
	.cart-float-bar {
		position: fixed;
		bottom: 100rpx;
		left: 0;
		right: 0;
		height: 120rpx;
		background-color: #2C2C2C;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.15);
		z-index: 100;
	}
	
	.cart-icon-wrapper {
		position: relative;
		margin-right: 28rpx;
	}
	
	.cart-icon-large {
		font-size: 60rpx;
	}
	
	.cart-badge {
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		min-width: 36rpx;
		height: 36rpx;
		background-color: #FF5722;
		border-radius: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 10rpx;
	}
	
	.badge-text {
		font-size: 22rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
	
	.cart-summary {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}
	
	.cart-total {
		font-size: 44rpx;
		font-weight: bold;
		color: #FFD700;
	}
	
	.cart-count {
		font-size: 24rpx;
		color: #CCCCCC;
	}
	
	.checkout-btn {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 24rpx 44rpx;
		background-color: #FF5722;
		border-radius: 32rpx;
	}
	
	.checkout-btn.disabled {
		background-color: #999999;
		opacity: 0.6;
	}
	
	.checkout-icon {
		font-size: 32rpx;
	}
	
	.checkout-text {
		font-size: 30rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
</style>
