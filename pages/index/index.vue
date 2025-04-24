<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item active">首页</view>
				<view class="nav-item" @tap="navigateTo('workouts')">运动数据库</view>
				<view class="nav-item" @tap="navigateTo('plans')">健身计划</view>
				<view class="nav-item" @tap="navigateTo('progress')">进度追踪</view>
			</view>
			<view class="record-btn">
				<button class="btn btn-primary" @tap="recordWorkout">记录训练</button>
			</view>
		</view>
		
		<view class="container">
			<!-- 欢迎区域 -->
			<view class="card welcome-card">
				<view class="flex-row justify-between align-center">
					<view>
						<text class="section-title">欢迎回来, {{userInfo.name}}!</text>
					</view>
					<view class="user-avatar">
						<image src="/static/images/avatar.png" mode="aspectFill"></image>
					</view>
				</view>
			</view>
			
			<!-- 统计卡片区域 -->
			<view class="stats-cards">
				<view class="card stat-card blue-card">
					<text class="stat-label">今日训练</text>
					<text class="stat-value">胸肌 & 三头肌</text>
					<text class="stat-desc">下午 6:30</text>
				</view>
				
				<view class="card stat-card green-card">
					<text class="stat-label">本周完成</text>
					<text class="stat-value">3 次训练</text>
					<text class="stat-desc">比上周多 1 次</text>
				</view>
				
				<view class="card stat-card purple-card">
					<text class="stat-label">当前体重</text>
					<text class="stat-value">75.5 kg</text>
					<text class="stat-desc">比上周 -0.5 kg</text>
				</view>
			</view>
			
			<!-- 添加训练按钮 -->
			<view class="add-workout-btn">
				<button class="btn btn-primary" @tap="recordWorkout">记录训练</button>
			</view>
			
			<!-- 推荐训练计划 -->
			<view class="card recommended-plans">
				<view class="flex-row justify-between align-center">
					<text class="section-title">推荐训练计划</text>
					<text class="text-primary view-all" @tap="goToPlans">查看全部</text>
				</view>
				
				<view class="plan-list">
					<view class="plan-card" v-for="(plan, index) in recommendedPlans" :key="index" @tap="viewPlanDetails(plan)">
						<view class="plan-card-content">
							<text class="plan-title">{{plan.title}}</text>
							<text class="plan-desc">{{plan.description}}</text>
							<view class="flex-row justify-between align-center">
								<view class="badge badge-primary">{{plan.level}}</view>
								<text class="plan-duration">{{plan.duration}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {
				name: '用户'
			},
			recommendedPlans: [
				{
					id: 1,
					title: '初学者全身训练',
					description: '适合刚开始健身的人群，全面锻炼所有主要肌群。',
					level: '初级',
					duration: '45 分钟'
				},
				{
					id: 2,
					title: '增肌力量训练',
					description: '专注于大重量复合动作，促进肌肉生长。',
					level: '中级',
					duration: '60 分钟'
				},
				{
					id: 3,
					title: '高强度间歇训练',
					description: '燃烧脂肪，提高心肺功能的HIIT训练。',
					level: '高级',
					duration: '30 分钟'
				}
			]
		}
	},
	onShow() {
		// 获取用户信息
		const userInfoStorage = uni.getStorageSync('userInfo');
		if (userInfoStorage) {
			this.userInfo = userInfoStorage;
		}
	},
	onMounted() {
		// TabBar补丁 - 确保useShowTabBar不会报错
		if (typeof window !== 'undefined') {
			window.__tabBarHeight = 0;
			if (!window.useShowTabBar) {
				window.useShowTabBar = () => ({ height: 0 });
			}
		}
	},
	methods: {
		navigateTo(page) {
			uni.navigateTo({
				url: `/pages/${page}/${page}`
			});
		},
		recordWorkout() {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		},
		goToPlans() {
			uni.navigateTo({
				url: '/pages/plans/plans'
			});
		},
		viewPlanDetails(plan) {
			uni.showToast({
				title: '查看计划：' + plan.title,
				icon: 'none'
			});
		}
	}
}
</script>

<style>
.page-container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.top-nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 40rpx;
	background-color: #ffffff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	position: sticky;
	top: 0;
	z-index: 100;
}

.logo {
	font-size: 40rpx;
	font-weight: bold;
	color: #3b82f6;
}

.nav-links {
	display: flex;
	align-items: center;
	flex: 1;
	justify-content: center;
	margin: 0 40rpx;
}

.nav-item {
	padding: 16rpx 30rpx;
	margin: 0 15rpx;
	font-size: 30rpx;
	border-bottom: 4rpx solid transparent;
	transition: all 0.3s;
}

.nav-item.active {
	border-bottom: 4rpx solid #3b82f6;
	color: #3b82f6;
	font-weight: 500;
}

.record-btn .btn {
	font-size: 26rpx;
	height: 70rpx;
	line-height: 70rpx;
	padding: 0 30rpx;
}

.container {
	padding: 30rpx;
	min-height: 100vh;
	background-color: #f5f5f5;
	width: 80%;
	margin: 0 auto;
}

.welcome-card {
	margin-bottom: 30rpx;
	padding: 30rpx;
}

.user-avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	overflow: hidden;
}

.user-avatar image {
	width: 100%;
	height: 100%;
}

.stats-cards {
	display: flex;
	justify-content: space-between;
	margin-bottom: 40rpx;
}

.stat-card {
	flex: 1;
	margin: 0 15rpx;
	padding: 30rpx;
}

.stat-card:first-child {
	margin-left: 0;
}

.stat-card:last-child {
	margin-right: 0;
}

.blue-card {
	background-color: rgba(59, 130, 246, 0.1);
}

.green-card {
	background-color: rgba(16, 185, 129, 0.1);
}

.purple-card {
	background-color: rgba(124, 58, 237, 0.1);
}

.stat-label {
	font-size: 24rpx;
	color: #6b7280;
	margin-bottom: 12rpx;
	display: block;
}

.stat-value {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
	display: block;
}

.stat-desc {
	font-size: 24rpx;
	color: #6b7280;
	display: block;
}

.add-workout-btn {
	margin-bottom: 40rpx;
}

.section-title {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 30rpx;
}

.card {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.btn {
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 8rpx;
	font-size: 32rpx;
	text-align: center;
}

.btn-primary {
	background-color: #3b82f6;
	color: #ffffff;
}

.text-primary {
	color: #3b82f6;
}

.view-all {
	font-size: 28rpx;
}

.plan-list {
	margin-top: 30rpx;
}

.plan-card {
	background-color: #fff;
	border-radius: 12rpx;
	border: 2rpx solid #e5e7eb;
	margin-bottom: 30rpx;
	transition: all 0.3s ease;
}

.plan-card-content {
	padding: 30rpx;
}

.plan-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 15rpx;
	display: block;
}

.plan-desc {
	font-size: 28rpx;
	color: #6b7280;
	margin-bottom: 25rpx;
	display: block;
}

.plan-duration {
	font-size: 26rpx;
	color: #6b7280;
}

.badge {
	padding: 6rpx 16rpx;
	border-radius: 100rpx;
	font-size: 24rpx;
	font-weight: 600;
}

.badge-primary {
	background-color: rgba(59, 130, 246, 0.1);
	color: #3b82f6;
}

.flex-row {
	display: flex;
	flex-direction: row;
}

.justify-between {
	justify-content: space-between;
}

.align-center {
	align-items: center;
}

@media screen and (max-width: 768px) {
	.container {
		width: 90%;
	}
	
	.top-nav {
		flex-direction: column;
		padding: 20rpx;
	}
	
	.logo {
		margin-bottom: 20rpx;
	}
	
	.nav-links {
		width: 100%;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}
	
	.nav-item {
		padding: 10rpx;
		margin: 0 5rpx;
		font-size: 24rpx;
	}
	
	.record-btn {
		display: none;
	}
}
</style> 