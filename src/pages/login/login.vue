<template>
	<view class="login-container">
		<view class="logo-section">
			<text class="title">B2B 经销商订货小程序</text>
			<text class="subtitle">高效订货，实时交互</text>
		</view>

		<view class="form-section">
			<input class="input-field" type="number" v-model="phone" placeholder="请输入手机号 (测试: 13800001111 或 13900002222)" maxlength="11" />
			<view class="input-field-group">
				<input class="input-field code-input" type="number" v-model="code" placeholder="请输入验证码 (Mock: 任意4位)" maxlength="4" />
				<button class="code-button" :disabled="!canSendCode" @click="sendCode">{{ codeButtonText }}</button>
			</view>
			<button class="login-button" :disabled="!canLogin" @click="handleLogin" :loading="loading">
				{{ loading ? '登录中...' : '登录/授权' }}
			</button>
		</view>

		<view class="tip-section">
			<text>提示：本系统采用单点登录机制，账号在其他设备登录将导致本地失效。</text>
		</view>
	</view>
</template>

<script>
	import { api } from '@/utils/api';

	export default {
		data() {
			return {
				phone: '13800001111', // 默认测试手机号
				code: '1234',
				loading: false,
				codeTimer: 0,
				codeButtonText: '获取验证码',
			};
		},
		computed: {
			canSendCode() {
				return this.phone.length === 11 && this.codeTimer === 0;
			},
			canLogin() {
				return this.phone.length === 11 && this.code.length === 4 && !this.loading;
			}
		},
		methods: {
			sendCode() {
				if (!this.canSendCode) return;
				uni.showToast({ title: '验证码已发送 (Mock)', icon: 'none' });
				this.codeTimer = 60;
				this.codeButtonText = `${this.codeTimer}s后重发`;
				const timer = setInterval(() => {
					this.codeTimer--;
					this.codeButtonText = `${this.codeTimer}s后重发`;
					if (this.codeTimer <= 0) {
						clearInterval(timer);
						this.codeButtonText = '获取验证码';
					}
				}, 1000);
			},
			async handleLogin() {
				if (!this.canLogin) return;

				this.loading = true;
				uni.showLoading({ title: '登录中' });

				const res = await api.login(this.phone);

				uni.hideLoading();
				this.loading = false;

				if (res.success) {
					const userInfo = res.data;
					this.$store.commit('LOGIN', userInfo);
					uni.showToast({ title: '登录成功', icon: 'success' });
					
					// 登录成功后跳转到首页
					uni.reLaunch({ url: '/pages/index/index' });
				} else {
					// PRD 2.1 不存在：提示“非授权用户，请联系管理员”，禁止进入。
					uni.showModal({
						title: '登录失败',
						content: res.msg,
						showCancel: false
					});
				}
			}
		},
		onLoad() {
			// 如果已登录，直接跳转到首页
			if (this.$store.state.isLoggedIn) {
				uni.reLaunch({ url: '/pages/index/index' });
			}
		}
	};
</script>

<style scoped>
	.login-container {
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.logo-section {
		margin-top: 100rpx;
		margin-bottom: 80rpx;
		text-align: center;
	}

	.title {
		font-size: 48rpx;
		font-weight: bold;
		color: #1976D2; /* 科技蓝 */
	}

	.subtitle {
		display: block;
		font-size: 28rpx;
		color: #666;
		margin-top: 10rpx;
	}

	.form-section {
		width: 100%;
	}

	.input-field {
		height: 90rpx;
		line-height: 90rpx;
		border: 1px solid #eee;
		border-radius: 8rpx;
		padding: 0 20rpx;
		margin-bottom: 30rpx;
		font-size: 32rpx;
	}

	.input-field-group {
		display: flex;
		justify-content: space-between;
		margin-bottom: 50rpx;
	}

	.code-input {
		flex: 1;
		margin-right: 20rpx;
		margin-bottom: 0;
	}

	.code-button {
		width: 200rpx;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 28rpx;
		background-color: #1976D2;
		color: white;
		border-radius: 8rpx;
		padding: 0;
	}
	
	.code-button[disabled] {
		background-color: #A0A0A0;
		color: #E0E0E0;
	}

	.login-button {
		height: 100rpx;
		line-height: 100rpx;
		font-size: 36rpx;
		background-color: #1976D2;
		color: white;
		border-radius: 8rpx;
	}

	.tip-section {
		margin-top: 60rpx;
		font-size: 24rpx;
		color: #999;
		text-align: center;
	}
</style>
