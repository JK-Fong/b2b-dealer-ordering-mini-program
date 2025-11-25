<template>
	<view class="dealer-select-container">
		<view v-if="!$store.getters.isSalesRep" class="not-sales-rep">
			<text>您不是业务员账号，无法使用代客下单功能。</text>
			<button @click="goBack">返回</button>
		</view>
		
		<view v-else>
			<view class="search-bar">
				<input class="search-input" placeholder="搜索经销商名称/代码" v-model="searchKeyword" @confirm="filterDealers" />
				<button class="search-btn" @click="filterDealers">搜索</button>
			</view>
			
			<view class="current-target-info">
				<text>当前代客下单目标: </text>
				<text class="target-name">{{ $store.state.targetDealer ? $store.state.targetDealer.name : '无' }}</text>
				<button v-if="$store.state.targetDealer" class="clear-btn" @click="clearTargetDealer">取消代客</button>
			</view>

			<view v-if="loading" class="loading-text">加载中...</view>
			<view v-else class="dealer-list">
				<view v-for="dealer in filteredDealers" :key="dealer.id" class="dealer-item" @click="selectDealer(dealer)">
					<view class="dealer-info">
						<text class="dealer-name">{{ dealer.name }}</text>
						<text class="dealer-id">代码: {{ dealer.id }}</text>
					</view>
					<text class="select-btn">选择</text>
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
				allDealers: [],
				filteredDealers: [],
				searchKeyword: '',
				loading: true,
			};
		},
		onShow() {
			if (this.$store.getters.isSalesRep) {
				this.loadDealers();
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			async loadDealers() {
				this.loading = true;
				const salesRepId = this.$store.state.userInfo.customer_id;
				const res = await api.dealerList(salesRepId);
				this.loading = false;

				if (res.success) {
					this.allDealers = res.data;
					this.filteredDealers = res.data;
				} else {
					uni.showToast({ title: res.msg, icon: 'none' });
				}
			},
			filterDealers() {
				const keyword = this.searchKeyword.toLowerCase();
				this.filteredDealers = this.allDealers.filter(dealer => 
					dealer.name.toLowerCase().includes(keyword) || dealer.id.toLowerCase().includes(keyword)
				);
			},
			selectDealer(dealer) {
				this.$store.commit('SET_TARGET_DEALER', dealer);
				uni.showToast({ title: `已选择 ${dealer.name} 代客下单`, icon: 'success' });
				// 模拟身份模拟 (Impersonation) 成功后跳转到首页开始订货
				uni.reLaunch({ url: '/pages/index/index' });
			},
			clearTargetDealer() {
				this.$store.commit('SET_TARGET_DEALER', null);
				uni.showToast({ title: '已取消代客下单', icon: 'success' });
			}
		}
	}
</script>

<style scoped>
	.dealer-select-container {
		padding: 20rpx;
	}
	
	.not-sales-rep {
		text-align: center;
		padding: 100rpx 0;
		font-size: 32rpx;
		color: #F44336;
	}

	.search-bar {
		display: flex;
		padding: 20rpx 0;
		border-bottom: 1px solid #eee;
		margin-bottom: 20rpx;
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
	
	.current-target-info {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		font-size: 28rpx;
		color: #666;
		border-bottom: 1px solid #eee;
		margin-bottom: 20rpx;
	}
	
	.target-name {
		font-weight: bold;
		color: #1976D2;
		margin: 0 10rpx;
	}
	
	.clear-btn {
		height: 50rpx;
		line-height: 50rpx;
		font-size: 24rpx;
		padding: 0 15rpx;
		margin-left: auto;
		background-color: #FFEBEE;
		color: #F44336;
	}

	.dealer-list {
		background-color: white;
		border-radius: 8rpx;
		overflow: hidden;
	}

	.dealer-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.dealer-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.dealer-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.dealer-id {
		font-size: 24rpx;
		color: #999;
		margin-top: 5rpx;
	}

	.select-btn {
		font-size: 28rpx;
		color: #4CAF50;
		padding: 10rpx 20rpx;
		border: 1px solid #4CAF50;
		border-radius: 8rpx;
	}
</style>
