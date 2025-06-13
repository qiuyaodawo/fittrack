<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item active">首页</view>
				<view class="nav-item" @tap="navigateTo('history')">记录</view>
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
						<view class="sync-status" @tap="handleLogout">
							<text class="sync-text">退出登录</text>
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
			
			<!-- 本周训练计划 -->
			<view class="card weekly-plans">
				<view class="flex-row justify-between align-center">
					<text class="section-title">本周训练计划</text>
					<text class="text-primary view-all" @tap="goToPlans">管理计划</text>
				</view>
				
				<view class="weekly-plan-list">
					<view class="day-plan-card" v-for="(day, index) in weeklyPlans" :key="index">
						<view class="day-plan-header">
							<text class="day-name" :class="{'today': day.isToday}">{{day.dayName}}</text>
							<text class="day-date">{{day.date}}</text>
						</view>
						<view class="day-plan-content">
							<view v-if="day.hasPlans" class="plan-info">
								<text class="plan-title">{{day.planTitle}}</text>
								<text class="plan-exercises">{{day.exerciseCount}}个动作</text>
								<view class="plan-status" :class="day.statusClass">
									<text class="status-text">{{day.status}}</text>
								</view>
							</view>
							<view v-else class="no-plan">
								<text class="no-plan-text">无计划</text>
								<text class="add-plan-hint" @tap="goToPlans">+添加计划</text>
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

			weeklyPlans: []
		}
	},
	onShow() {
		// 获取用户信息
		const userInfoStorage = uni.getStorageSync('userInfo');
		if (userInfoStorage) {
			this.userInfo = userInfoStorage;
		}
		

		
		// 加载体重信息
		this.loadWeightInfo();
		
		// 加载训练信息
		this.loadTrainingInfo();
		
		// 加载本周计划
		this.loadWeeklyPlans();
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
		// 处理退出登录
		handleLogout() {
			uni.showModal({
				title: '退出确认',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 清除登录信息和用户数据
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
					}
				}
			});
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
			const userInfo = uni.getStorageSync('userInfo');
			const weightHistoryKey = userInfo && userInfo.id ? `weightHistory_${userInfo.id}` : 'weightHistory';
			const weightHistory = uni.getStorageSync(weightHistoryKey) || [];
			
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
			const userInfo = uni.getStorageSync('userInfo');
			const workoutHistoryKey = userInfo && userInfo.id ? `workoutHistory_${userInfo.id}` : 'workoutHistory';
			const workoutHistory = uni.getStorageSync(workoutHistoryKey) || [];
			
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
		},
		loadWeeklyPlans() {
			// 获取当前日期
			const now = new Date();
			const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
			
			// 计算本周的开始日期（周一）
			const currentDay = now.getDay();
			const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
			const mondayDate = new Date(now.getTime() + mondayOffset * 24 * 60 * 60 * 1000);
			
			// 生成本周7天的计划数据
			this.weeklyPlans = [];
			
			for (let i = 0; i < 7; i++) {
				const date = new Date(mondayDate.getTime() + i * 24 * 60 * 60 * 1000);
				const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // 转换为周一=0, 周日=6的索引
				const dayName = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][dayIndex];
				const dateStr = this.formatDate(date);
				const isToday = this.isSameDay(date, now);
				
				// 从存储的计划中查找当日的训练安排
				const dayPlan = this.getDayPlanFromStorage(dayName);
				
				const dayData = {
					dayName: dayName,
					date: dateStr,
					isToday: isToday,
					hasPlans: dayPlan !== null,
					planTitle: dayPlan ? dayPlan.title : '',
					exerciseCount: dayPlan ? dayPlan.exerciseCount : 0,
					status: dayPlan ? dayPlan.status : '',
					statusClass: dayPlan ? dayPlan.statusClass : ''
				};
				
				this.weeklyPlans.push(dayData);
			}
		},
		getDayPlanFromStorage(dayName) {
			// 从本地存储获取用户的训练计划（按用户隔离）
			const userInfo = uni.getStorageSync('userInfo');
			const myPlansKey = userInfo && userInfo.id ? `myPlans_${userInfo.id}` : 'myPlans';
			const workoutHistoryKey = userInfo && userInfo.id ? `workoutHistory_${userInfo.id}` : 'workoutHistory';
			const myPlans = uni.getStorageSync(myPlansKey) || [];
			const workoutHistory = uni.getStorageSync(workoutHistoryKey) || [];
			
			// 找到进行中的计划
			const activePlan = myPlans.find(plan => plan.status === '进行中');
			
			if (!activePlan || !activePlan.weekPlans) {
				return null;
			}
			
			// 查找当前周的计划
			const currentWeek = this.getCurrentWeekOfPlan(activePlan);
			const weekPlan = activePlan.weekPlans[currentWeek];
			
			if (!weekPlan || !weekPlan[dayName]) {
				return null;
			}
			
			const dayTraining = weekPlan[dayName];
			
			// 如果是休息日
			if (dayTraining.restDay) {
				return {
					title: '休息日',
					exerciseCount: 0,
					status: '休息',
					statusClass: 'rest'
				};
			}
			
			// 检查今日是否已完成训练
			const today = new Date();
			const todayStr = this.formatDate(today);
			const isCompleted = workoutHistory.some(workout => 
				workout.date === todayStr && workout.planDay === dayName
			);
			
			return {
				title: dayTraining.exercises.length > 0 ? `${dayTraining.exercises[0].name}等训练` : '训练日',
				exerciseCount: dayTraining.exercises.length,
				status: isCompleted ? '已完成' : '未完成',
				statusClass: isCompleted ? 'completed' : 'pending'
			};
		},
		getCurrentWeekOfPlan(plan) {
			// 简化实现：返回第1周
			// 实际应用中可以根据计划开始日期计算当前是第几周
			return 1;
		},
		formatDate(date) {
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			return `${month}/${day}`;
		},
		isSameDay(date1, date2) {
			return date1.getDate() === date2.getDate() &&
				   date1.getMonth() === date2.getMonth() &&
				   date1.getFullYear() === date2.getFullYear();
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

/* 本周训练计划样式 */
.weekly-plans {
	margin-bottom: 40rpx;
}

.weekly-plan-list {
	margin-top: 30rpx;
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 16rpx;
}

.day-plan-card {
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border: 2rpx solid #e2e8f0;
	border-radius: 16rpx;
	padding: 20rpx;
	transition: all 0.3s ease;
	min-height: 200rpx;
	display: flex;
	flex-direction: column;
}

.day-plan-card:hover {
	transform: translateY(-4rpx);
	box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.15);
	border-color: #3b82f6;
}

.day-plan-header {
	text-align: center;
	margin-bottom: 16rpx;
	border-bottom: 1rpx solid #e5e7eb;
	padding-bottom: 12rpx;
}

.day-name {
	font-size: 26rpx;
	font-weight: 600;
	color: #374151;
	display: block;
	margin-bottom: 6rpx;
}

.day-name.today {
	color: #3b82f6;
	font-weight: 700;
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.day-date {
	font-size: 22rpx;
	color: #6b7280;
}

.day-plan-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.plan-info {
	text-align: center;
}

.plan-info .plan-title {
	font-size: 24rpx;
	font-weight: 600;
	color: #374151;
	margin-bottom: 8rpx;
	display: block;
}

.plan-exercises {
	font-size: 20rpx;
	color: #6b7280;
	margin-bottom: 12rpx;
	display: block;
}

.plan-status {
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	font-size: 20rpx;
	font-weight: 500;
	display: inline-block;
}

.plan-status.completed {
	background: linear-gradient(135deg, #10b981, #059669);
	color: white;
}

.plan-status.pending {
	background: linear-gradient(135deg, #f59e0b, #d97706);
	color: white;
}

.plan-status.rest {
	background: linear-gradient(135deg, #6b7280, #4b5563);
	color: white;
}

.no-plan {
	text-align: center;
	color: #9ca3af;
}

.no-plan-text {
	font-size: 22rpx;
	margin-bottom: 8rpx;
	display: block;
}

.add-plan-hint {
	font-size: 20rpx;
	color: #3b82f6;
	cursor: pointer;
	transition: color 0.3s ease;
}

.add-plan-hint:hover {
	color: #1d4ed8;
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
	
	.weekly-plan-list {
		grid-template-columns: 1fr;
		gap: 12rpx;
	}
	
	.day-plan-card {
		min-height: auto;
		padding: 16rpx;
		flex-direction: row;
		align-items: center;
	}
	
	.day-plan-header {
		margin-bottom: 0;
		margin-right: 16rpx;
		border-bottom: none;
		border-right: 1rpx solid #e5e7eb;
		padding-bottom: 0;
		padding-right: 16rpx;
		text-align: left;
		min-width: 120rpx;
	}
	
	.day-plan-content {
		flex: 1;
		justify-content: flex-start;
	}
	
	.plan-info, .no-plan {
		text-align: left;
	}
}
</style>