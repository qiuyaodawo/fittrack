<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item" @tap="navigateTo('index')">首页</view>
				<view class="nav-item" @tap="navigateTo('workouts')">运动数据库</view>
				<view class="nav-item active">健身计划</view>
				<view class="nav-item" @tap="navigateTo('progress')">进度追踪</view>
			</view>
			<view class="record-btn">
				<button class="btn btn-primary" @tap="recordWorkout">记录训练</button>
			</view>
		</view>
		
		<view class="content-container">
			<view class="card plan-generator">
				<view class="flex-row justify-between align-center">
					<text class="section-title">健身计划生成器</text>
					<button class="btn-sm btn-primary" @tap="createPlan">创建新计划</button>
				</view>
				
				<view class="generator-content">
					<view class="plan-settings">
						<view class="form-item">
							<text class="form-label">目标</text>
							<picker :value="goalIndex" :range="goals" @change="onGoalChange">
								<view class="picker-value">{{goals[goalIndex]}}</view>
							</picker>
						</view>
						
						<view class="form-item">
							<text class="form-label">每周训练天数</text>
							<picker :value="daysIndex" :range="trainingDays" @change="onDaysChange">
								<view class="picker-value">{{trainingDays[daysIndex]}}</view>
							</picker>
						</view>
						
						<view class="form-item">
							<text class="form-label">训练水平</text>
							<picker :value="levelIndex" :range="levels" @change="onLevelChange">
								<view class="picker-value">{{levels[levelIndex]}}</view>
							</picker>
						</view>
						
						<button class="btn btn-primary" @tap="generatePlan">生成计划</button>
					</view>
					
					<view class="plan-preview" v-if="showPreview">
						<text class="preview-title">生成计划预览</text>
						
						<view class="day-plan" v-for="(day, index) in previewPlan" :key="index">
							<text class="day-title">{{day.day}}: {{day.focus}}</text>
							<view class="exercise-list">
								<view class="exercise-item" v-for="(exercise, idx) in day.exercises" :key="idx">
									<text class="exercise-text">• {{exercise}}</text>
								</view>
							</view>
						</view>
						
						<button class="btn btn-primary" @tap="savePlan">保存计划</button>
					</view>
				</view>
			</view>
			
			<view class="card my-plans">
				<text class="section-title">我的计划</text>
				
				<view class="plan-list">
					<view class="my-plan-card" v-for="(plan, index) in myPlans" :key="index" @tap="viewPlanDetails(plan)">
						<view class="plan-card-content">
							<view class="flex-row justify-between align-center">
								<text class="plan-title">{{plan.title}}</text>
								<view class="badge" :class="'badge-' + plan.statusClass">{{plan.status}}</view>
							</view>
							<text class="plan-desc">{{plan.description}}</text>
							<view class="flex-row justify-between align-center">
								<text class="plan-progress">{{plan.progress}}</text>
								<text class="text-primary plan-action">{{plan.actionText}}</text>
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
			goalIndex: 0,
			goals: ['增肌', '减脂', '力量提升', '耐力训练'],
			
			daysIndex: 0,
			trainingDays: ['3天', '4天', '5天', '6天'],
			
			levelIndex: 0,
			levels: ['初级', '中级', '高级'],
			
			showPreview: false,
			previewPlan: [],
			
			myPlans: [
				{
					id: 1,
					title: '12周增肌计划',
					description: '专注于渐进式超负荷的增肌训练计划。',
					status: '进行中',
					statusClass: 'primary',
					progress: '第4周/共12周',
					actionText: '查看详情'
				},
				{
					id: 2,
					title: '8周减脂计划',
					description: '结合力量训练和HIIT的减脂计划。',
					status: '已完成',
					statusClass: 'success',
					progress: '8周/共8周',
					actionText: '查看详情'
				},
				{
					id: 3,
					title: '力量提升计划',
					description: '专注于5大项的力量提升计划。',
					status: '未开始',
					statusClass: 'warning',
					progress: '0周/共6周',
					actionText: '开始计划'
				}
			]
		}
	},
	methods: {
		navigateTo(page) {
			uni.reLaunch({
				url: `/pages/${page}/${page}`
			});
		},
		recordWorkout() {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		},
		onGoalChange(e) {
			this.goalIndex = e.detail.value;
		},
		onDaysChange(e) {
			this.daysIndex = e.detail.value;
		},
		onLevelChange(e) {
			this.levelIndex = e.detail.value;
		},
		createPlan() {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		},
		generatePlan() {
			// 模拟生成计划
			uni.showLoading({
				title: '生成中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				
				// 根据选择的目标和天数生成不同的计划
				if (this.goalIndex === 0) { // 增肌
					this.previewPlan = [
						{
							day: '周一',
							focus: '胸肌 & 三头肌',
							exercises: [
								'平板杠铃卧推 4组 x 8-12次',
								'上斜哑铃卧推 3组 x 10-12次',
								'双杠臂屈伸 3组 x 最大次数',
								'绳索下压 3组 x 12-15次'
							]
						},
						{
							day: '周三',
							focus: '背部 & 二头肌',
							exercises: [
								'引体向上 4组 x 最大次数',
								'杠铃划船 3组 x 8-12次',
								'高位下拉 3组 x 10-12次',
								'杠铃弯举 3组 x 10-12次'
							]
						},
						{
							day: '周五',
							focus: '腿部 & 核心',
							exercises: [
								'深蹲 4组 x 6-10次',
								'罗马尼亚硬拉 3组 x 8-12次',
								'腿举 3组 x 10-12次',
								'平板支撑 3组 x 60秒'
							]
						}
					];
				} else if (this.goalIndex === 1) { // 减脂
					this.previewPlan = [
						{
							day: '周一',
							focus: '全身HIIT',
							exercises: [
								'杠铃复合动作循环 40秒工作/20秒休息',
								'俯卧撑 40秒工作/20秒休息',
								'深蹲跳 40秒工作/20秒休息',
								'登山者 40秒工作/20秒休息',
								'共4轮，轮间休息60秒'
							]
						},
						{
							day: '周三',
							focus: '上肢 & 核心',
							exercises: [
								'超级组: 俯卧撑 + 划船 3组',
								'超级组: 肩推 + 侧平举 3组',
								'超级组: 俯身划船 + 曲臂伸 3组',
								'核心循环 3分钟 x 3组'
							]
						},
						{
							day: '周五',
							focus: '下肢 & 心肺',
							exercises: [
								'超级组: 深蹲 + 弓步蹲 3组',
								'超级组: 硬拉 + 小腿提踵 3组',
								'超级组: 箱式跳 + 壶铃摆动 3组',
								'20分钟中等强度有氧'
							]
						}
					];
				} else {
					this.previewPlan = [
						{
							day: '周一',
							focus: '力量训练 A',
							exercises: [
								'杠铃深蹲 5组 x 5次',
								'杠铃卧推 5组 x 5次',
								'硬拉 3组 x 5次',
								'辅助练习 2-3组'
							]
						},
						{
							day: '周三',
							focus: '力量训练 B',
							exercises: [
								'杠铃硬拉 5组 x 5次',
								'杠铃肩推 5组 x 5次',
								'引体向上 5组 x 最大次数',
								'辅助练习 2-3组'
							]
						},
						{
							day: '周五',
							focus: '力量训练 C',
							exercises: [
								'杠铃深蹲 5组 x 5次',
								'杠铃划船 5组 x 5次',
								'杠铃硬拉变式 3组 x 5次',
								'辅助练习 2-3组'
							]
						}
					];
				}
				
				this.showPreview = true;
			}, 1500);
		},
		savePlan() {
			uni.showToast({
				title: '计划已保存',
				icon: 'success'
			});
		},
		viewPlanDetails(plan) {
			uni.showToast({
				title: '查看计划: ' + plan.title,
				icon: 'none'
			});
		}
	}
}
</script>

<style lang="scss">
.page-container {
	min-height: 100vh;
	background-color: var(--light-bg-color);
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
	color: var(--primary-color);
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
	
	&.active {
		border-bottom: 4rpx solid var(--primary-color);
		color: var(--primary-color);
		font-weight: 500;
	}
}

.record-btn {
	.btn {
		font-size: 26rpx;
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 30rpx;
	}
}

.content-container {
	width: 80%;
	margin: 0 auto;
	padding: 30rpx;
}

.btn-sm {
	height: 60rpx;
	line-height: 60rpx;
	font-size: 26rpx;
	padding: 0 20rpx;
	background-color: var(--primary-color);
	color: #fff;
	border-radius: 8rpx;
}

.generator-content {
	display: flex;
	flex-direction: column;
	margin-top: 30rpx;
	
	@media screen and (min-width: 768px) {
		flex-direction: row;
		gap: 30rpx;
		
		.plan-settings,
		.plan-preview {
			flex: 1;
		}
	}
}

.form-item {
	margin-bottom: 24rpx;
}

.form-label {
	font-size: 26rpx;
	color: var(--text-color);
	font-weight: 500;
	margin-bottom: 10rpx;
	display: block;
}

.picker-value {
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 20rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	background-color: #fff;
}

.plan-preview {
	background-color: #f8fafc;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-top: 30rpx;
	
	@media screen and (min-width: 768px) {
		margin-top: 0;
	}
}

.preview-title {
	font-size: 30rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	display: block;
}

.day-plan {
	margin-bottom: 24rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid var(--border-color);
	
	&:last-child {
		border-bottom: none;
	}
}

.day-title {
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	display: block;
}

.exercise-list {
	margin-left: 10rpx;
}

.exercise-item {
	margin-bottom: 8rpx;
}

.exercise-text {
	font-size: 26rpx;
	color: var(--text-color-light);
}

.my-plans {
	margin-top: 40rpx;
}

.plan-list {
	margin-top: 30rpx;
}

.my-plan-card {
	background-color: #fff;
	border-radius: 12rpx;
	border: 2rpx solid var(--border-color);
	margin-bottom: 30rpx;
	transition: all 0.3s ease;
	
	&:active {
		transform: translateY(-5rpx);
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
	}
}

.plan-card-content {
	padding: 30rpx;
}

.plan-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 15rpx;
}

.plan-desc {
	font-size: 28rpx;
	color: var(--text-color-light);
	margin-bottom: 25rpx;
	display: block;
}

.plan-progress {
	font-size: 26rpx;
	color: var(--text-color-light);
}

.plan-action {
	font-size: 28rpx;
}

.badge-warning {
	background-color: rgba(245, 158, 11, 0.1);
	color: var(--warning-color);
}

@media screen and (max-width: 768px) {
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
	
	.content-container {
		width: 90%;
		padding: 20rpx;
	}
}
</style> 