<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item active">首页</view>
				<view class="nav-item" @tap="navigateTo('progress')">进度追踪</view>
				<view class="nav-item" @tap="navigateTo('plans')">健身计划</view>
				<view class="nav-item" @tap="navigateTo('workouts')">训练数据库</view>
			</view>
			<view class="nav-actions">
				<!-- 右侧占位符，保持布局平衡 -->
			</view>
		</view>
		
		<view class="container">			<!-- 欢迎区域 -->
			<view class="card welcome-card">
				<view class="flex-row justify-between align-center">
					<view>
						<text class="section-title">欢迎回来, {{userInfo.name}}!</text>
					</view>
					<view class="header-actions">
						<view class="sync-status" @tap="handleSync">
							<text class="sync-icon">{{ syncStatus.icon }}</text>
							<text class="sync-text">{{ syncStatus.text }}</text>
						</view>
						<view class="user-avatar">
							<image src="/static/images/avatar.png" mode="aspectFill"></image>
						</view>
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
					<text class="stat-value">{{trainingInfo.thisWeek}}</text>
					<text class="stat-desc">{{trainingInfo.weeklyProgress}}</text>
				</view>
				
				<view class="card stat-card purple-card">
					<text class="stat-label">当前体重</text>
					<text class="stat-value">{{weightInfo.current}}</text>
					<text class="stat-desc">{{weightInfo.change}}</text>
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
import localDataService from '@/utils/localDataService.js';

export default {
	data() {
		return {
			userInfo: {
				name: '用户'
			},
			weightInfo: {
				current: '暂无记录',
				change: '暂无变化数据'
			},
			trainingInfo: {
				thisWeek: '0 次训练',
				weeklyProgress: '开始您的健身之旅'
			},
			syncStatus: {
				icon: '🔄',
				text: '点击同步',
				syncing: false
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
		
		// 更新同步状态
		this.updateSyncStatus();
		
		// 加载体重信息
		this.loadWeightInfo();
		
		// 加载训练信息
		this.loadTrainingInfo();
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
		// 处理数据同步
		async handleSync() {
			if (this.syncStatus.syncing) return;
			
			if (!localDataService.isLoggedIn) {
				uni.showModal({
					title: '提示',
					content: '需要登录才能同步数据，是否前往登录？',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: '/pages/login/login'
							});
						}
					}
				});
				return;
			}
			
			this.syncStatus.syncing = true;
			this.syncStatus.icon = '⏳';
			this.syncStatus.text = '同步中...';
			
			try {
				const result = await localDataService.autoSync();
				
				if (result.success) {
					this.syncStatus.icon = '✅';
					this.syncStatus.text = '同步成功';
					
					// 重新加载数据
					this.loadWeightInfo();
					this.loadTrainingInfo();
					
					uni.showToast({
						title: '数据同步成功',
						icon: 'success'
					});
				} else {
					this.syncStatus.icon = '❌';
					this.syncStatus.text = '同步失败';
					
					uni.showToast({
						title: result.message || '数据同步失败',
						icon: 'none'
					});
				}
			} catch (error) {
				this.syncStatus.icon = '❌';
				this.syncStatus.text = '连接失败';
				
				uni.showToast({
					title: '请检查服务器是否启动',
					icon: 'none'
				});
			}
			
			this.syncStatus.syncing = false;
			
			// 3秒后恢复默认状态
			setTimeout(() => {
				this.syncStatus.icon = '🔄';
				this.syncStatus.text = '点击同步';
			}, 3000);
		},
		
		// 更新同步状态
		updateSyncStatus() {
			if (localDataService.isLoggedIn) {
				this.syncStatus.icon = '🔄';
				this.syncStatus.text = '点击同步';
			} else {
				this.syncStatus.icon = '🔒';
				this.syncStatus.text = '需要登录';
			}
		},
		
		navigateTo(page) {
			uni.reLaunch({
				url: `/pages/${page}/${page}`
			});
		},
		recordWorkout() {
			uni.navigateTo({
				url: '/pages/record/record'
			});
		},
		goToPlans() {
			uni.reLaunch({
				url: '/pages/plans/plans'
			});
		},
		viewPlanDetails(plan) {
			uni.showToast({
				title: '查看计划：' + plan.title,
				icon: 'none'
			});
		},
		loadWeightInfo() {
			const weightHistory = uni.getStorageSync('weightHistory') || [];
			
			if (weightHistory.length === 0) {
				this.weightInfo = {
					current: '暂无记录',
					change: '点击"进度追踪"记录体重'
				};
				return;
			}
			
			// 获取最新体重
			const latestWeight = weightHistory[0];
			this.weightInfo.current = latestWeight.weight + ' kg';
			
			// 计算与上次记录的变化
			if (weightHistory.length >= 2) {
				const previousWeight = weightHistory[1];
				const change = latestWeight.weight - previousWeight.weight;
				const daysDiff = this.calculateDaysDiff(previousWeight.date, latestWeight.date);
				
				let changeText = '';
				if (change > 0) {
					changeText = `比${daysDiff}天前 +${change.toFixed(1)} kg`;
				} else if (change < 0) {
					changeText = `比${daysDiff}天前 ${change.toFixed(1)} kg`;
				} else {
					changeText = `比${daysDiff}天前无变化`;
				}
				
				this.weightInfo.change = changeText;
			} else {
				// 计算距离记录日期的天数
				const daysSinceRecord = this.calculateDaysDiff(latestWeight.date, new Date().toISOString().split('T')[0]);
				if (daysSinceRecord === 0) {
					this.weightInfo.change = '今日已记录';
				} else {
					this.weightInfo.change = `${daysSinceRecord}天前记录`;
				}
			}
		},
		calculateDaysDiff(date1, date2) {
			const d1 = new Date(date1);
			const d2 = new Date(date2);
			const diffTime = Math.abs(d2 - d1);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays;
		},
		loadTrainingInfo() {
			const workoutHistory = uni.getStorageSync('workoutHistory') || [];
			
			if (workoutHistory.length === 0) {
				this.trainingInfo = {
					thisWeek: '0 次训练',
					weeklyProgress: '开始您的健身之旅'
				};
				return;
			}
			
			// 计算本周训练次数
			const now = new Date();
			const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
			const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
			
			let thisWeekCount = 0;
			let lastWeekCount = 0;
			
			workoutHistory.forEach(workout => {
				const workoutDate = new Date(workout.date);
				
				if (workoutDate >= thisWeekStart) {
					thisWeekCount++;
				} else if (workoutDate >= lastWeekStart && workoutDate < thisWeekStart) {
					lastWeekCount++;
				}
			});
			
			this.trainingInfo.thisWeek = thisWeekCount + ' 次训练';
			
			// 计算进度变化
			if (lastWeekCount === 0 && thisWeekCount > 0) {
				this.trainingInfo.weeklyProgress = '本周开始健身，加油！';
			} else if (lastWeekCount === 0) {
				this.trainingInfo.weeklyProgress = '本周尚未开始训练';
			} else {
				const change = thisWeekCount - lastWeekCount;
				if (change > 0) {
					this.trainingInfo.weeklyProgress = `比上周多 ${change} 次`;
				} else if (change < 0) {
					this.trainingInfo.weeklyProgress = `比上周少 ${Math.abs(change)} 次`;
				} else {
					this.trainingInfo.weeklyProgress = '与上周持平';
				}
			}
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

.nav-actions {
	display: flex;
	align-items: center;
	min-width: 120rpx; /* 确保右侧有足够的占位空间 */
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

.header-actions {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.sync-status {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 10rpx;
	border-radius: 12rpx;
	background-color: rgba(59, 130, 246, 0.1);
	min-width: 100rpx;
	cursor: pointer;
	transition: all 0.3s ease;
}

.sync-status:active {
	background-color: rgba(59, 130, 246, 0.2);
	transform: scale(0.95);
}

.sync-icon {
	font-size: 32rpx;
	margin-bottom: 4rpx;
}

.sync-text {
	font-size: 20rpx;
	color: #3b82f6;
	text-align: center;
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
}
</style>