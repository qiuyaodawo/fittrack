<template>
	<view class="login-container">
		<view class="login-card">
			<view class="logo-area">
				<text class="app-title">FitTrack</text>
				<text class="app-subtitle">您的智能健身伙伴</text>
			</view>
			
			<form @submit="handleLogin">
				<view class="form-group">
					<input type="text" class="input" v-model="email" placeholder="邮箱地址" />
					<view class="password-input-container">
						<input 
							type="password"
							class="input password-input" 
							v-model="password" 
							placeholder="密码" 
						/>
					</view>
				</view>
				
				<view class="form-options flex-row justify-between align-center">
					<view class="flex-row align-center">
						<checkbox :checked="rememberMe" @tap="rememberMe = !rememberMe" style="transform:scale(0.7)" />
						<text style="font-size: 26rpx;">记住我</text>
					</view>
					<text class="text-primary" style="font-size: 26rpx;">忘记密码?</text>
				</view>
				
				<button class="btn btn-primary" form-type="submit">登录</button>
			</form>
					<view class="register-link">
				<text>还没有账户? </text>
				<text class="text-primary" @tap="goToRegister">立即注册</text>
			</view>
			
			<!-- 认证模式切换 -->
			<view class="auth-mode-switch">
				<text class="switch-label">认证模式：</text>
				<text class="switch-mode" @tap="toggleAuthMode">
					{{ useCloudAuth ? '云端登录' : '本地登录' }}
				</text>
			</view>
		</view>
	</view>
</template>

<script>
import localDataService from '@/utils/localDataService.js';

export default {
	data() {
		return {
			email: '',
			password: '',
			rememberMe: false,
			useCloudAuth: false // 改为默认使用本地服务器
		}
	},
	methods: {
		async handleLogin() {
			// 验证表单
			if (!this.email || !this.password) {
				uni.showToast({
					title: '请填写所有字段',
					icon: 'none'
				});
				return;
			}
			
			uni.showLoading({
				title: '登录中...'
			});
			
			try {
				// 使用本地服务器登录
				const result = await localDataService.login(this.email, this.password);
				
				uni.hideLoading();
				
				if (result.success) {
					// 登录成功后自动同步数据
					uni.showLoading({
						title: '同步数据中...'
					});
					
					await localDataService.getAllDataFromCloud();
					
					uni.hideLoading();
					
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					});
					
					// 跳转到主页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						});
					}, 1000);
				} else {
					uni.showToast({
						title: result.message,
						icon: 'none'
					});
				}
			} catch (error) {
				uni.hideLoading();
				uni.showToast({
					title: '登录失败，请检查服务器是否启动',
					icon: 'none'
				});
			}
		},
		goToRegister() {
			uni.navigateTo({
				url: '/pages/register/register'
			});
		},
		toggleAuthMode() {
			this.useCloudAuth = !this.useCloudAuth;
			uni.showToast({
				title: this.useCloudAuth ? '已切换到云端登录（已禁用）' : '使用本地服务器登录',
				icon: 'none'
			});
		}
	}
}
</script>

<style lang="scss">
.login-container {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 40rpx;
	background-color: var(--light-bg-color);
}

.login-card {
	width: 85%;
	max-width: 600rpx;
	background-color: var(--card-bg-color);
	border-radius: 20rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.08);
}

.logo-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 40rpx;
}

.app-title {
	font-size: 48rpx;
	font-weight: bold;
	color: var(--primary-color);
	margin-bottom: 8rpx;
}

.app-subtitle {
	font-size: 26rpx;
	color: var(--text-color-light);
}

.form-group {
	margin-bottom: 20rpx;
}

.input {
	height: 80rpx;
	margin-bottom: 20rpx;
}

.password-input-container {
	position: relative;
}

.password-input {
	padding-right: 20rpx;
}

.form-options {
	margin-bottom: 30rpx;
}

.register-link {
	margin-top: 30rpx;
	text-align: center;
	font-size: 26rpx;
}

.auth-mode-switch {
	text-align: center;
	margin-top: 30rpx;
	padding-top: 30rpx;
	border-top: 1px solid var(--border-color);
}

.switch-label {
	font-size: 26rpx;
	color: var(--text-color-light);
}

.switch-mode {
	font-size: 26rpx;
	color: var(--primary-color);
	margin-left: 10rpx;
	text-decoration: underline;
}

.btn {
	height: 80rpx;
	line-height: 80rpx;
}
</style>