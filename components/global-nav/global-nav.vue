<template>
	<view class="global-nav">
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
		
		<!-- 用户菜单弹窗 -->
		<view class="user-menu-modal" v-if="showMenu" @tap.self="hideUserMenu">
			<view class="menu-content">
				<view class="menu-item" @tap="handleLogout">
					<text class="menu-text">退出登录</text>
				</view>
			</view>
		</view>
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
			showMenu: false
		}
	},
	onShow() {
		this.loadUserInfo();
	},
	mounted() {
		this.loadUserInfo();
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
		}
	}
}
</script>

<style scoped>
.global-nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 40rpx;
	background-color: #ffffff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	position: sticky;
	top: 0;
	z-index: 100;
	border-bottom: 1rpx solid #e5e7eb;
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
	z-index: 1000;
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

.menu-text {
	font-size: 28rpx;
	color: #dc2626;
	font-weight: 500;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
	.global-nav {
		flex-direction: column;
		padding: 20rpx;
		gap: 20rpx;
	}
	
	.logo {
		font-size: 36rpx;
	}
	
	.nav-links {
		width: 100%;
		justify-content: space-between;
		margin: 0;
		gap: 5rpx;
		flex-wrap: wrap;
	}
	
	.nav-item {
		padding: 12rpx 16rpx;
		font-size: 24rpx;
		flex: 1;
		text-align: center;
		min-width: 0;
	}
	
	.nav-actions {
		width: 100%;
		justify-content: center;
		min-width: auto;
	}
	
	.user-name {
		font-size: 26rpx;
		max-width: 100rpx;
	}
	
	.user-avatar {
		width: 60rpx;
		height: 60rpx;
	}
	
	.user-menu-modal {
		padding-top: 200rpx;
		padding-right: 20rpx;
		align-items: center;
		justify-content: center;
	}
}

/* 超小屏幕适配 */
@media screen and (max-width: 480px) {
	.nav-links {
		flex-direction: column;
		gap: 10rpx;
	}
	
	.nav-item {
		width: 100%;
		text-align: center;
	}
}
</style>