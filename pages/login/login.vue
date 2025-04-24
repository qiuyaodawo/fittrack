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
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			email: '',
			password: '',
			rememberMe: false
		}
	},
	methods: {
		handleLogin() {
			// 验证表单
			if (!this.email || !this.password) {
				uni.showToast({
					title: '请填写所有字段',
					icon: 'none'
				});
				return;
			}
			
			// 模拟登录API调用
			uni.showLoading({
				title: '登录中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				// 保存登录状态
				uni.setStorageSync('token', 'demo_token');
				uni.setStorageSync('userInfo', {
					id: 1,
					email: this.email,
					name: '用户'
				});
				
				// 跳转到主页
				uni.switchTab({
					url: '/pages/index/index'
				});
			}, 1500);
		},
		goToRegister() {
			uni.navigateTo({
				url: '/pages/register/register'
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

.btn {
	height: 80rpx;
	line-height: 80rpx;
}
</style> 