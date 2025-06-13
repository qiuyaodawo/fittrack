<template>
	<view class="register-container">
		<view class="register-card">
			<view class="logo-area">
				<text class="app-title">FitTrack</text>
				<text class="app-subtitle">创建您的账户</text>
			</view>
					<form @submit="handleRegister">
				<view class="form-group">
					<input type="text" class="input text-input" v-model="name" placeholder="用户名" />
					<input type="text" class="input text-input" v-model="email" placeholder="邮箱地址" />
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
					<view class="custom-input-container">
						<view class="custom-input" @tap="focusConfirmPasswordInput">
							<input 
								ref="confirmPasswordInput"
								:type="showConfirmPassword ? 'text' : 'password'"
								v-model="confirmPassword" 
								@input="validateConfirmPassword"
								@focus="confirmPasswordFocused = true"
								@blur="confirmPasswordFocused = false"
								class="hidden-input"
							/>
							<view class="input-display">
								<text v-if="!confirmPassword && !confirmPasswordFocused" class="placeholder-text">确认密码</text>
								<text v-else class="input-text">
									{{ showConfirmPassword ? confirmPassword : '●'.repeat(confirmPassword.length) }}
								</text>
								<view v-if="confirmPasswordFocused" class="cursor-blink"></view>
							</view>
							<view class="password-toggle" @tap.stop="toggleConfirmPasswordVisibility">
								<view class="eye-icon" :class="{ 'eye-hidden': !showConfirmPassword }">
									<view class="eye-shape"></view>
									<view class="eye-slash-line" v-if="!showConfirmPassword"></view>
								</view>
							</view>
						</view>
					</view>
					<!-- 确认密码提示信息 -->
					<view class="password-hint" v-if="confirmPassword">
						<text class="hint-item" :class="{ 'valid': confirmPasswordValidation.match }">
							密码一致 {{ confirmPasswordValidation.match ? '✓' : '✗' }}
						</text>
					</view>
				</view>
				

				
				<button class="btn btn-primary" :class="{ 'btn-disabled': !isFormValid }" :disabled="!isFormValid" form-type="submit">注册</button>
			</form>
					<view class="login-link">
				<text>已有账户? </text>
				<text class="text-primary" @tap="goToLogin">立即登录</text>
			</view>
			

		</view>
	</view>
</template>

<script>
import localDataService from '@/utils/localDataService.js';

export default {
	data() {
		return {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
			showPassword: false,
			showConfirmPassword: false,
			passwordFocused: false,
			confirmPasswordFocused: false,
			passwordValidation: {
				length: false,
				hasNumber: false,
				hasLetter: false
			},
			confirmPasswordValidation: {
				match: false
			}
		}
	},
	computed: {
		isPasswordValid() {
			return this.passwordValidation.length && this.passwordValidation.hasNumber && this.passwordValidation.hasLetter;
		},
		isFormValid() {
			return this.name && this.email && this.password && this.confirmPassword && 
			       this.isPasswordValid && this.confirmPasswordValidation.match;
		}
	},
	methods: {
		async handleRegister() {
			// 验证表单
			if (!this.name || !this.email || !this.password || !this.confirmPassword) {
				uni.showToast({
					title: '请填写所有字段',
					icon: 'none'
				});
				return;
			}
			
			// 验证密码格式
			if (!this.passwordValidation.length || !this.passwordValidation.hasNumber || !this.passwordValidation.hasLetter) {
				uni.showToast({
					title: '密码需要8-16位，且包含数字和英文',
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
			

			
			uni.showLoading({
				title: '注册中...'
			});
			
			try {
				// 使用本地服务器注册
				const result = await localDataService.register(this.email, this.password, this.name);
				
				uni.hideLoading();
				
				if (result.success) {
					uni.showToast({
						title: '注册成功',
						icon: 'success'
					});
					
					// 注册成功后返回登录页
					setTimeout(() => {
						this.goToLogin();
					}, 1500);
				} else {
					uni.showToast({
						title: result.message,
						icon: 'none'
					});
				}
			} catch (error) {
				uni.hideLoading();
				uni.showToast({
					title: '注册失败，请检查服务器是否启动',
					icon: 'none'
				});
			}
		},
		goToLogin() {
			uni.navigateBack();
		},
		togglePasswordVisibility() {
			this.showPassword = !this.showPassword;
		},
		toggleConfirmPasswordVisibility() {
			this.showConfirmPassword = !this.showConfirmPassword;
		},
		validatePassword() {
			const password = this.password;
			this.passwordValidation = {
				length: password.length >= 8 && password.length <= 16,
				hasNumber: /\d/.test(password),
				hasLetter: /[a-zA-Z]/.test(password)
			};
			// 重新验证确认密码
			this.validateConfirmPassword();
		},
		validateConfirmPassword() {
			this.confirmPasswordValidation = {
				match: this.confirmPassword === this.password && this.password !== ''
			};
		},
		focusPasswordInput() {
			this.$refs.passwordInput.focus();
		},
		focusConfirmPasswordInput() {
			this.$refs.confirmPasswordInput.focus();
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

.text-input {
	/* 普通文本输入框保持默认样式 */
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

.btn-disabled {
	background-color: #d1d5db !important;
	border-color: #d1d5db !important;
	color: #9ca3af !important;
	cursor: not-allowed !important;
}

.btn-disabled:hover {
	background-color: #d1d5db !important;
	border-color: #d1d5db !important;
}

.login-link {
	margin-top: 30rpx;
	text-align: center;
	font-size: 26rpx;
}
</style>