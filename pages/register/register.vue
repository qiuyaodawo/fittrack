<template>
	<view class="register-container">
		<view class="register-card">
			<view class="logo-area">
				<text class="app-title">FitTrack</text>
				<text class="app-subtitle">创建您的账户</text>
			</view>
			
			<form @submit="handleRegister">
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
					<view class="password-input-container">
						<input 
							type="password"
							class="input password-input" 
							v-model="confirmPassword" 
							placeholder="确认密码" 
						/>
					</view>
				</view>
				
				<view class="form-options flex-row align-center">
					<checkbox :checked="agreeTerms" @tap="agreeTerms = !agreeTerms" style="transform:scale(0.7)" />
					<text style="font-size: 26rpx;">我同意<text class="text-primary">服务条款</text></text>
				</view>
				
				<button class="btn btn-primary" form-type="submit">注册</button>
			</form>
			
			<view class="login-link">
				<text>已有账户? </text>
				<text class="text-primary" @tap="goToLogin">立即登录</text>
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
			confirmPassword: '',
			agreeTerms: false
		}
	},
	methods: {
		handleRegister() {
			// 验证表单
			if (!this.email || !this.password || !this.confirmPassword) {
				uni.showToast({
					title: '请填写所有字段',
					icon: 'none'
				});
				return;
			}
			
			if (this.password !== this.confirmPassword) {
				uni.showToast({
					title: '两次密码输入不一致',
					icon: 'none'
				});
				return;
			}
			
			if (!this.agreeTerms) {
				uni.showToast({
					title: '请同意服务条款',
					icon: 'none'
				});
				return;
			}
			
			// 模拟注册API调用
			uni.showLoading({
				title: '注册中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({
					title: '注册成功',
					icon: 'success'
				});
				
				// 注册成功后返回登录页
				setTimeout(() => {
					this.goToLogin();
				}, 1500);
			}, 1500);
		},
		goToLogin() {
			uni.navigateBack();
		}
	}
}
</script>

<style lang="scss">
.register-container {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 40rpx;
	background-color: var(--light-bg-color);
}

.register-card {
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

.login-link {
	margin-top: 30rpx;
	text-align: center;
	font-size: 26rpx;
}

.btn {
	height: 80rpx;
	line-height: 80rpx;
}
</style> 