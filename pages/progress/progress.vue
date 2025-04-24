<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item" @tap="navigateTo('index')">首页</view>
				<view class="nav-item active">进度追踪</view>
				<view class="nav-item" @tap="navigateTo('plans')">健身计划</view>
				<view class="nav-item" @tap="navigateTo('workouts')">训练数据库</view>
			</view>
		</view>
		
		<view class="content-container">
			<view class="stats-grid">
				<view class="card stat-card">
					<text class="stat-card-title">个人记录</text>
					<view class="personal-records">
						<view class="pr-item">
							<text class="pr-exercise">卧推</text>
							<text class="pr-weight">90 kg</text>
							<text class="pr-date">2025-04-08</text>
						</view>
						<view class="pr-item">
							<text class="pr-exercise">深蹲</text>
							<text class="pr-weight">120 kg</text>
							<text class="pr-date">2025-03-22</text>
						</view>
						<view class="pr-item">
							<text class="pr-exercise">硬拉</text>
							<text class="pr-weight">145 kg</text>
							<text class="pr-date">2025-04-01</text>
						</view>
						<view class="pr-item">
							<text class="pr-exercise">肩推</text>
							<text class="pr-weight">65 kg</text>
							<text class="pr-date">2025-03-15</text>
						</view>
						<view class="pr-item">
							<text class="pr-exercise">引体向上</text>
							<text class="pr-weight">+25 kg</text>
							<text class="pr-date">2025-04-05</text>
						</view>
					</view>
				</view>
				
				<view class="card stat-card">
					<text class="stat-card-title">力量进步</text>
					<view class="strength-stats">
						<view class="strength-item">
							<text class="strength-label">深蹲 1RM</text>
							<text class="strength-value">120 kg <text class="text-success gain">+5 kg</text></text>
						</view>
						<view class="strength-item">
							<text class="strength-label">卧推 1RM</text>
							<text class="strength-value">85 kg <text class="text-success gain">+2.5 kg</text></text>
						</view>
						<view class="strength-item">
							<text class="strength-label">硬拉 1RM</text>
							<text class="strength-value">140 kg <text class="text-success gain">+7.5 kg</text></text>
						</view>
						<view class="strength-item">
							<text class="strength-label">肩推 1RM</text>
							<text class="strength-value">65 kg <text class="text-success gain">+2.5 kg</text></text>
						</view>
						<view class="strength-item">
							<text class="strength-label">引体向上 1RM</text>
							<text class="strength-value">体重+25 kg <text class="text-success gain">+5 kg</text></text>
						</view>
					</view>
				</view>
				
				<view class="card stat-card">
					<text class="stat-card-title">训练频率</text>
					<view class="stat-card-info">
						<view class="stat-info-item">
							<text class="stat-info-label">本周训练</text>
							<text class="stat-info-value">3 次</text>
						</view>
						<view class="stat-info-item">
							<text class="stat-info-label">平均时长</text>
							<text class="stat-info-value">70 分钟</text>
						</view>
					</view>
					<view class="stat-info-row">
						<view class="stat-info-item">
							<text class="stat-info-label">本月训练</text>
							<text class="stat-info-value">12 次</text>
						</view>
						<view class="stat-info-item">
							<text class="stat-info-label">训练完成率</text>
							<text class="stat-info-value text-success">92%</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="card workout-log">
				<view class="flex-row justify-between align-center">
					<text class="section-title">训练记录</text>
					<button class="btn-sm btn-primary" @tap="addWorkoutLog">添加记录</button>
				</view>
				
				<view class="workout-table">
					<view class="table-header">
						<view class="th th-date">日期</view>
						<view class="th th-type">训练类型</view>
						<view class="th th-duration">时长</view>
						<view class="th th-status">状态</view>
						<view class="th th-action">操作</view>
					</view>
					
					<view class="table-body">
						<view class="table-row" v-for="(log, index) in workoutLogs" :key="index">
							<view class="td td-date">{{log.date}}</view>
							<view class="td td-type">{{log.type}}</view>
							<view class="td td-duration">{{log.duration}}</view>
							<view class="td td-status">
								<view class="badge badge-success">{{log.status}}</view>
							</view>
							<view class="td td-action">
								<text class="text-primary" @tap="viewLogDetails(log)">详情</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 数据输入表单 -->
			<view class="card">
				<text class="section-title">数据记录</text>
				
				<view class="form-group">
					<text class="form-label">体重记录</text>
					<view class="input-group">
						<input type="digit" class="input weight-input" v-model="weightInput" placeholder="输入体重 (kg)" />
						<button class="btn-sm btn-primary" @tap="recordWeight">记录</button>
					</view>
				</view>
				
				<view class="form-group">
					<text class="form-label">最大重量记录</text>
					<view class="input-row">
						<picker class="exercise-picker" :value="exerciseIndex" :range="exercises" @change="onExerciseChange">
							<view class="picker-value">{{exercises[exerciseIndex]}}</view>
						</picker>
						<input type="digit" class="input weight-input" v-model="maxWeightInput" placeholder="输入重量 (kg)" />
						<button class="btn-sm btn-primary" @tap="recordMaxWeight">记录</button>
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
			weightInput: '',
			maxWeightInput: '',
			exerciseIndex: 0,
			exercises: ['深蹲', '卧推', '硬拉', '肩推', '引体向上'],
			
			workoutLogs: [
				{
					id: 1,
					date: '2025-04-12',
					type: '胸肌 & 三头肌',
					duration: '65 分钟',
					status: '完成'
				},
				{
					id: 2,
					date: '2025-04-10',
					type: '背部 & 二头肌',
					duration: '70 分钟',
					status: '完成'
				},
				{
					id: 3,
					date: '2025-04-08',
					type: '腿部 & 核心',
					duration: '75 分钟',
					status: '完成'
				},
				{
					id: 4,
					date: '2025-04-05',
					type: '肩部 & 手臂',
					duration: '60 分钟',
					status: '完成'
				},
				{
					id: 5,
					date: '2025-04-03',
					type: '全身训练',
					duration: '80 分钟',
					status: '完成'
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
		onExerciseChange(e) {
			this.exerciseIndex = e.detail.value;
		},
		recordWeight() {
			if (!this.weightInput) {
				uni.showToast({
					title: '请输入体重',
					icon: 'none'
				});
				return;
			}
			
			uni.showToast({
				title: '体重记录成功',
				icon: 'success'
			});
			
			this.weightInput = '';
		},
		recordMaxWeight() {
			if (!this.maxWeightInput) {
				uni.showToast({
					title: '请输入重量',
					icon: 'none'
				});
				return;
			}
			
			uni.showToast({
				title: `${this.exercises[this.exerciseIndex]}记录成功`,
				icon: 'success'
			});
			
			this.maxWeightInput = '';
		},
		addWorkoutLog() {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		},
		viewLogDetails(log) {
			uni.showToast({
				title: '查看记录: ' + log.date,
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

.content-container {
	width: 80%;
	margin: 0 auto;
	padding: 30rpx;
}

.stats-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 30rpx;
	margin-bottom: 40rpx;
	
	@media screen and (min-width: 768px) {
		grid-template-columns: repeat(3, 1fr);
	}
}

.stat-card {
	display: flex;
	flex-direction: column;
	padding: 30rpx;
}

.stat-card-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 25rpx;
}

.chart-placeholder {
	height: 300rpx;
	background-color: #f8fafc;
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	margin-bottom: 20rpx;
}

.chart-text {
	font-size: 28rpx;
	color: var(--text-color-light);
}

.chart-desc {
	font-size: 24rpx;
	color: var(--text-color-light);
	margin-top: 10rpx;
}

.stat-card-info {
	display: flex;
	justify-content: space-between;
}

.stat-info-item {
	display: flex;
	flex-direction: column;
}

.stat-info-label {
	font-size: 24rpx;
	color: var(--text-color-light);
	margin-bottom: 5rpx;
}

.stat-info-value {
	font-size: 32rpx;
	font-weight: bold;
}

.strength-stats {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

.strength-item {
	display: flex;
	flex-direction: column;
}

.strength-label {
	font-size: 24rpx;
	color: var(--text-color-light);
	margin-bottom: 5rpx;
}

.strength-value {
	font-size: 28rpx;
	font-weight: bold;
}

.gain {
	font-size: 24rpx;
	font-weight: normal;
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

.workout-log, .card {
	padding: 30rpx;
	margin-bottom: 40rpx;
}

.workout-table {
	width: 100%;
	overflow-x: auto;
	margin-top: 30rpx;
}

.table-header {
	display: flex;
	background-color: #f8fafc;
	border-radius: 8rpx 8rpx 0 0;
}

.th {
	padding: 20rpx 15rpx;
	font-size: 24rpx;
	font-weight: 600;
	color: var(--text-color-light);
	text-align: left;
}

.table-body {
	border: 2rpx solid #f1f5f9;
	border-top: none;
	border-radius: 0 0 8rpx 8rpx;
}

.table-row {
	display: flex;
	border-bottom: 2rpx solid #f1f5f9;
	
	&:last-child {
		border-bottom: none;
	}
}

.td {
	padding: 25rpx 15rpx;
	font-size: 28rpx;
	color: var(--text-color);
}

.th-date, .td-date {
	flex: 2;
}

.th-type, .td-type {
	flex: 3;
}

.th-duration, .td-duration {
	flex: 2;
}

.th-status, .td-status {
	flex: 2;
	display: flex;
	align-items: center;
}

.th-action, .td-action {
	flex: 1;
	display: flex;
	align-items: center;
}

.form-group {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	font-weight: 500;
	margin-bottom: 15rpx;
	display: block;
}

.input-group {
	display: flex;
}

.weight-input {
	flex: 1;
	margin-bottom: 0;
	margin-right: 20rpx;
}

.input-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.exercise-picker {
	flex: 2;
}

.picker-value {
	height: 88rpx;
	line-height: 88rpx;
	padding: 0 24rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	background-color: #fff;
}

.personal-records {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}

.pr-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16rpx 0;
	border-bottom: 2rpx solid #f1f5f9;
}

.pr-item:last-child {
	border-bottom: none;
}

.pr-exercise {
	font-size: 28rpx;
	font-weight: 500;
	flex: 2;
}

.pr-weight {
	font-size: 30rpx;
	font-weight: bold;
	color: var(--primary-color);
	flex: 1;
	text-align: center;
}

.pr-date {
	font-size: 24rpx;
	color: var(--text-color-light);
	flex: 1.5;
	text-align: right;
}

.stat-info-row {
	display: flex;
	justify-content: space-between;
	margin-top: 20rpx;
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
	
	.input-row {
		flex-direction: column;
		gap: 10rpx;
		
		.exercise-picker,
		.weight-input,
		.btn-sm {
			width: 100%;
		}
	}
	
	.content-container {
		width: 90%;
		padding: 20rpx;
	}
}
</style> 