<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item" @tap="navigateTo('index')">首页</view>
				<view class="nav-item active">记录</view>
				<view class="nav-item" @tap="navigateTo('progress')">进度追踪</view>
				<view class="nav-item" @tap="navigateTo('plans')">健身计划</view>
				<view class="nav-item" @tap="navigateTo('workouts')">训练数据库</view>
			</view>
			<view class="nav-actions">
				<button class="btn-sm btn-primary" @tap="addNewRecord">新增记录</button>
			</view>
		</view>
		
		<view class="content-container">
			<!-- 顶部筛选栏 -->
			<view class="top-filter">
				<picker :value="trainingTypeIndex" :range="trainingTypes" @change="onTrainingTypeChange">
					<view class="training-type-picker">
						<text class="picker-text">{{trainingTypes[trainingTypeIndex]}}</text>
						<text class="picker-arrow">▼</text>
					</view>
				</picker>
				<view class="stats-btn" @tap="showStatsModal">
					<text class="stats-text">统计</text>
				</view>
				<view class="test-data-btn" @tap="addTestData">
					<text class="test-data-text">测试数据</text>
				</view>
			</view>
			
			<!-- 月份选择 -->
			<view class="month-selector">
				<view class="month-picker">
					<view class="month-info" @tap="showYearMonthPicker">
						<text class="month-text">{{formatMonth(selectedMonth)}}</text>
						<view class="expand-arrow" @tap.stop="toggleExpand">
							<text class="arrow-icon" :class="{'expanded': isExpanded}">▼</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 月度统计卡片 -->
			<view class="month-stats-card">
				<view class="month-info">
					<text class="month-label">{{getMonthLabel(selectedMonth)}}</text>
					<view class="month-stats">
						<text class="stat-item">{{monthStats.workouts}} 次训练</text>
						<text class="stat-item">{{monthStats.duration}} 小时</text>
					</view>
				</view>
			</view>
			
			<!-- 训练记录列表 -->
			<view class="workout-list" v-if="isExpanded && filteredWorkouts.length > 0">
				<view class="workout-item" v-for="(workout, index) in filteredWorkouts" :key="workout.id" @tap="viewWorkoutDetail(workout)">
					<view class="workout-content">
						<view class="workout-main-info">
							<text class="workout-name">{{workout.name}}</text>
							<text class="workout-duration">{{workout.duration}}</text>
						</view>
						
						<view class="workout-sub-info">
							<text class="workout-time">{{formatWorkoutTime(workout)}}</text>
							<text class="workout-exercises">{{workout.exercises ? workout.exercises.length : 0}} 个动作</text>
						</view>
						
						<view class="workout-preview" v-if="workout.exercises && workout.exercises.length > 0">
							<text class="preview-text">{{getWorkoutPreview(workout)}}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view class="empty-state" v-if="isExpanded && filteredWorkouts.length === 0">
				<view class="empty-icon">📋</view>
				<text class="empty-text">{{getMonthLabel(selectedMonth)}}暂无训练记录</text>
				<text class="empty-desc">您可以点击上方月份切换查看其他月份，或添加新的训练记录</text>
				<button class="btn btn-primary empty-btn" @tap="addNewRecord">添加训练记录</button>
			</view>
		</view>
		
		<!-- 年月选择弹窗 -->
		<view class="year-month-modal" v-if="showYearMonthModal" @tap.self="closeYearMonthModal">
			<view class="year-month-content">
				<view class="year-month-header">
					<text class="current-date">{{formatMonth(selectedMonth)}}</text>
					<view class="close-btn" @tap="closeYearMonthModal">×</view>
				</view>
				
				<view class="year-tabs">
					<view 
						class="year-tab"
						:class="{'active': year === activeYear}"
						v-for="year in availableYears"
						:key="year"
						@tap="selectYear(year)"
					>
						{{year}}年
					</view>
				</view>
				
				<view class="month-grid">
					<view 
						class="month-item"
						:class="{'selected': isSelectedMonth(activeYear, month), 'has-records': hasRecordsInMonth(activeYear, month), 'disabled': !canSelectMonth(activeYear, month)}"
						v-for="month in getAvailableMonths(activeYear)"
						:key="month"
						@tap="selectMonth(activeYear, month)"
					>
						{{month}}月
					</view>
				</view>
			</view>
		</view>
		
		<!-- 训练详情弹窗 -->
		<view class="modal" v-if="showDetailModal" @tap.self="closeDetailModal">
			<view class="modal-content detail-modal">
				<view class="modal-header">
					<text class="modal-title">训练详情</text>
					<view class="modal-close" @tap="closeDetailModal">×</view>
				</view>
				
				<view class="modal-body" v-if="selectedWorkout">
					<view class="detail-info">
						<view class="detail-row">
							<text class="detail-label">训练名称:</text>
							<text class="detail-value">{{selectedWorkout.name}}</text>
						</view>
						<view class="detail-row">
							<text class="detail-label">训练类型:</text>
							<text class="detail-value">{{selectedWorkout.type}}</text>
						</view>
						<view class="detail-row">
							<text class="detail-label">训练日期:</text>
							<text class="detail-value">{{selectedWorkout.date}}</text>
						</view>
						<view class="detail-row">
							<text class="detail-label">开始时间:</text>
							<text class="detail-value">{{selectedWorkout.startTime}}</text>
						</view>
						<view class="detail-row">
							<text class="detail-label">训练时长:</text>
							<text class="detail-value">{{selectedWorkout.duration}}</text>
						</view>
					</view>
					
					<view class="exercises-detail" v-if="selectedWorkout.exercises && selectedWorkout.exercises.length > 0">
						<text class="detail-section-title">训练动作</text>
						
						<view class="exercise-detail-item" v-for="(exercise, index) in selectedWorkout.exercises" :key="index">
							<text class="exercise-detail-name">{{index + 1}}. {{exercise.name}}</text>
							
							<view class="sets-detail" v-if="exercise.sets && exercise.sets.length > 0">
								<view class="set-detail" v-for="(set, setIndex) in exercise.sets" :key="setIndex">
									<text class="set-detail-text">第{{setIndex + 1}}组: {{set.weight}}kg × {{set.reps}}次</text>
									<text class="set-rest" v-if="set.rest">休息{{set.rest}}秒</text>
								</view>
							</view>
							
							<view class="exercise-notes" v-if="exercise.notes">
								<text class="notes-label">备注:</text>
								<text class="notes-text">{{exercise.notes}}</text>
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
			workoutHistory: [],
			trainingTypeIndex: 0,
			trainingTypes: ['所有训练', '力量训练', '有氧训练', 'HIIT', '拉伸恢复', '功能性训练'],
			selectedMonth: '',
			isExpanded: true, // 默认当月展开
			showDetailModal: false,
			showYearMonthModal: false,
			selectedWorkout: null,
			activeYear: new Date().getFullYear(),
			
			// 月度统计数据
			monthStats: {
				workouts: 0,
				duration: '0.0'
			}
		}
	},
		computed: {
		filteredWorkouts() {
			let filtered = [...this.workoutHistory];
			
			// 按选择的月份筛选
			if (this.selectedMonth) {
				const [year, month] = this.selectedMonth.split('-');
				const targetYear = parseInt(year);
				const targetMonth = parseInt(month) - 1; // JavaScript月份从0开始
				
				filtered = filtered.filter(workout => {
					const workoutDate = new Date(workout.date);
					return workoutDate.getFullYear() === targetYear && workoutDate.getMonth() === targetMonth;
				});
			}
			
			// 按训练类型筛选
			const selectedType = this.trainingTypes[this.trainingTypeIndex];
			if (selectedType !== '所有训练') {
				filtered = filtered.filter(workout => workout.type === selectedType);
			}
			
		// 按日期倒序排列（最新的在前面）
		return filtered.sort((a, b) => {
			const dateA = new Date(a.date + ' ' + (a.startTime || '00:00'));
			const dateB = new Date(b.date + ' ' + (b.startTime || '00:00'));
			return dateB - dateA;
		});
		},
		
		availableYears() {
			const currentYear = new Date().getFullYear();
			const years = [];
			
			// 获取训练记录中的所有年份
			this.workoutHistory.forEach(workout => {
				const year = new Date(workout.date).getFullYear();
				if (year <= currentYear && !years.includes(year)) {
					years.push(year);
				}
			});
			
			// 确保当前年份在列表中
			if (!years.includes(currentYear)) {
				years.push(currentYear);
			}
			
			return years.sort((a, b) => b - a); // 按年份倒序
		}
	},
	onShow() {
		this.initializeData();
	},
	methods: {
		navigateTo(page) {
			uni.reLaunch({
				url: `/pages/${page}/${page}`
			});
		},
		
		initializeData() {
			// 设置默认为当前月份
			const now = new Date();
			this.selectedMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
			this.activeYear = now.getFullYear();
			
			this.loadWorkoutHistory();
			
			// 如果当前月份没有数据，自动选择最近有数据的月份
			if (this.workoutHistory.length > 0) {
				const currentMonthData = this.getMonthWorkouts(this.selectedMonth);
				if (currentMonthData.length === 0) {
					this.selectedMonth = this.getLatestMonthWithData();
					const [year] = this.selectedMonth.split('-');
					this.activeYear = parseInt(year);
				}
			}
			
			this.calculateMonthStats();
			// 总是展开显示，不管是否是当前月份
			this.isExpanded = true;
		},
		
		loadWorkoutHistory() {
			let history = uni.getStorageSync('workoutHistory') || [];
			
			// 添加测试数据（如果还没有添加过）
			const hasTestData = history.some(workout => workout.id && String(workout.id).startsWith('test_'));
			if (!hasTestData) {
				const testData = this.generateTestData();
				history = [...history, ...testData];
				uni.setStorageSync('workoutHistory', history);
			}
			
			this.workoutHistory = history;
		},
		
		generateTestData() {
			const testData = [
				// 2025年数据
				{
					id: 'test_1',
					name: '胸肌训练',
					type: '力量训练',
					date: '2025-06-15',
					startTime: '19:30',
					duration: '65分钟',
					status: '已完成',
					exercises: [
						{
							name: '杠铃卧推',
							sets: [
								{ weight: '80', reps: '8', rest: '120' },
								{ weight: '85', reps: '6', rest: '120' },
								{ weight: '90', reps: '4', rest: '180' }
							]
						},
						{
							name: '哑铃飞鸟',
							sets: [
								{ weight: '20', reps: '12', rest: '90' },
								{ weight: '22', reps: '10', rest: '90' }
							]
						}
					]
				},
				{
					id: 'test_2',
					name: '腿部训练',
					type: '力量训练',
					date: '2025-06-12',
					startTime: '18:00',
					duration: '75分钟',
					status: '已完成',
					exercises: [
						{
							name: '深蹲',
							sets: [
								{ weight: '100', reps: '10', rest: '150' },
								{ weight: '110', reps: '8', rest: '150' },
								{ weight: '120', reps: '6', rest: '180' }
							]
						},
						{
							name: '腿举',
							sets: [
								{ weight: '200', reps: '15', rest: '120' },
								{ weight: '220', reps: '12', rest: '120' }
							]
						}
					]
				},
				{
					id: 'test_3',
					name: '有氧跑步',
					type: '有氧训练',
					date: '2025-05-28',
					startTime: '07:00',
					duration: '30分钟',
					status: '已完成',
					exercises: [
						{
							name: '跑步机',
							sets: [
								{ weight: '0', reps: '1', rest: '0' }
							],
							notes: '配速6.5，心率保持在150-160'
						}
					]
				},
				{
					id: 'test_4',
					name: 'HIIT训练',
					type: 'HIIT',
					date: '2025-05-25',
					startTime: '20:15',
					duration: '25分钟',
					status: '已完成',
					exercises: [
						{
							name: '波比跳',
							sets: [
								{ weight: '0', reps: '10', rest: '30' },
								{ weight: '0', reps: '10', rest: '30' },
								{ weight: '0', reps: '10', rest: '30' }
							]
						},
						{
							name: '俯卧撑',
							sets: [
								{ weight: '0', reps: '15', rest: '30' },
								{ weight: '0', reps: '15', rest: '30' }
							]
						}
					]
				},
				// 2024年数据
				{
					id: 'test_5',
					name: '背部训练',
					type: '力量训练',
					date: '2024-12-20',
					startTime: '19:00',
					duration: '70分钟',
					status: '已完成',
					exercises: [
						{
							name: '引体向上',
							sets: [
								{ weight: '10', reps: '8', rest: '120' },
								{ weight: '15', reps: '6', rest: '120' },
								{ weight: '20', reps: '4', rest: '150' }
							]
						},
						{
							name: '杠铃划船',
							sets: [
								{ weight: '70', reps: '10', rest: '120' },
								{ weight: '75', reps: '8', rest: '120' }
							]
						}
					]
				},
				{
					id: 'test_6',
					name: '肩部训练',
					type: '力量训练',
					date: '2024-11-15',
					startTime: '18:30',
					duration: '50分钟',
					status: '已完成',
					exercises: [
						{
							name: '杠铃肩推',
							sets: [
								{ weight: '50', reps: '10', rest: '120' },
								{ weight: '55', reps: '8', rest: '120' }
							]
						},
						{
							name: '侧平举',
							sets: [
								{ weight: '12', reps: '15', rest: '90' },
								{ weight: '15', reps: '12', rest: '90' }
							]
						}
					]
				},
				{
					id: 'test_7',
					name: '瑜伽拉伸',
					type: '拉伸恢复',
					date: '2024-10-08',
					startTime: '21:00',
					duration: '45分钟',
					status: '已完成',
					exercises: [
						{
							name: '下犬式',
							sets: [
								{ weight: '0', reps: '1', rest: '0' }
							],
							notes: '保持2分钟'
						},
						{
							name: '鸽子式',
							sets: [
								{ weight: '0', reps: '2', rest: '30' }
							],
							notes: '左右各1分钟'
						}
					]
				},
				// 2023年数据
				{
					id: 'test_8',
					name: '功能性训练',
					type: '功能性训练',
					date: '2023-09-12',
					startTime: '17:30',
					duration: '40分钟',
					status: '已完成',
					exercises: [
						{
							name: '土耳其起立',
							sets: [
								{ weight: '16', reps: '5', rest: '120' },
								{ weight: '16', reps: '5', rest: '120' }
							]
						},
						{
							name: '农夫行走',
							sets: [
								{ weight: '40', reps: '1', rest: '90' }
							],
							notes: '行走50米'
						}
					]
				}
			];
			
			return testData;
		},
		
		calculateMonthStats() {
			if (!this.selectedMonth) return;
			
			const [year, month] = this.selectedMonth.split('-');
			const targetYear = parseInt(year);
			const targetMonth = parseInt(month) - 1; // JavaScript月份从0开始
			
			// 筛选当月的训练
			const monthWorkouts = this.workoutHistory.filter(workout => {
				const workoutDate = new Date(workout.date);
				return workoutDate.getFullYear() === targetYear && workoutDate.getMonth() === targetMonth;
			});
			
			// 计算训练次数
			this.monthStats.workouts = monthWorkouts.length;
			
			// 计算总时长
			const totalMinutes = monthWorkouts.reduce((sum, workout) => {
				const duration = parseInt(workout.duration);
				return sum + (isNaN(duration) ? 0 : duration);
			}, 0);
			
			this.monthStats.duration = (totalMinutes / 60).toFixed(1);
		},
		
		onTrainingTypeChange(e) {
			this.trainingTypeIndex = e.detail.value;
		},
		
		toggleExpand() {
			this.isExpanded = !this.isExpanded;
		},
		
		checkIfCurrentMonth() {
			const now = new Date();
			const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
			this.isExpanded = this.selectedMonth === currentMonth;
		},
		
		showYearMonthPicker() {
			this.showYearMonthModal = true;
			// 设置当前选中月份对应的年份
			const [year] = this.selectedMonth.split('-');
			this.activeYear = parseInt(year);
		},
		
		closeYearMonthModal() {
			this.showYearMonthModal = false;
		},
		
		selectYear(year) {
			this.activeYear = year;
		},
		
		selectMonth(year, month) {
			// 只有当月份可以选择时才进行跳转
			if (!this.canSelectMonth(year, month)) {
				return;
			}
			
			const monthStr = String(month).padStart(2, '0');
			this.selectedMonth = year + '-' + monthStr;
			this.calculateMonthStats();
			// 总是保持展开状态，不管是否是当前月份
			this.isExpanded = true;
			this.closeYearMonthModal();
		},
		
		isSelectedMonth(year, month) {
			const monthStr = String(month).padStart(2, '0');
			const compareMonth = year + '-' + monthStr;
			return this.selectedMonth === compareMonth;
		},
		
		hasRecordsInMonth(year, month) {
			return this.workoutHistory.some(workout => {
				const workoutDate = new Date(workout.date);
				return workoutDate.getFullYear() === year && workoutDate.getMonth() === (month - 1);
			});
		},
		
		canSelectMonth(year, month) {
			// 只能选择有训练记录的月份
			return this.hasRecordsInMonth(year, month);
		},
		
		getAvailableMonths(year) {
			const currentYear = new Date().getFullYear();
			const currentMonth = new Date().getMonth() + 1;
			
			if (year < currentYear) {
				// 过去年份：显示所有月份
				return Array.from({length: 12}, (_, i) => i + 1);
			} else if (year === currentYear) {
				// 当前年份：只显示到当前月份
				return Array.from({length: currentMonth}, (_, i) => i + 1);
			} else {
				// 未来年份：不显示任何月份（这种情况不应该发生，因为availableYears已经过滤了）
				return [];
			}
		},
		
		formatMonth(monthStr) {
			if (!monthStr) return '';
			const date = new Date(monthStr);
			return date.getFullYear() + '年' + (date.getMonth() + 1) + '月';
		},
		
		getMonthLabel(monthStr) {
			if (!monthStr) return '';
			if (monthStr.includes('-')) {
				// 处理 "YYYY-MM" 格式
				const [year, month] = monthStr.split('-');
				return `${year}年${parseInt(month)}月`;
			} else {
				// 处理其他格式
				const date = new Date(monthStr);
				return (date.getMonth() + 1) + '月';
			}
		},
		
		formatWorkoutTime(workout) {
			const date = new Date(workout.date);
			const month = date.getMonth() + 1;
			const day = date.getDate();
			return `${month}月${day}日 ${workout.startTime}`;
		},
		
		getWorkoutTypeClass(type) {
			const typeMap = {
				'力量训练': 'strength',
				'有氧训练': 'cardio',
				'HIIT': 'hiit',
				'拉伸恢复': 'stretch',
				'功能性训练': 'functional'
			};
			return typeMap[type] || 'default';
		},
		
		getWorkoutPreview(workout) {
			if (!workout.exercises || workout.exercises.length === 0) {
				return '无动作记录';
			}
			
			const exerciseNames = workout.exercises.slice(0, 3).map(ex => ex.name);
			const preview = exerciseNames.join('、');
			
			if (workout.exercises.length > 3) {
				return preview + ' 等';
			}
			return preview;
		},
		
		viewWorkoutDetail(workout) {
			this.selectedWorkout = workout;
			this.showDetailModal = true;
		},
		
		closeDetailModal() {
			this.showDetailModal = false;
			this.selectedWorkout = null;
		},
		
		addNewRecord() {
			uni.navigateTo({
				url: '/pages/record/record'
			});
		},
		
		showStatsModal() {
			// 显示详细统计信息的弹窗
			uni.showModal({
				title: '训练统计',
				content: `总训练次数: ${this.workoutHistory.length}次\n本月训练: ${this.monthStats.workouts}次\n本月总时长: ${this.monthStats.duration}小时`,
				showCancel: false,
				confirmText: '知道了'
			});
		},
		
		addTestData() {
			uni.showModal({
				title: '添加测试数据',
				content: '这将添加一些不同年份和月份的测试训练记录，用于测试功能。是否继续？',
				showCancel: true,
				cancelText: '取消',
				confirmText: '添加',
				success: (res) => {
					if (res.confirm) {
						let history = uni.getStorageSync('workoutHistory') || [];
						const testData = this.generateTestData();
						
						// 移除已有的测试数据，避免重复
						history = history.filter(workout => !workout.id || !String(workout.id).startsWith('test_'));
						
						// 添加新的测试数据
						history = [...history, ...testData];
						
						uni.setStorageSync('workoutHistory', history);
						this.workoutHistory = history;
						
						// 自动切换到有数据的月份
						if (testData.length > 0) {
							const latestWorkout = testData[0];
							const workoutDate = new Date(latestWorkout.date);
							this.selectedMonth = workoutDate.getFullYear() + '-' + String(workoutDate.getMonth() + 1).padStart(2, '0');
							this.activeYear = workoutDate.getFullYear();
						}
						
						this.calculateMonthStats();
						this.isExpanded = true;
						
						uni.showToast({
							title: '测试数据已添加',
							icon: 'success'
						});
					}
				}
			});
		},
		
		getMonthWorkouts(monthStr) {
			const [year, month] = monthStr.split('-');
			const targetYear = parseInt(year);
			const targetMonth = parseInt(month) - 1;
			
			return this.workoutHistory.filter(workout => {
				const workoutDate = new Date(workout.date);
				return workoutDate.getFullYear() === targetYear && workoutDate.getMonth() === targetMonth;
			});
		},
		
		getLatestMonthWithData() {
			if (this.workoutHistory.length === 0) return this.selectedMonth;
			
			// 获取所有有数据的月份
			const monthsWithData = [];
			this.workoutHistory.forEach(workout => {
				const workoutDate = new Date(workout.date);
				const monthStr = workoutDate.getFullYear() + '-' + String(workoutDate.getMonth() + 1).padStart(2, '0');
				if (!monthsWithData.includes(monthStr)) {
					monthsWithData.push(monthStr);
				}
			});
			
			// 按时间倒序排列，返回最新的月份
			monthsWithData.sort((a, b) => {
				const dateA = new Date(a + '-01');
				const dateB = new Date(b + '-01');
				return dateB - dateA;
			});
			
			return monthsWithData[0] || this.selectedMonth;
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

.nav-actions {
	display: flex;
	align-items: center;
}

.btn-sm {
	height: 60rpx;
	line-height: 60rpx;
	font-size: 26rpx;
	padding: 0 20rpx;
	background-color: var(--primary-color);
	color: #fff;
	border-radius: 8rpx;
	border: none;
}

.content-container {
	width: 90%;
	margin: 0 auto;
	padding: 20rpx;
}

.top-filter {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx;
	margin-bottom: 20rpx;
}

.training-type-picker {
	display: flex;
	align-items: center;
}

.picker-text {
	font-size: 36rpx;
	font-weight: 500;
	color: var(--text-color);
	margin-right: 10rpx;
}

.picker-arrow {
	font-size: 24rpx;
	color: var(--text-color-light);
}

.stats-btn {
	padding: 16rpx 30rpx;
	background-color: transparent;
	border-radius: 20rpx;
}

.stats-text {
	font-size: 30rpx;
	color: var(--primary-color);
}

.test-data-btn {
	padding: 16rpx 30rpx;
	background-color: transparent;
	border-radius: 20rpx;
	margin-left: 20rpx;
}

.test-data-text {
	font-size: 30rpx;
	color: var(--text-color-light);
}

.month-selector {
	padding: 20rpx 40rpx;
	margin-bottom: 20rpx;
}

.month-picker {
	display: flex;
	align-items: center;
}

.month-info {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.month-text {
	font-size: 28rpx;
	color: var(--text-color-light);
}

.expand-arrow {
	padding: 5rpx;
}

.arrow-icon {
	font-size: 24rpx;
	color: var(--text-color-light);
	transition: transform 0.3s ease;
	
	&.expanded {
		transform: rotate(180deg);
	}
}

.month-stats-card {
	background-color: #f8fafc;
	border-radius: 16rpx;
	padding: 30rpx 40rpx;
	margin: 0 40rpx 30rpx 40rpx;
}

.month-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.month-label {
	font-size: 48rpx;
	font-weight: 500;
	color: var(--text-color);
}

.month-stats {
	text-align: right;
}

.stat-item {
	display: block;
	font-size: 28rpx;
	color: var(--text-color-light);
	margin-bottom: 8rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}

.workout-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.workout-item {
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin: 0 40rpx 20rpx 40rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s;
	
	&:active {
		transform: scale(0.98);
		background-color: #f8fafc;
	}
}

.workout-content {
	flex: 1;
	width: 100%;
}

.workout-main-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.workout-name {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
}

.workout-duration {
	font-size: 32rpx;
	font-weight: bold;
	color: var(--text-color);
}

.workout-sub-info {
	display: flex;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.workout-time,
.workout-exercises {
	font-size: 26rpx;
	color: var(--text-color-light);
}

.workout-preview {
	margin-top: 8rpx;
}

.preview-text {
	font-size: 24rpx;
	color: var(--text-color-light);
	background-color: #f8fafc;
	padding: 8rpx 12rpx;
	border-radius: 6rpx;
}

.empty-state {
	text-align: center;
	padding: 100rpx 40rpx;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
}

.empty-text {
	font-size: 32rpx;
	color: var(--text-color);
	margin-bottom: 15rpx;
	display: block;
}

.empty-desc {
	font-size: 26rpx;
	color: var(--text-color-light);
	margin-bottom: 40rpx;
	display: block;
}

.empty-btn {
	padding: 20rpx 40rpx;
	background-color: var(--primary-color);
	color: #fff;
	border-radius: 8rpx;
	border: none;
	font-size: 28rpx;
}

.btn {
	padding: 20rpx 40rpx;
	border-radius: 8rpx;
	border: none;
	font-size: 28rpx;
	
	&.btn-primary {
		background-color: var(--primary-color);
		color: #fff;
	}
}

// 弹窗样式
.modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.modal-content {
	background-color: #fff;
	border-radius: 16rpx;
	width: 90%;
	max-height: 80vh;
	overflow: hidden;
	
	&.detail-modal {
		max-width: 600rpx;
	}
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 2rpx solid #f1f5f9;
}

.modal-title {
	font-size: 36rpx;
	font-weight: 600;
}

.modal-close {
	font-size: 48rpx;
	color: var(--text-color-light);
	width: 60rpx;
	height: 60rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.modal-body {
	padding: 30rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.detail-info {
	margin-bottom: 30rpx;
}

.detail-row {
	display: flex;
	margin-bottom: 20rpx;
}

.detail-label {
	font-size: 28rpx;
	color: var(--text-color-light);
	width: 150rpx;
	flex-shrink: 0;
}

.detail-value {
	font-size: 28rpx;
	color: var(--text-color);
	flex: 1;
}

.detail-section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: var(--text-color);
	margin-bottom: 20rpx;
	display: block;
}

.exercise-detail-item {
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid #f1f5f9;
	
	&:last-child {
		border-bottom: none;
	}
}

.exercise-detail-name {
	font-size: 30rpx;
	font-weight: 500;
	color: var(--text-color);
	margin-bottom: 15rpx;
	display: block;
}

.sets-detail {
	margin-bottom: 15rpx;
}

.set-detail {
	display: flex;
	align-items: center;
	margin-bottom: 10rpx;
}

.set-detail-text {
	font-size: 26rpx;
	color: var(--text-color);
	margin-right: 20rpx;
}

.set-rest {
	font-size: 24rpx;
	color: var(--text-color-light);
}

.exercise-notes {
	background-color: #f8fafc;
	padding: 15rpx;
	border-radius: 8rpx;
}

.notes-label {
	font-size: 24rpx;
	color: var(--text-color-light);
	margin-right: 10rpx;
}

.notes-text {
	font-size: 26rpx;
	color: var(--text-color);
}

// 年月选择弹窗样式
.year-month-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.year-month-content {
	background-color: #fff;
	border-radius: 20rpx;
	width: 600rpx;
	max-height: 80vh;
	overflow: hidden;
	color: var(--text-color);
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}

.year-month-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1rpx solid #e5e7eb;
}

.current-date {
	font-size: 32rpx;
	font-weight: 500;
	color: var(--text-color);
}

.close-btn {
	font-size: 48rpx;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 50%;
	background-color: #f3f4f6;
	color: var(--text-color-light);
}

.year-tabs {
	display: flex;
	padding: 20rpx 40rpx;
	border-bottom: 1rpx solid #e5e7eb;
	overflow-x: auto;
}

.year-tab {
	padding: 16rpx 24rpx;
	margin-right: 20rpx;
	border-radius: 20rpx;
	font-size: 28rpx;
	white-space: nowrap;
	transition: all 0.3s ease;
	color: var(--text-color-light);
	
	&.active {
		background-color: var(--primary-color);
		color: #fff;
	}
}

.month-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20rpx;
	padding: 40rpx;
}

.month-item {
	padding: 30rpx 20rpx;
	text-align: center;
	border-radius: 16rpx;
	font-size: 28rpx;
	transition: all 0.3s ease;
	color: var(--text-color-light);
	background-color: #f9fafb;
	border: 1rpx solid #e5e7eb;
	cursor: pointer;
	
	&.has-records {
		background-color: #dbeafe;
		color: var(--primary-color);
		font-weight: 500;
		border: 2rpx solid #bfdbfe;
		cursor: pointer;
	}
	
	&.selected {
		background-color: var(--primary-color);
		color: #fff;
		font-weight: 600;
		border: 2rpx solid var(--primary-color);
	}
	
	&.disabled {
		background-color: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
		border: 1rpx solid #e5e7eb;
		
		&:hover {
			background-color: #f3f4f6;
			border-color: #e5e7eb;
		}
	}
	
	&:not(.selected):not(.disabled):hover {
		background-color: #f3f4f6;
		border-color: #d1d5db;
	}
}

@media screen and (max-width: 768px) {
	.content-container {
		width: 100%;
		padding: 0;
	}
	
	.top-filter {
		padding: 20rpx 30rpx;
	}
	
	.month-selector {
		padding: 15rpx 30rpx;
	}
	
	.month-stats-card {
		margin: 0 30rpx 20rpx 30rpx;
		padding: 25rpx 30rpx;
	}
	
	.month-label {
		font-size: 40rpx;
	}
	
	.workout-item {
		margin: 0 30rpx 15rpx 30rpx;
		padding: 25rpx;
	}
	
	.workout-main-info {
		flex-direction: column;
		align-items: flex-start;
		margin-bottom: 8rpx;
	}
	
	.workout-sub-info {
		flex-direction: column;
		gap: 5rpx;
	}
	
	.year-month-content {
		width: 90%;
		margin: 0 20rpx;
	}
	
	.month-grid {
		grid-template-columns: repeat(3, 1fr);
		padding: 30rpx;
	}
}
</style> 