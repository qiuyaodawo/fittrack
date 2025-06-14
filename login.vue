<template>
	<view class="login-container">
		<view class="login-card">
			<view class="logo-area">
				<text class="app-title">FitTrack</text>
				<text class="app-subtitle">您的智能健身伙伴</text>
			</view>
			
			<form @submit="handleLogin">
				<view class="form-group">
					<input type="text" class="input email-input" v-model="email" placeholder="邮箱地址" />
					<view class="custom-input-container">
						<view class="custom-input" @tap="focusPasswordInput">
							<input 
								ref="passwordInput"
								:type="showPassword ? 'text' : 'password'"
								v-model="password" 
								@input="validatePassword"
								@focus="passwordFocused = true"
								@blur="passwordFocused = false"
								class="hidden-input"
							/>
							<view class="input-display">
								<text v-if="!password && !passwordFocused" class="placeholder-text">密码</text>
								<text v-else class="input-text">
									{{ showPassword ? password : '●'.repeat(password.length) }}
								</text>
								<view v-if="passwordFocused" class="cursor-blink"></view>
							</view>
							<view class="password-toggle" @tap.stop="togglePasswordVisibility">
								<view class="eye-icon" :class="{ 'eye-hidden': !showPassword }">
									<view class="eye-shape"></view>
									<view class="eye-slash-line" v-if="!showPassword"></view>
								</view>
							</view>
						</view>
					</view>
					<!-- 密码提示信息 -->
					<view class="password-hint" v-if="password">
						<text class="hint-item" :class="{ 'valid': passwordValidation.length }">
							长度8-16位 {{ passwordValidation.length ? '✓' : '✗' }}
						</text>
						<text class="hint-item" :class="{ 'valid': passwordValidation.hasNumber }">
							包含数字 {{ passwordValidation.hasNumber ? '✓' : '✗' }}
						</text>
						<text class="hint-item" :class="{ 'valid': passwordValidation.hasLetter }">
							包含英文 {{ passwordValidation.hasLetter ? '✓' : '✗' }}
						</text>
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
import localDataService from '@/utils/localDataService.js';

export default {
	data() {
		return {
			email: '',
			password: '',
			rememberMe: false,
			showPassword: false,
			passwordFocused: false,
			passwordValidation: {
				length: false,
				hasNumber: false,
				hasLetter: false
			}
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
		togglePasswordVisibility() {
			this.showPassword = !this.showPassword;
		},
		validatePassword() {
			const password = this.password;
			this.passwordValidation = {
				length: password.length >= 8 && password.length <= 16,
				hasNumber: /\d/.test(password),
				hasLetter: /[a-zA-Z]/.test(password)
			};
		},
		focusPasswordInput() {
			this.$refs.passwordInput.focus();
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
	width: 100%;
	height: 88rpx;
	margin-bottom: 20rpx;
	padding: 0 24rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	background-color: #fff;
	font-size: 28rpx;
	box-sizing: border-box;
}

.email-input {
	/* 邮箱输入框保持默认样式 */
}

/* 自定义输入框容器 */
.custom-input-container {
	position: relative;
	margin-bottom: 20rpx;
}

.custom-input {
	position: relative;
	display: flex;
	align-items: center;
	background: #fff;
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	padding: 0 90rpx 0 24rpx;
	height: 88rpx;
	cursor: text;
	box-sizing: border-box;
}



.hidden-input {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
	z-index: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 28rpx;
}

.input-display {
	flex: 1;
	position: relative;
	display: flex;
	align-items: center;
	height: 100%;
	overflow: hidden;
}

.placeholder-text {
	color: #9ca3af;
	font-size: 28rpx;
	line-height: 1;
}

.input-text {
	color: #111827;
	font-size: 28rpx;
	line-height: 1;
	font-family: system-ui, -apple-system, sans-serif;
	letter-spacing: 0.5rpx;
}

.cursor-blink {
	width: 2rpx;
	height: 32rpx;
	background: var(--primary-color);
	margin-left: 2rpx;
	animation: blink 1s infinite;
}

@keyframes blink {
	0%, 50% { opacity: 1; }
	51%, 100% { opacity: 0; }
}

/* 密码切换按钮 */
.password-toggle {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	z-index: 15;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.password-toggle:active {
	transform: translateY(-50%) scale(0.9);
}

.eye-icon {
	position: relative;
	width: 40rpx;
	height: 26rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.eye-shape {
	width: 40rpx;
	height: 26rpx;
	border: 2rpx solid #9ca3af;
	border-radius: 50%;
	position: relative;
	transition: border-color 0.2s ease;
}

.eye-shape::after {
	content: '';
	width: 10rpx;
	height: 10rpx;
	background-color: #9ca3af;
	border-radius: 50%;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	transition: background-color 0.2s ease;
}

.eye-slash-line {
	position: absolute;
	width: 48rpx;
	height: 2rpx;
	background-color: #9ca3af;
	transform: rotate(-45deg);
	z-index: 1;
	transition: background-color 0.2s ease;
}

.password-toggle:hover .eye-shape {
	border-color: #6b7280;
}

.password-toggle:hover .eye-shape::after {
	background-color: #6b7280;
}

.password-toggle:hover .eye-slash-line {
	background-color: #6b7280;
}

.password-hint {
	margin-top: 16rpx;
	margin-bottom: 10rpx;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.hint-item {
	font-size: 24rpx;
	color: #ef4444;
	line-height: 1.2;
}

.hint-item.valid {
	color: #10b981;
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