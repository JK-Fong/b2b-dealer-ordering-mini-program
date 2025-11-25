<template>
	<view class="container">
		<view class="header">
			<text class="customer-info">当前客户: {{ $store.getters.currentCustomerName }}</text>
			<text class="logout-btn" @click="handleLogout">退出</text>
		</view>
		
		<view class="search-bar">
			<input class="search-input" placeholder="搜索商品名称/编码" v-model="searchKeyword" @confirm="loadProducts" />
			<button class="search-btn" @click="loadProducts">搜索</button>
		</view>

		<view class="product-list">
			<view v-if="loading" class="loading-text">加载中...</view>
			<view v-else-if="products.length === 0" class="empty-text">暂无商品数据</view>
			<view v-else v-for="product in products" :key="product.product_id" class="product-item">
				<view class="product-info">
					<text class="product-name">{{ product.name }}</text>
					<text class="product-spec">{{ product.spec }} / {{ product.unit }}</text>
					<text class="product-price">¥ {{ product.price.toFixed(2) }}</text>
					<text class="product-stock" :class="{'out-of-stock': product.stock <= 0}">
						库存: {{ product.stock > 0 ? product.stock : '缺货' }}
					</text>
				</view>
				<view class="product-actions">
					<text class="min-qty">起订量: {{ product.min_order_qty }}</text>
					<view class="quantity-control">
						<button class="qty-btn" @click="changeQuantity(product, -1)" :disabled="product.qty <= 0">-</button>
						<input class="qty-input" type="number" v-model.number="product.qty" @blur="validateQuantity(product)" />
						<button class="qty-btn" @click="changeQuantity(product, 1)">+</button>
					</view>
					<button class="add-to-cart-btn" 
							:disabled="product.stock <= 0 || product.qty <= 0" 
							@click="addToCart(product)">
						加入购物车
					</button>
				</view>
			</view>
		</view>
		
		<!-- 底部购物车悬浮栏 -->
		<view class="cart-bar" @click="goToCart">
			<view class="cart-icon-wrapper">
				<text class="cart-icon">🛒</text>
				<text v-if="$store.getters.cartCount > 0" class="cart-badge">{{ $store.getters.cartCount }}</text>
			</view>
			<view class="cart-summary">
				<text class="cart-total">总计: ¥ {{ $store.getters.cartTotal.toFixed(2) }}</text>
				<text class="cart-count">共 {{ $store.state.cart.length }} 种商品</text>
			</view>
			<button class="checkout-btn" :disabled="$store.getters.cartCount === 0">去结算</button>
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
			// 每次进入页面都检查登录状态
			if (!this.$store.state.isLoggedIn) {
				uni.reLaunch({ url: '/pages/login/login' });
				return;
			}
			this.loadProducts();
		},
		methods: {
			handleLogout() {
				this.$store.commit('LOGOUT');
				uni.reLaunch({ url: '/pages/login/login' });
			},
			async loadProducts() {
				this.loading = true;
				const res = await api.productList();
				this.loading = false;

				if (res.success) {
					let productList = res.data;
					
					// 1. 过滤搜索结果
					if (this.searchKeyword) {
						productList = productList.filter(p => p.name.includes(this.searchKeyword) || p.product_id.includes(this.searchKeyword));
					}
					
					// 2. 获取实时库存
					const productIds = productList.map(p => p.product_id);
					const stockRes = await api.productStock(productIds);
					
					if (stockRes.success) {
						const stockMap = stockRes.data.reduce((map, item) => {
							map[item.product_id] = item.stock;
							return map;
						}, {});
						
						this.products = productList.map(p => {
							// 3. 合并库存信息，并初始化数量
							const cartItem = this.$store.state.cart.find(c => c.product_id === p.product_id);
							return {
								...p,
								stock: stockMap[p.product_id] || 0,
								qty: cartItem ? cartItem.qty : 0, // 从购物车同步数量
							};
						});
					} else {
						uni.showToast({ title: stockRes.msg, icon: 'none' });
						this.products = productList.map(p => ({ ...p, stock: -1, qty: 0 })); // 库存获取失败
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
				// 确保数量是起订量的倍数
				if (product.qty % product.min_order_qty !== 0) {
					product.qty = Math.floor(product.qty / product.min_order_qty) * product.min_order_qty;
					uni.showToast({ title: `数量必须是起订量 ${product.min_order_qty} 的倍数`, icon: 'none' });
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
				if (product.qty <= 0) {
					// 首次点击加入购物车，默认数量为起订量
					product.qty = product.min_order_qty;
				}
				this.updateCart(product);
				uni.showToast({ title: '已加入购物车', icon: 'success' });
			},
			goToCart() {
				if (this.$store.getters.cartCount > 0) {
					uni.navigateTo({ url: '/pages/cart/cart' });
				}
			}
		}
	}
</script>

<style scoped>
	.container {
		padding-bottom: 120rpx; /* 留出底部购物车栏空间 */
	}
	
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-bottom: 1px solid #eee;
	}
	
	.customer-info {
		font-size: 28rpx;
		color: #333;
	}
	
	.logout-btn {
		font-size: 28rpx;
		color: #1976D2;
	}

	.search-bar {
		display: flex;
		padding: 20rpx;
		background-color: #fff;
		border-bottom: 1px solid #eee;
	}

	.search-input {
		flex: 1;
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 20rpx;
		background-color: #f0f0f0;
		border-radius: 35rpx;
		font-size: 28rpx;
		margin-right: 20rpx;
	}
	
	.search-btn {
		width: 120rpx;
		height: 70rpx;
		line-height: 70rpx;
		font-size: 28rpx;
		background-color: #1976D2;
		color: white;
		padding: 0;
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

	.product-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.product-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.product-spec {
		font-size: 24rpx;
		color: #999;
		margin-top: 5rpx;
	}

	.product-price {
		font-size: 36rpx;
		color: #E64A19; /* 红色用于金额 */
		font-weight: bold;
		margin-top: 10rpx;
	}
	
	.product-stock {
		font-size: 24rpx;
		color: #1976D2;
		margin-top: 5rpx;
	}
	
	.out-of-stock {
		color: #F44336;
	}

	.product-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	
	.min-qty {
		font-size: 24rpx;
		color: #999;
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

	.add-to-cart-btn {
		width: 200rpx;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 28rpx;
		background-color: #4CAF50;
		color: white;
		padding: 0;
	}
	
	.add-to-cart-btn[disabled] {
		background-color: #ccc;
	}
	
	/* 底部购物车悬浮栏 */
	.cart-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #333;
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}
	
	.cart-icon-wrapper {
		position: relative;
		margin-right: 20rpx;
	}
	
	.cart-icon {
		font-size: 50rpx;
		color: white;
	}
	
	.cart-badge {
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		background-color: #FF5722;
		color: white;
		border-radius: 50%;
		padding: 4rpx 10rpx;
		font-size: 20rpx;
		line-height: 1;
	}
	
	.cart-summary {
		flex: 1;
		display: flex;
		flex-direction: column;
		color: white;
	}
	
	.cart-total {
		font-size: 36rpx;
		font-weight: bold;
		color: #FFEB3B;
	}
	
	.cart-count {
		font-size: 24rpx;
		color: #ccc;
	}
	
	.checkout-btn {
		width: 200rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 32rpx;
		background-color: #FF5722;
		color: white;
		padding: 0;
	}
	
	.checkout-btn[disabled] {
		background-color: #999;
	}
	
	.loading-text, .empty-text {
		text-align: center;
		padding: 50rpx;
		color: #999;
	}
</style>
