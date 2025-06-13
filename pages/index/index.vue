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
		
		<view class="container">
			<!-- 欢迎区域 -->
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
					<view class="day-plan-card" v-for="(day, index) in weeklyPlans" :key="index" @tap="handleDayCardClick(day)">
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
								<text class="add-plan-hint">+添加计划</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 日程计划弹窗 -->
		<view class="modal" v-if="showDayPlanModal" @tap.self="closeDayPlanModal" style="z-index: 500;">
			<view class="modal-content day-plan-modal">
				<view class="modal-header">
					<text class="modal-title">{{selectedDay && selectedDay.dayName}} 训练计划</text>
					<view class="close-btn" @tap="closeDayPlanModal">×</view>
				</view>
				
				<view class="modal-body">
					<view class="form-group">
						<checkbox-group @change="toggleRestDay">
							<label class="rest-day-option">
								<checkbox value="restDay" :checked="dayPlanData.restDay" />
								<text class="rest-day-label">设为休息日</text>
							</label>
						</checkbox-group>
					</view>
					
					<view v-if="!dayPlanData.restDay">
						<!-- 训练动作列表 -->
						<view class="form-group">
							<view class="section-header">
								<text class="form-label">训练动作</text>
								<button class="btn btn-primary btn-small" @tap="addExercise">添加动作</button>
							</view>
							
							<view class="exercise-list" v-if="dayPlanData.exercises.length > 0">
								<view class="exercise-item" v-for="(exercise, index) in dayPlanData.exercises" :key="index">
									<view class="exercise-card">
										<view class="exercise-header">
											<text class="exercise-name">{{exercise.name}}</text>
											<view class="exercise-actions">
												<button class="action-btn edit-btn" @tap="editExercise(index)">编辑</button>
												<button class="action-btn delete-btn" @tap="removeExercise(index)">删除</button>
											</view>
										</view>
										<view class="exercise-info">
											<text class="info-text">{{exercise.sets}}组 × {{exercise.reps}}次</text>
											<text class="info-text" v-if="exercise.weight">{{exercise.weight}}kg</text>
											<text class="info-text" v-if="exercise.rest">休息{{exercise.rest}}s</text>
										</view>
										<view class="exercise-notes" v-if="exercise.notes">
											<text class="notes-text">{{exercise.notes}}</text>
										</view>
									</view>
								</view>
							</view>
							
							<view class="empty-state" v-else>
								<text class="empty-text">还没有添加训练动作</text>
							</view>
						</view>
						
						<!-- 训练备注 -->
						<view class="form-group">
							<text class="form-label">训练备注</text>
							<textarea v-model="dayPlanData.notes" placeholder="添加训练备注..." class="notes-input"></textarea>
						</view>
					</view>
				</view>
				
				<view class="modal-footer">
					<button class="btn btn-outline" @tap="closeDayPlanModal">取消</button>
					<button class="btn btn-primary" @tap="saveDayPlan">保存</button>
				</view>
			</view>
		</view>
		
		<!-- 动作选择/编辑弹窗 -->
		<view class="modal" v-if="showExerciseSelector" @tap.self="closeExerciseSelector" style="z-index: 1000;">
			<view class="modal-content exercise-selector-modal">
				<view class="modal-header">
					<text class="modal-title">{{selectedExercise !== null ? '编辑动作' : '添加动作'}}</text>
					<view class="close-btn" @tap="closeExerciseSelector">×</view>
				</view>
				
				<view class="modal-body">
					<!-- 动作选择 -->
					<view class="form-group">
						<text class="form-label">选择动作</text>
						<view class="exercise-categories">
							<view class="category" v-for="(exercises, category) in exerciseLibrary" :key="category">
								<text class="category-name">{{category}}</text>
								<view class="exercise-options">
									<view class="exercise-option" 
										v-for="exercise in exercises" 
										:key="exercise"
										:class="{'selected': exerciseDetails && exerciseDetails.name === exercise}"
										@tap="selectExerciseName(exercise)">
										{{exercise}}
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 动作详情设置 -->
					<view v-if="exerciseDetails && exerciseDetails.name">
						<view class="form-group">
							<text class="form-label">组数</text>
							<input :value="exerciseDetails.sets" @input="handleSetsInput" class="form-input" placeholder="3" />
						</view>
						
						<view class="form-group">
							<text class="form-label">次数/时间 (次/秒)</text>
							<input :value="exerciseDetails.reps" @input="handleRepsInput" placeholder="12" class="form-input" type="number" />
						</view>
						
						<view class="form-group">
							<text class="form-label">重量 (kg)</text>
							<input :value="exerciseDetails.weight" @input="handleWeightInput" placeholder="可选" class="form-input" type="number" />
						</view>
						
						<view class="form-group">
							<text class="form-label">组间休息 (s)</text>
							<input :value="exerciseDetails.rest" @input="handleRestInput" placeholder="90" class="form-input" type="number" />
						</view>
						
						<view class="form-group">
							<text class="form-label">备注</text>
							<textarea v-model="exerciseDetails.notes" placeholder="动作要点或注意事项" class="form-textarea"></textarea>
						</view>
					</view>
				</view>
				
				<view class="modal-footer">
					<button class="btn btn-outline" @tap="closeExerciseSelector">取消</button>
					<button class="btn btn-primary" @tap="saveExercise" :disabled="!exerciseDetails || !exerciseDetails.name">
						{{selectedExercise !== null ? '更新' : '添加'}}
					</button>
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

			weeklyPlans: [],
			showDayPlanModal: false,
			selectedDay: null,
			dayPlanData: {
				restDay: false,
				exercises: [],
				notes: ''
			},
			showExerciseSelector: false,
			selectedExercise: null,
			exerciseDetails: null,
			exerciseLibrary: {
				胸肌: ['杠铃卧推', '哑铃卧推', '上斜卧推', '下斜卧推', '哑铃飞鸟', '俯卧撑', '双杠臂屈伸'],
				背部: ['引体向上', '杠铃划船', '哑铃划船', '高位下拉', '坐姿划船', 'T杠划船', '面拉'],
				腿部: ['杠铃深蹲', '前蹲', '哑铃深蹲', '腿举', '保加利亚深蹲', '罗马尼亚硬拉', '硬拉'],
				肩部: ['杠铃肩推', '哑铃肩推', '侧平举', '前平举', '阿诺德推举', '倒立撑'],
				手臂: ['杠铃弯举', '哑铃弯举', '锤式弯举', '窄距卧推', '三头肌下压', '臂屈伸'],
				核心: ['平板支撑', '卷腹', '俄罗斯转体', '登山者', '死虫', '鸟狗式']
			}
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
			
			// 计算本月训练次数
			const now = new Date();
			const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
			const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
			
			let thisMonthCount = 0;
			let lastMonthCount = 0;
			
			workoutHistory.forEach(workout => {
				const workoutDate = new Date(workout.date);
				
				if (workoutDate >= thisMonthStart) {
					thisMonthCount++;
				} else if (workoutDate >= lastMonthStart && workoutDate < thisMonthStart) {
					lastMonthCount++;
				}
			});
			
			this.trainingInfo.thisWeek = thisMonthCount + ' 次训练';
			
			// 计算进度变化
			if (lastMonthCount === 0 && thisMonthCount > 0) {
				this.trainingInfo.weeklyProgress = '本月开始健身，加油！';
			} else if (lastMonthCount === 0) {
				this.trainingInfo.weeklyProgress = '本月尚未开始训练';
			} else {
				const change = thisMonthCount - lastMonthCount;
				if (change > 0) {
					this.trainingInfo.weeklyProgress = `比上月多 ${change} 次`;
				} else if (change < 0) {
					this.trainingInfo.weeklyProgress = `比上月少 ${Math.abs(change)} 次`;
				} else {
					this.trainingInfo.weeklyProgress = '与上月持平';
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
			
			// 获取用户的单天计划
			const userInfo = uni.getStorageSync('userInfo');
			const dailyPlansKey = userInfo && userInfo.id ? `dailyPlans_${userInfo.id}` : 'dailyPlans';
			const dailyPlans = uni.getStorageSync(dailyPlansKey) || [];
			
			for (let i = 0; i < 7; i++) {
				const date = new Date(mondayDate.getTime() + i * 24 * 60 * 60 * 1000);
				const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // 转换为周一=0, 周日=6的索引
				const dayName = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][dayIndex];
				const dateStr = this.formatDate(date);
				const fullDateStr = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
				const isToday = this.isSameDay(date, now);
				
				// 查找当日的单天计划
				const dayPlan = dailyPlans.find(plan => plan.date === fullDateStr || plan.dayName === dayName);
				
				const dayData = {
					dayName: dayName,
					date: dateStr,
					fullDate: fullDateStr,
					isToday: isToday,
					hasPlans: dayPlan !== null,
					planTitle: dayPlan ? (dayPlan.restDay ? '休息日' : `${dayPlan.exercises.length}个动作`) : '',
					exerciseCount: dayPlan ? dayPlan.exercises.length : 0,
					status: dayPlan ? (dayPlan.restDay ? '休息' : '训练') : '',
					statusClass: dayPlan ? (dayPlan.restDay ? 'rest' : 'pending') : ''
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
		},
		addDayPlan(day) {
			this.selectedDay = day;
			
			// 如果已有计划，加载现有数据；否则创建新的
			if (day.hasPlans) {
				// 从存储中加载已有计划
				const userInfo = uni.getStorageSync('userInfo');
				const dailyPlansKey = userInfo && userInfo.id ? `dailyPlans_${userInfo.id}` : 'dailyPlans';
				const dailyPlans = uni.getStorageSync(dailyPlansKey) || [];
				
				const existingPlan = dailyPlans.find(plan => plan.date === day.fullDate || plan.dayName === day.dayName);
				
				if (existingPlan) {
					this.dayPlanData = {
						restDay: existingPlan.restDay || false,
						exercises: [...(existingPlan.exercises || [])],
						notes: existingPlan.notes || ''
					};
				} else {
					// 如果找不到具体计划，创建新的
					this.dayPlanData = {
						restDay: day.status === '休息',
						exercises: [],
						notes: ''
					};
				}
			} else {
				// 创建新计划
				this.dayPlanData = {
					restDay: false,
					exercises: [],
					notes: ''
				};
			}
			
			this.showDayPlanModal = true;
		},
		closeDayPlanModal() {
			this.showDayPlanModal = false;
			this.selectedDay = null;
		},
		toggleRestDay(e) {
			this.dayPlanData.restDay = e.detail.value.length > 0;
		},
		saveDayPlan() {
			// 构建计划数据
			const planData = {
				date: this.selectedDay.fullDate,
				dayName: this.selectedDay.dayName,
				restDay: this.dayPlanData.restDay,
				exercises: [...this.dayPlanData.exercises],
				notes: this.dayPlanData.notes
			};
			
			// 获取用户存储键
			const userInfo = uni.getStorageSync('userInfo');
			const dailyPlansKey = userInfo && userInfo.id ? `dailyPlans_${userInfo.id}` : 'dailyPlans';
			
			// 保存到本地存储
			let dailyPlans = uni.getStorageSync(dailyPlansKey) || [];
			
			// 删除同一天的旧计划
			dailyPlans = dailyPlans.filter(plan => plan.date !== planData.date);
			
			// 添加新计划
			dailyPlans.push(planData);
			uni.setStorageSync(dailyPlansKey, dailyPlans);
			
			// 重新加载本周计划显示
			this.loadWeeklyPlans();
			
			// 关闭弹窗
			this.closeDayPlanModal();
			
			uni.showToast({
				title: '计划保存成功',
				icon: 'success'
			});
		},
		addExercise() {
			this.selectedExercise = null;
			this.exerciseDetails = {
				name: '',
				sets: 3,
				reps: 12,
				weight: '',
				rest: 90,
				notes: ''
			};
			this.showExerciseSelector = true;
		},
		editExercise(index) {
			this.selectedExercise = index;
			this.exerciseDetails = { ...this.dayPlanData.exercises[index] };
			this.showExerciseSelector = true;
		},
		selectExerciseName(name) {
			if (!this.exerciseDetails) {
				this.exerciseDetails = {
					name: '',
					sets: 3,
					reps: 12,
					weight: '',
					rest: 90,
					notes: ''
				};
			}
			this.exerciseDetails.name = name;
		},
		handleSetsInput(e) {
			const value = parseInt(e.detail.value) || 1;
			this.exerciseDetails.sets = Math.max(1, value);
		},
		handleRepsInput(e) {
			const value = parseInt(e.detail.value) || 1;
			this.exerciseDetails.reps = Math.max(1, value);
		},
		handleWeightInput(e) {
			const value = parseFloat(e.detail.value);
			this.exerciseDetails.weight = isNaN(value) ? '' : Math.max(0, value);
		},
		handleRestInput(e) {
			const value = parseInt(e.detail.value) || 30;
			this.exerciseDetails.rest = Math.max(30, value);
		},
		saveExercise() {
			if (!this.exerciseDetails.name) {
				uni.showToast({
					title: '请选择动作',
					icon: 'none'
				});
				return;
			}
			
			const exercise = { ...this.exerciseDetails };
			
			if (this.selectedExercise !== null) {
				// 编辑模式
				this.dayPlanData.exercises[this.selectedExercise] = exercise;
			} else {
				// 添加模式
				this.dayPlanData.exercises.push(exercise);
			}
			
			this.closeExerciseSelector();
			
			uni.showToast({
				title: this.selectedExercise !== null ? '更新成功' : '添加成功',
				icon: 'success'
			});
		},
		closeExerciseSelector() {
			this.showExerciseSelector = false;
			this.selectedExercise = null;
		},
		removeExercise(index) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这个动作吗？',
				success: (res) => {
					if (res.confirm) {
						this.dayPlanData.exercises.splice(index, 1);
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
					}
				}
			});
		},
		handleDayCardClick(day) {
			// 如果已有计划，可以查看或编辑；如果没有计划，则添加计划
			if (day.hasPlans) {
				// 可以在这里添加查看已有计划的逻辑
				// 暂时直接跳转到添加/编辑计划
				this.addDayPlan(day);
			} else {
				// 没有计划，添加新计划
				this.addDayPlan(day);
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
	font-size: 24rpx;
	margin-bottom: 4rpx;
}

.sync-text {
	font-size: 20rpx;
	color: #3b82f6;
	font-weight: 500;
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
	background-color: #ffffff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	text-align: center;
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
	color: #333;
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
	cursor: pointer;
}

.day-plan-card:hover {
	transform: translateY(-4rpx);
	box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.15);
	border-color: #3b82f6;
}

.day-plan-card:active {
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
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
	color: #3b82f6;
	font-size: 24rpx;
	cursor: pointer;
}

/* 弹窗样式 */
.modal {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

/* 确保uni.showModal显示在最上层 */
uni-modal, .uni-modal {
	z-index: 99999 !important;
}

.modal-content {
	width: 90%;
	max-width: 800rpx;
	max-height: 90vh;
	background-color: #fff;
	border-radius: 12rpx;
	overflow: hidden;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
	display: flex;
	flex-direction: column;
}

.modal-header {
	padding: 30rpx;
	border-bottom: 2rpx solid #e5e7eb;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-shrink: 0;
	background-color: #fff;
}

.modal-title {
	font-size: 36rpx;
	font-weight: bold;
}

.close-btn {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #ff6b6b, #ee5a52);
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 4rpx 12rpx rgba(238, 90, 82, 0.3);
}

.modal-body {
	padding: 30rpx;
	overflow-y: auto;
	flex: 1;
	background-color: #fff;
}

.modal-footer {
	padding: 20rpx 30rpx;
	border-top: 2rpx solid #e5e7eb;
	display: flex;
	justify-content: flex-end;
	flex-shrink: 0;
	background-color: #fff;
	gap: 20rpx;
}

.btn {
	height: 88rpx;
	line-height: 86rpx;
	border-radius: 8rpx;
	font-size: 32rpx;
	text-align: center;
	border: none;
	padding: 0 30rpx;
	cursor: pointer;
	transition: all 0.3s ease;
}

.btn-primary {
	background-color: #3b82f6;
	color: #ffffff;
}

.btn-outline {
	background-color: transparent;
	color: #666;
	border: 1rpx solid #e5e5e5;
}

.btn-small {
	height: 60rpx;
	line-height: 58rpx;
	font-size: 24rpx;
	padding: 0 20rpx;
}

.rest-day-option {
	margin-bottom: 30rpx;
}

.checkbox-label {
	display: flex;
	align-items: center;
	gap: 10rpx;
	font-size: 28rpx;
}

.exercises-section {
	margin-bottom: 30rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.exercise-list {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

.exercise-card {
	background-color: #ffffff;
	border: 1rpx solid #e5e7eb;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.exercise-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.exercise-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.exercise-actions {
	display: flex;
	gap: 8rpx;
}

.action-btn {
	padding: 6rpx 12rpx;
	border-radius: 6rpx;
	font-size: 22rpx;
	border: none;
	cursor: pointer;
}

.edit-btn {
	background-color: #f3f4f6;
	color: #374151;
}

.delete-btn {
	background-color: #fef2f2;
	color: #dc2626;
}

.exercise-info {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 8rpx;
}

.info-text {
	font-size: 24rpx;
	color: #6b7280;
	background-color: #f9fafb;
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
}

.exercise-notes {
	background-color: #f8fafc;
	padding: 8rpx 12rpx;
	border-radius: 6rpx;
	border-left: 3rpx solid #3b82f6;
}

.notes-text {
	font-size: 22rpx;
	color: #64748b;
	line-height: 1.4;
}

.form-group {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 15rpx;
	display: block;
}

.form-input {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	color: #333;
	background-color: #fff;
	border: 2rpx solid #e1e8ed;
	border-radius: 12rpx;
	box-sizing: border-box;
	transition: all 0.3s ease;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.form-input:focus {
	border-color: #3b82f6;
	box-shadow: 0 0 0 6rpx rgba(59, 130, 246, 0.1);
	outline: none;
	background-color: #fcfcfd;
}

.form-input::placeholder {
	color: #9ca3af;
	font-size: 26rpx;
}

.form-textarea {
	width: 100%;
	min-height: 160rpx;
	padding: 20rpx 24rpx;
	font-size: 28rpx;
	color: #333;
	background-color: #fff;
	border: 2rpx solid #e1e8ed;
	border-radius: 12rpx;
	box-sizing: border-box;
	resize: vertical;
	transition: all 0.3s ease;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	line-height: 1.5;
}

.form-textarea:focus {
	border-color: #3b82f6;
	box-shadow: 0 0 0 6rpx rgba(59, 130, 246, 0.1);
	outline: none;
	background-color: #fcfcfd;
}

.form-textarea::placeholder {
	color: #9ca3af;
	font-size: 26rpx;
}

.exercise-categories {
	margin-top: 20rpx;
}

.category {
	margin-bottom: 30rpx;
}

.category-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #374151;
	margin-bottom: 15rpx;
	display: block;
	padding: 8rpx 16rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	background: -webkit-linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	border-radius: 20rpx;
	text-align: center;
}

.exercise-options {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 15rpx;
}

.exercise-option {
	padding: 12rpx 20rpx;
	background-color: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 24rpx;
	font-size: 26rpx;
	color: #475569;
	transition: all 0.3s ease;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 60rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.exercise-option:hover {
	background-color: #e2e8f0;
	border-color: #cbd5e1;
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.exercise-option.selected {
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	border-color: #1d4ed8;
	color: white;
	font-weight: 600;
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
}

.exercise-option:active {
	transform: translateY(0);
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.exercise-card {
	background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
	border: 2rpx solid #e2e8f0;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
}

.exercise-card:hover {
	transform: translateY(-2rpx);
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.12);
	border-color: #3b82f6;
}

.exercise-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.exercise-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.exercise-actions {
	display: flex;
	gap: 8rpx;
}

.action-btn {
	padding: 6rpx 12rpx;
	border-radius: 6rpx;
	font-size: 22rpx;
	border: none;
	cursor: pointer;
}

.edit-btn {
	background-color: #f3f4f6;
	color: #374151;
}

.delete-btn {
	background-color: #fef2f2;
	color: #dc2626;
}

.exercise-info {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 8rpx;
}

.info-text {
	font-size: 24rpx;
	color: #6b7280;
	background-color: #f9fafb;
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
}

.exercise-notes {
	background-color: #f8fafc;
	padding: 8rpx 12rpx;
	border-radius: 6rpx;
	border-left: 3rpx solid #3b82f6;
}

.notes-text {
	font-size: 22rpx;
	color: #64748b;
	line-height: 1.4;
}

.empty-state {
	text-align: center;
	padding: 40rpx 20rpx;
	color: #9ca3af;
}

.empty-text {
	font-size: 26rpx;
	color: #9ca3af;
}

.notes-input {
	width: 100%;
	min-height: 120rpx;
	padding: 16rpx 20rpx;
	font-size: 26rpx;
	color: #333;
	background-color: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 12rpx;
	box-sizing: border-box;
	resize: vertical;
	transition: all 0.3s ease;
	line-height: 1.5;
}

.notes-input:focus {
	border-color: #3b82f6;
	box-shadow: 0 0 0 4rpx rgba(59, 130, 246, 0.1);
	outline: none;
	background-color: white;
}

.notes-input::placeholder {
	color: #9ca3af;
	font-size: 24rpx;
}

.rest-day-option {
	display: flex;
	align-items: center;
	padding: 15rpx 0;
}

.rest-day-label {
	margin-left: 12rpx;
	font-size: 28rpx;
	color: #333;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.day-plan-modal {
	width: 90%;
	max-width: 800rpx;
	max-height: 80vh;
	overflow-y: auto;
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