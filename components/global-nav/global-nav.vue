<template>
	<view class="global-nav">
		<!-- 桌面端导航布局 -->
		<view class="desktop-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item" :class="{'active': currentPage === 'index'}" @tap="navigateTo('index')">首页</view>
				<view class="nav-item" :class="{'active': currentPage === 'history'}" @tap="navigateTo('history')">记录</view>
				<view class="nav-item" :class="{'active': currentPage === 'progress'}" @tap="navigateTo('progress')">进度追踪</view>
				<view class="nav-item" :class="{'active': currentPage === 'plans'}" @tap="navigateTo('plans')">健身计划</view>
				<view class="nav-item" :class="{'active': currentPage === 'workouts'}" @tap="navigateTo('workouts')">训练数据库</view>
			</view>
			<view class="nav-actions">
				<view class="user-info" v-if="userInfo && userInfo.name">
					<text class="user-name">{{userInfo.name}}</text>
					<view class="user-menu" @tap="showUserMenu">
						<view class="user-avatar">
							<image src="/static/images/avatar.png" mode="aspectFill"></image>
						</view>
					</view>
				</view>
				<view class="login-btn" v-else @tap="goToLogin">
					<text>登录</text>
				</view>
			</view>
		</view>

		<!-- 移动端导航布局 -->
		<view class="mobile-nav">
			<view class="mobile-nav-header">
				<view class="logo">FitTrack</view>
				<view class="mobile-nav-right">
					<!-- 用户信息（移动端简化版） -->
					<view class="mobile-user-info" v-if="userInfo && userInfo.name">
						<view class="mobile-user-avatar" @tap="showUserMenu">
							<image src="/static/images/avatar.png" mode="aspectFill"></image>
						</view>
					</view>
					<view class="mobile-login-btn" v-else @tap="goToLogin">
						<text>登录</text>
					</view>

					<!-- 汉堡菜单按钮 -->
					<view class="hamburger-menu" @tap="toggleMobileMenu" :class="{'active': showMobileMenu}">
						<view class="hamburger-line"></view>
						<view class="hamburger-line"></view>
						<view class="hamburger-line"></view>
					</view>
				</view>
			</view>

			<!-- 移动端折叠导航菜单 -->
			<view class="mobile-nav-menu" :class="{'show': showMobileMenu}" @tap.self="hideMobileMenu">
				<view class="mobile-nav-content">
					<view class="mobile-nav-item"
						:class="{'active': currentPage === 'index'}"
						@tap="navigateToMobile('index')"
					>
						<view class="nav-icon">🏠</view>
						<text class="nav-text">首页</text>
						<view class="nav-arrow" v-if="currentPage === 'index'">→</view>
					</view>
					<view class="mobile-nav-item"
						:class="{'active': currentPage === 'history'}"
						@tap="navigateToMobile('history')"
					>
						<view class="nav-icon">📝</view>
						<text class="nav-text">记录</text>
						<view class="nav-arrow" v-if="currentPage === 'history'">→</view>
					</view>
					<view class="mobile-nav-item"
						:class="{'active': currentPage === 'progress'}"
						@tap="navigateToMobile('progress')"
					>
						<view class="nav-icon">📊</view>
						<text class="nav-text">进度追踪</text>
						<view class="nav-arrow" v-if="currentPage === 'progress'">→</view>
					</view>
					<view class="mobile-nav-item"
						:class="{'active': currentPage === 'plans'}"
						@tap="navigateToMobile('plans')"
					>
						<view class="nav-icon">📋</view>
						<text class="nav-text">健身计划</text>
						<view class="nav-arrow" v-if="currentPage === 'plans'">→</view>
					</view>
					<view class="mobile-nav-item"
						:class="{'active': currentPage === 'workouts'}"
						@tap="navigateToMobile('workouts')"
					>
						<view class="nav-icon">💪</view>
						<text class="nav-text">训练数据库</text>
						<view class="nav-arrow" v-if="currentPage === 'workouts'">→</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 用户菜单弹窗 -->
		<view class="user-menu-modal" v-if="showMenu" @tap.self="hideUserMenu">
			<view class="menu-content">
				<view class="menu-item" @tap="handleLogout">
					<text class="menu-text">退出登录</text>
				</view>
			</view>
		</view>

		<!-- 移动端遮罩层 -->
		<view class="mobile-overlay" v-if="showMobileMenu" @tap="hideMobileMenu"></view>
	</view>
</template>

<script>
export default {
	name: 'global-nav',
	props: {
		currentPage: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			userInfo: null,
			showMenu: false,
			showMobileMenu: false,
			isMobile: false
		}
	},
	onShow() {
		this.loadUserInfo();
		this.checkScreenSize();
	},
	mounted() {
		this.loadUserInfo();
		this.checkScreenSize();
		this.setupResizeListener();
	},
	beforeDestroy() {
		this.cleanupResizeListener();
	},
	methods: {
		loadUserInfo() {
			try {
				const userInfoStorage = uni.getStorageSync('userInfo');
				if (userInfoStorage) {
					this.userInfo = userInfoStorage;
				} else {
					this.userInfo = null;
				}
			} catch (error) {
				console.error('加载用户信息失败:', error);
				this.userInfo = null;
			}
		},
		navigateTo(page) {
			if (page === this.currentPage) {
				return; // 如果是当前页面，不执行跳转
			}
			
			uni.reLaunch({
				url: `/pages/${page}/${page}`,
				fail: (error) => {
					console.error('页面跳转失败:', error);
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					});
				}
			});
		},
		showUserMenu() {
			this.showMenu = true;
		},
		hideUserMenu() {
			this.showMenu = false;
		},
		handleLogout() {
			this.hideUserMenu();
			uni.showModal({
				title: '退出确认',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 清除登录信息和用户数据
						try {
							uni.removeStorageSync('userInfo');
							uni.removeStorageSync('isLoggedIn');
							
							// 提示退出成功
							uni.showToast({
								title: '已退出登录',
								icon: 'success'
							});
							
							// 跳转到登录页面
							setTimeout(() => {
								uni.reLaunch({
									url: '/pages/login/login'
								});
							}, 1500);
						} catch (error) {
							console.error('退出登录失败:', error);
							uni.showToast({
								title: '退出失败',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		goToLogin() {
			uni.reLaunch({
				url: '/pages/login/login'
			});
		},

		// 移动端导航相关方法
		toggleMobileMenu() {
			this.showMobileMenu = !this.showMobileMenu;

			// 添加触觉反馈
			if (typeof uni !== 'undefined' && uni.vibrateShort) {
				uni.vibrateShort({
					type: 'light'
				});
			}
		},

		hideMobileMenu() {
			this.showMobileMenu = false;
		},

		navigateToMobile(page) {
			// 先隐藏菜单
			this.hideMobileMenu();

			// 延迟跳转，让动画完成
			setTimeout(() => {
				this.navigateTo(page);
			}, 200);
		},

		// 检查屏幕尺寸
		checkScreenSize() {
			try {
				const systemInfo = uni.getSystemInfoSync();
				this.isMobile = systemInfo.screenWidth <= 768;
			} catch (error) {
				console.error('获取系统信息失败:', error);
				this.isMobile = false;
			}
		},

		// 设置窗口尺寸监听器
		setupResizeListener() {
			if (typeof uni !== 'undefined' && uni.onWindowResize) {
				this.resizeHandler = () => {
					this.checkScreenSize();
					// 如果切换到桌面端，隐藏移动端菜单
					if (!this.isMobile && this.showMobileMenu) {
						this.hideMobileMenu();
					}
				};
				uni.onWindowResize(this.resizeHandler);
			}
		},

		// 清理监听器
		cleanupResizeListener() {
			if (this.resizeHandler && typeof uni !== 'undefined' && uni.offWindowResize) {
				uni.offWindowResize(this.resizeHandler);
			}
		}
	}
}
</script>

<style scoped>
.global-nav {
	background-color: #ffffff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	position: sticky;
	top: 0;
	z-index: 100;
	border-bottom: 1rpx solid #e5e7eb;
}

/* 桌面端导航样式 */
.desktop-nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 40rpx;
}

.logo {
	font-size: 40rpx;
	font-weight: bold;
	color: #3b82f6;
	flex-shrink: 0;
}

.nav-links {
	display: flex;
	align-items: center;
	flex: 1;
	justify-content: center;
	margin: 0 40rpx;
	gap: 10rpx;
}

.nav-item {
	padding: 16rpx 30rpx;
	font-size: 30rpx;
	color: #6b7280;
	border-bottom: 4rpx solid transparent;
	transition: all 0.3s;
	cursor: pointer;
	border-radius: 8rpx;
}

.nav-item:hover {
	background-color: #f8fafc;
	color: #3b82f6;
}

.nav-item.active {
	border-bottom: 4rpx solid #3b82f6;
	color: #3b82f6;
	font-weight: 500;
	background-color: rgba(59, 130, 246, 0.05);
}

.nav-actions {
	display: flex;
	align-items: center;
	min-width: 160rpx;
	justify-content: flex-end;
	flex-shrink: 0;
}

/* 移动端导航样式 */
.mobile-nav {
	display: none;
}

.mobile-nav-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
}

.mobile-nav-right {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

/* 移动端用户信息样式 */
.mobile-user-info {
	display: flex;
	align-items: center;
}

.mobile-user-avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	overflow: hidden;
	border: 2rpx solid #e5e7eb;
	cursor: pointer;
	transition: all 0.3s ease;
}

.mobile-user-avatar:active {
	transform: scale(0.95);
}

.mobile-user-avatar image {
	width: 100%;
	height: 100%;
}

.mobile-login-btn {
	padding: 8rpx 16rpx;
	background-color: #3b82f6;
	color: white;
	border-radius: 6rpx;
	font-size: 24rpx;
	cursor: pointer;
	transition: all 0.3s ease;
}

.mobile-login-btn:active {
	background-color: #2563eb;
	transform: scale(0.95);
}

/* 汉堡菜单按钮样式 */
.hamburger-menu {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	padding: 10rpx;
	border-radius: 8rpx;
	transition: all 0.3s ease;
	position: relative;
}

.hamburger-menu:active {
	background-color: rgba(59, 130, 246, 0.1);
}

.hamburger-line {
	width: 30rpx;
	height: 3rpx;
	background-color: #374151;
	margin: 3rpx 0;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	border-radius: 2rpx;
}

.hamburger-menu.active .hamburger-line:nth-child(1) {
	transform: rotate(45deg) translate(9rpx, 9rpx);
	background-color: #3b82f6;
}

.hamburger-menu.active .hamburger-line:nth-child(2) {
	opacity: 0;
}

.hamburger-menu.active .hamburger-line:nth-child(3) {
	transform: rotate(-45deg) translate(9rpx, -9rpx);
	background-color: #3b82f6;
}

/* 桌面端用户信息样式 */
.user-info {
	display: flex;
	align-items: center;
	gap: 15rpx;
	position: relative;
}

.user-name {
	font-size: 28rpx;
	color: #374151;
	font-weight: 500;
	max-width: 120rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-menu {
	cursor: pointer;
}

.user-avatar {
	width: 70rpx;
	height: 70rpx;
	border-radius: 50%;
	overflow: hidden;
	border: 2rpx solid #e5e7eb;
	transition: all 0.3s ease;
}

.user-avatar:hover {
	border-color: #3b82f6;
	transform: scale(1.05);
}

.user-avatar image {
	width: 100%;
	height: 100%;
}

.login-btn {
	padding: 12rpx 24rpx;
	background-color: #3b82f6;
	color: white;
	border-radius: 8rpx;
	font-size: 28rpx;
	cursor: pointer;
	transition: all 0.3s ease;
}

.login-btn:hover {
	background-color: #2563eb;
	transform: translateY(-2rpx);
}

.login-btn:active {
	transform: translateY(0);
}

/* 移动端导航菜单样式 */
.mobile-nav-menu {
	position: fixed;
	top: 0;
	right: -100%;
	width: 80%;
	max-width: 400rpx;
	height: 100vh;
	background-color: #ffffff;
	box-shadow: -4rpx 0 20rpx rgba(0, 0, 0, 0.15);
	transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	z-index: 1001;
	overflow-y: auto;
}

.mobile-nav-menu.show {
	right: 0;
}

.mobile-nav-content {
	padding: 120rpx 0 60rpx 0;
}

.mobile-nav-item {
	display: flex;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1rpx solid #f1f5f9;
	cursor: pointer;
	transition: all 0.3s ease;
	position: relative;
}

.mobile-nav-item:active {
	background-color: rgba(59, 130, 246, 0.05);
}

.mobile-nav-item.active {
	background-color: rgba(59, 130, 246, 0.1);
	border-left: 6rpx solid #3b82f6;
}

.nav-icon {
	font-size: 32rpx;
	margin-right: 20rpx;
	width: 40rpx;
	text-align: center;
}

.nav-text {
	font-size: 32rpx;
	color: #374151;
	font-weight: 500;
	flex: 1;
}

.mobile-nav-item.active .nav-text {
	color: #3b82f6;
	font-weight: 600;
}

.nav-arrow {
	font-size: 28rpx;
	color: #3b82f6;
	font-weight: bold;
}

/* 移动端遮罩层 */
.mobile-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.3);
	z-index: 1000;
	opacity: 0;
	animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
	to {
		opacity: 1;
	}
}

/* 用户菜单弹窗样式 */
.user-menu-modal {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.2);
	display: flex;
	align-items: flex-start;
	justify-content: flex-end;
	z-index: 1002;
	padding-top: 120rpx;
	padding-right: 40rpx;
}

.menu-content {
	background-color: white;
	border-radius: 12rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
	overflow: hidden;
	min-width: 200rpx;
	border: 1rpx solid #e5e7eb;
}

.menu-item {
	padding: 24rpx 32rpx;
	cursor: pointer;
	transition: all 0.3s ease;
	border-bottom: 1rpx solid #f3f4f6;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-item:hover {
	background-color: #fef2f2;
}

.menu-item:active {
	background-color: #fee2e2;
}

.menu-text {
	font-size: 28rpx;
	color: #dc2626;
	font-weight: 500;
}

/* 响应式设计 - 移动端优先 */
@media screen and (max-width: 768px) {
	/* 隐藏桌面端导航 */
	.desktop-nav {
		display: none;
	}

	/* 显示移动端导航 */
	.mobile-nav {
		display: block;
	}

	/* 移动端用户菜单调整 */
	.user-menu-modal {
		padding-top: 140rpx;
		padding-right: 30rpx;
		align-items: flex-start;
		justify-content: flex-end;
	}

	.menu-content {
		min-width: 180rpx;
	}

	.menu-item {
		padding: 20rpx 24rpx;
	}

	.menu-text {
		font-size: 26rpx;
	}
}

/* 超小屏幕适配 */
@media screen and (max-width: 480px) {
	.mobile-nav-header {
		padding: 15rpx 20rpx;
	}

	.logo {
		font-size: 36rpx;
	}

	.mobile-nav-menu {
		width: 85%;
		max-width: 350rpx;
	}

	.mobile-nav-content {
		padding: 100rpx 0 40rpx 0;
	}

	.mobile-nav-item {
		padding: 25rpx 30rpx;
	}

	.nav-icon {
		font-size: 28rpx;
		margin-right: 15rpx;
		width: 35rpx;
	}

	.nav-text {
		font-size: 28rpx;
	}

	.mobile-user-avatar {
		width: 50rpx;
		height: 50rpx;
	}

	.mobile-login-btn {
		padding: 6rpx 12rpx;
		font-size: 22rpx;
	}

	.hamburger-menu {
		width: 50rpx;
		height: 50rpx;
		padding: 8rpx;
	}

	.hamburger-line {
		width: 25rpx;
		height: 2rpx;
		margin: 2rpx 0;
	}
}

/* 桌面端确保移动端导航隐藏 */
@media screen and (min-width: 769px) {
	.mobile-nav {
		display: none !important;
	}

	.desktop-nav {
		display: flex !important;
	}
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
	.mobile-nav-item {
		/* 增加触摸区域 */
		min-height: 100rpx;
	}

	.hamburger-menu {
		/* 增加触摸区域 */
		min-width: 80rpx;
		min-height: 80rpx;
	}

	/* 移除hover效果，使用active效果 */
	.nav-item:hover {
		background-color: transparent;
		color: #6b7280;
	}

	.user-avatar:hover {
		border-color: #e5e7eb;
		transform: none;
	}

	.login-btn:hover {
		background-color: #3b82f6;
		transform: none;
	}
}
</style>