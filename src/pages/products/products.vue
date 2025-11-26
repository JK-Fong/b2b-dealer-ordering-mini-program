<template>
	<view class="page-container">
		<!-- 顶部用户信息栏 -->
		<view class="top-bar">
			<view class="customer-info">
				<text class="customer-name">{{ $store.getters.currentCustomerName }}</text>
			</view>
			<view class="logout-btn" @click="handleLogout">
				<text class="logout-icon">⎋</text>
			</view>
		</view>
		
		<!-- 搜索栏 -->
		<view class="search-section">
			<view class="search-wrapper">
				<view class="search-bar">
					<text class="search-icon">🔍</text>
					<input 
						class="search-input" 
						placeholder="搜索商品名称或编号" 
						placeholder-class="search-placeholder"
						v-model="searchKeyword" 
						@confirm="loadProducts"
					/>
					<text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
				</view>
				<view class="search-btn" @click="loadProducts">
					<text class="search-btn-text">搜索</text>
				</view>
			</view>
		</view>
		
		<!-- 商品列表 -->
		<scroll-view class="product-list" scroll-y @scrolltolower="loadMore">
			<view v-if="loading && products.length === 0" class="loading-state">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
			<view v-else-if="products.length === 0" class="empty-state">
				<text class="empty-icon">📦</text>
				<text class="empty-text">暂无商品</text>
			</view>
			<view v-else class="product-container">
				<view 
					v-for="product in products" 
					:key="product.product_id" 
					class="product-card"
				>
					<!-- 商品图片 -->
					<view class="product-image-wrapper">
						<image 
							class="product-image" 
							:src="product.image || '/static/placeholder.png'" 
							mode="aspectFill"
							lazy-load
						></image>
					</view>
					
					<!-- 商品信息区域 -->
					<view class="product-main">
						<view class="product-header">
							<text class="product-name">{{ product.name }}</text>
<!--							<view class="stock-badge" :class="product.stock <= 0 ? 'out-of-stock' : ''">-->
<!--								<text class="stock-text">{{ product.stock > 0 ? `库存${product.stock}` : '缺货' }}</text>-->
<!--							</view>-->
						</view>
						<text class="product-spec">{{ product.spec }}</text>
						<view class="product-footer">
							<view class="price-wrapper">
								<text class="price-symbol">¥</text>
								<text class="price-amount">{{ product.price.toFixed(2) }}</text>
							</view>
							<view class="action-wrapper">
								<view class="quantity-control">
									<view 
										class="control-btn minus" 
										:class="product.qty <= 0 ? 'disabled' : ''"
										@click="changeQuantity(product, -1)"
									>
										<text class="control-icon">−</text>
									</view>
									<input 
										class="quantity-value" 
										type="number" 
										v-model.number="product.qty"
										@blur="validateQuantity(product)"
									/>
									<view 
										class="control-btn plus"
										@click="changeQuantity(product, 1)"
									>
										<text class="control-icon">+</text>
									</view>
								</view>
								<view 
									class="add-cart-btn" 
									:class="product.stock <= 0 ? 'disabled' : ''"
									@click="addToCart(product)"
								>
									<text class="add-cart-text">加入</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部购物车悬浮栏 -->
		<view class="cart-bar" @click="goToCart" v-if="$store.getters.cartCount > 0">
			<view class="cart-left">
				<view class="cart-icon-wrapper">
					<text class="cart-icon">🛒</text>
					<view class="cart-badge" v-if="$store.getters.cartCount > 0">
						<text class="badge-num">{{ $store.getters.cartCount }}</text>
					</view>
				</view>
				<view class="cart-info">
					<text class="cart-total">¥{{ $store.getters.cartTotal.toFixed(2) }}</text>
					<text class="cart-desc">{{ $store.state.cart.length }}件商品</text>
				</view>
			</view>
			<view class="cart-right">
				<view class="checkout-btn">
					<text class="checkout-text">购物车</text>
				</view>
			</view>
		</view>
		
		<!-- 调试信息：显示购物车商品数 -->
		<!-- <view style="position: fixed; top: 200rpx; right: 20rpx; background: red; color: white; padding: 10rpx; z-index: 10000;">
			购物车: {{ $store.getters.cartCount }}
		</view> -->
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
			clearSearch() {
				this.searchKeyword = '';
				this.loadProducts();
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
				// 确保是整数
				product.qty = Math.floor(product.qty);
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
					});
				} else {
					this.$store.commit('REMOVE_FROM_CART', product.product_id);
				}
			},
			addToCart(product) {
				if (product.stock <= 0) return;
				if (product.qty <= 0) {
					product.qty = 1;
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
				// 分页加载
			}
		}
	}
</script>

<style scoped>
	/* 页面容器 */
	.page-container {
		min-height: 100vh;
		background: linear-gradient(to bottom, #F7F8FA 0%, #FFFFFF 100%);
		padding-bottom: 230rpx;
	}
	
	/* 顶部用户栏 */
	.top-bar {
		background: #FFFFFF;
		padding: 16rpx 24rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	}
	
	.customer-info {
		flex: 1;
	}
	
	.customer-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #1A1A1A;
	}
	
	.logout-btn {
		width: 56rpx;
		height: 56rpx;
		background: linear-gradient(135deg, #F5F5F5 0%, #ECECEC 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}
	
	.logout-icon {
		font-size: 24rpx;
		color: #666666;
	}
	
	/* 搜索栏 */
	.search-section {
		background: #FFFFFF;
		padding: 16rpx 24rpx 18rpx;
	}
	
	.search-wrapper {
		display: flex;
		gap: 12rpx;
	}
	
	.search-bar {
		flex: 1;
		display: flex;
		align-items: center;
		background: #F7F8FA;
		border-radius: 40rpx;
		padding: 0 24rpx;
		height: 68rpx;
		border: 2rpx solid transparent;
		transition: all 0.3s;
	}
	
	.search-bar:focus-within {
		background: #FFFFFF;
		border-color: #07C160;
	}
	
	.search-icon {
		font-size: 28rpx;
		margin-right: 12rpx;
		color: #999999;
	}
	
	.search-input {
		flex: 1;
		font-size: 26rpx;
		color: #1A1A1A;
	}
	
	.search-placeholder {
		color: #CCCCCC;
	}
	
	.clear-icon {
		font-size: 24rpx;
		color: #CCCCCC;
		padding: 6rpx;
	}
	
	.search-btn {
		width: 100rpx;
		height: 68rpx;
		background: linear-gradient(135deg, #07C160 0%, #06AD56 100%);
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3);
	}
	
	.search-btn-text {
		font-size: 26rpx;
		color: #FFFFFF;
		font-weight: 600;
	}
	
	/* 商品列表 */
	.product-list {
		height: auto;
		min-height: calc(100vh - 200rpx);
	}
	
	.loading-state,
	.empty-state {
		padding: 150rpx 0;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
	}
	
	.loading-spinner {
		width: 50rpx;
		height: 50rpx;
		border: 3rpx solid #F0F0F0;
		border-top-color: #07C160;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.loading-text,
	.empty-text {
		font-size: 26rpx;
		color: #999999;
	}
	
	.empty-icon {
		font-size: 100rpx;
		opacity: 0.3;
	}
	
	/* 商品容器 - 居中对齐 */
	.product-container {
		max-width: 750rpx;
		margin: 0 auto;
		padding: 16rpx 24rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}
	
	/* 商品卡片 */
	.product-card {
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 18rpx;
		display: flex;
		gap: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		transition: all 0.3s;
	}
	
	.product-card:active {
		transform: scale(0.98);
	}
	
	.product-image-wrapper {
		width: 160rpx;
		height: 160rpx;
		flex-shrink: 0;
		border-radius: 12rpx;
		overflow: hidden;
		background: linear-gradient(135deg, #F7F8FA 0%, #ECECEC 100%);
	}
	
	.product-image {
		width: 100%;
		height: 100%;
	}
	
	.product-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	
	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 10rpx;
		margin-bottom: 6rpx;
	}
	
	.product-name {
		flex: 1;
		font-size: 28rpx;
		font-weight: 600;
		color: #1A1A1A;
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	
	.stock-badge {
		padding: 4rpx 12rpx;
		background: linear-gradient(135deg, #07C160 0%, #06AD56 100%);
		border-radius: 16rpx;
		flex-shrink: 0;
	}
	
	.stock-badge.out-of-stock {
		background: linear-gradient(135deg, #FA5151 0%, #E64340 100%);
	}
	
	.stock-text {
		font-size: 20rpx;
		color: #FFFFFF;
		font-weight: 600;
	}
	
	.product-spec {
		font-size: 22rpx;
		color: #999999;
		margin-bottom: 12rpx;
	}
	
	.product-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}
	
	.price-wrapper {
		display: flex;
		align-items: baseline;
		gap: 2rpx;
	}
	
	.price-symbol {
		font-size: 24rpx;
		color: #FA5151;
		font-weight: 600;
	}
	
	.price-amount {
		font-size: 36rpx;
		color: #FA5151;
		font-weight: bold;
		line-height: 1;
	}
	
	.action-wrapper {
		display: flex;
		gap: 10rpx;
		align-items: center;
	}
	
	.quantity-control {
		display: flex;
		align-items: center;
		background: #F7F8FA;
		border-radius: 40rpx;
		overflow: hidden;
	}
	
	.control-btn {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #FFFFFF;
	}
	
	.control-btn.disabled {
		opacity: 0.3;
	}
	
	.control-icon {
		font-size: 28rpx;
		color: #1A1A1A;
		font-weight: 600;
	}
	
	.quantity-value {
		width: 60rpx;
		height: 48rpx;
		text-align: center;
		font-size: 24rpx;
		color: #1A1A1A;
		font-weight: 600;
		background: #F7F8FA;
	}
	
	.add-cart-btn {
		padding: 12rpx 24rpx;
		background: linear-gradient(135deg, #07C160 0%, #06AD56 100%);
		border-radius: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.3);
	}
	
	.add-cart-btn.disabled {
		background: linear-gradient(135deg, #CCCCCC 0%, #BBBBBB 100%);
		box-shadow: none;
		opacity: 0.6;
	}
	
	.add-cart-text {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: 600;
	}
	
	/* 底部购物车栏 */
	.cart-bar {
		position: fixed;
		bottom: 110rpx;
		left: 24rpx;
		right: 24rpx;
		height: 96rpx;
		background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
		border-radius: 48rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 6rpx 0 20rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.25);
		z-index: 9999;
	}
	
	.cart-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}
	
	.cart-icon-wrapper {
		position: relative;
	}
	
	.cart-icon {
		font-size: 48rpx;
	}
	
	.cart-badge {
		position: absolute;
		top: -6rpx;
		right: -6rpx;
		min-width: 28rpx;
		height: 28rpx;
		background: linear-gradient(135deg, #FA5151 0%, #E64340 100%);
		border-radius: 14rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 6rpx;
		box-shadow: 0 2rpx 6rpx rgba(250, 81, 81, 0.4);
	}
	
	.badge-num {
		font-size: 18rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
	
	.cart-info {
		display: flex;
		flex-direction: column;
		gap: 2rpx;
	}
	
	.cart-total {
		font-size: 34rpx;
		font-weight: bold;
		color: #FFD700;
	}
	
	.cart-desc {
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.6);
	}
	
	.cart-right {
		flex-shrink: 0;
	}
	
	.checkout-btn {
		padding: 20rpx 32rpx;
		background: linear-gradient(135deg, #FA5151 0%, #E64340 100%);
		border-radius: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(250, 81, 81, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.checkout-text {
		font-size: 26rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
</style>
