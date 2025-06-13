<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item" @tap="navigateTo('index')">首页</view>
				<view class="nav-item" @tap="navigateTo('history')">记录</view>
				<view class="nav-item active">进度追踪</view>
				<view class="nav-item" @tap="navigateTo('plans')">健身计划</view>
				<view class="nav-item" @tap="navigateTo('workouts')">训练数据库</view>
			</view>			<view class="nav-actions">
				<!-- 导航动作占位符，保持布局平衡 -->
			</view>
		</view>
		
		<view class="content-container">
			<view class="stats-grid">
				<view class="card stat-card">
					<text class="stat-card-title">个人记录</text>
					<view class="personal-records" v-if="personalRecords.length > 0">
						<view class="pr-item" v-for="(record, index) in personalRecords" :key="index">
							<text class="pr-exercise">{{record.exercise}}</text>
							<text class="pr-weight">{{record.weight}}</text>
							<text class="pr-date">{{record.date}}</text>
						</view>
					</view>
					<view class="empty-records" v-else>
						<text class="empty-text">暂无个人记录</text>
						<text class="empty-desc">完成训练后会自动更新记录</text>
					</view>
				</view>
				
				<view class="card stat-card">
					<text class="stat-card-title">力量进步</text>
					<view class="strength-stats" v-if="strengthProgress.length > 0">
						<view class="strength-item" v-for="(progress, index) in strengthProgress" :key="index">
							<text class="strength-label">{{progress.exercise}} 1RM</text>
							<text class="strength-value">
								{{progress.current}} 
								<text :class="progress.change > 0 ? 'text-success gain' : progress.change < 0 ? 'text-error loss' : 'text-gray'" v-if="progress.change !== 0">
									{{progress.change > 0 ? '+' : ''}}{{progress.change}} kg
								</text>
							</text>
						</view>
					</view>
					<view class="empty-records" v-else>
						<text class="empty-text">暂无力量数据</text>
						<text class="empty-desc">记录训练数据后会显示进步情况</text>
					</view>
				</view>
				
				<view class="card stat-card">
					<text class="stat-card-title">训练频率</text>
					<view class="stat-card-info">
						<view class="stat-info-item">
							<text class="stat-info-label">本周训练</text>
							<text class="stat-info-value">{{trainingStats.thisWeek}} 次</text>
						</view>
						<view class="stat-info-item">
							<text class="stat-info-label">平均时长</text>
							<text class="stat-info-value">{{trainingStats.avgDuration}}</text>
						</view>
					</view>
					<view class="stat-info-row">
						<view class="stat-info-item">
							<text class="stat-info-label">本月训练</text>
							<text class="stat-info-value">{{trainingStats.thisMonth}} 次</text>
						</view>
						<view class="stat-info-item">
							<text class="stat-info-label">总训练次数</text>
							<text class="stat-info-value text-success">{{trainingStats.total}} 次</text>
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
import cloudDataService from '@/utils/cloudDataService.js';

export default {
	data() {
		return {
			weightInput: '',
			maxWeightInput: '',
			exerciseIndex: 0,
			exercises: ['深蹲', '卧推', '硬拉', '肩推', '引体向上', '杠铃划船', '高位下拉', '腿举', '侧平举', '杠铃弯举', '三头肌下压', '哑铃飞鸟', '平板支撑'],
			
			workoutLogs: [],
			personalRecords: [],
			strengthProgress: [],			trainingStats: {
				thisWeek: 0,
				thisMonth: 0,
				total: 0,
				avgDuration: '0 分钟'
			},
			
			// 同步状态
			syncStatus: {
				icon: '🔄',
				text: '点击同步',
				syncing: false
			},
			
			// 动作名称映射，用于统一不同写法的动作名
			exerciseMapping: {
				'杠铃卧推': '卧推',
				'哑铃卧推': '卧推',
				'上斜卧推': '卧推',
				'下斜卧推': '卧推',
				'平板卧推': '卧推',
				'卧推': '卧推',
				'哑铃飞鸟': '哑铃飞鸟',
				'俯卧撑': '俯卧撑',
				'双杠臂屈伸': '双杠臂屈伸',
				'引体向上': '引体向上',
				'杠铃划船': '杠铃划船',
				'哑铃划船': '杠铃划船',
				'高位下拉': '高位下拉',
				'坐姿划船': '杠铃划船',
				'T杠划船': '杠铃划船',
				'面拉': '面拉',
				'杠铃深蹲': '深蹲',
				'前蹲': '深蹲',
				'哑铃深蹲': '深蹲',
				'保加利亚深蹲': '深蹲',
				'深蹲': '深蹲',
				'腿举': '腿举',
				'罗马尼亚硬拉': '硬拉',
				'硬拉': '硬拉',
				'杠铃硬拉': '硬拉',
				'杠铃肩推': '肩推',
				'哑铃肩推': '肩推',
				'肩推': '肩推',
				'侧平举': '侧平举',
				'前平举': '前平举',
				'阿诺德推举': '肩推',
				'倒立撑': '倒立撑',
				'杠铃弯举': '杠铃弯举',
				'哑铃弯举': '杠铃弯举',
				'锤式弯举': '杠铃弯举',
				'窄距卧推': '窄距卧推',
				'三头肌下压': '三头肌下压',
				'臂屈伸': '三头肌下压',
				'平板支撑': '平板支撑',
				'卷腹': '卷腹',
				'俄罗斯转体': '俄罗斯转体',
				'登山者': '登山者',
				'死虫': '死虫',
				'鸟狗式': '鸟狗式',
				'仰卧起坐': '卷腹'
			}
		}
	},	onShow() {
		// 页面显示时加载训练记录和更新统计数据
		this.loadWorkoutHistory();
		this.updatePersonalRecordsWithManualData();
		this.updateStrengthProgress();
		this.updateTrainingStats();
		
		// 更新同步状态
		this.updateSyncStatus();
	},
	methods: {
		navigateTo(page) {
			uni.reLaunch({
				url: `/pages/${page}/${page}`
			});
		},

		// 获取用户特定的存储键
		getUserStorageKey(baseKey) {
			const userInfo = uni.getStorageSync('userInfo');
			return userInfo && userInfo.id ? `${baseKey}_${userInfo.id}` : baseKey;
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
			
			const weight = parseFloat(this.weightInput);
			if (isNaN(weight) || weight <= 0) {
				uni.showToast({
					title: '请输入有效的体重',
					icon: 'none'
				});
				return;
			}
			
			// 保存体重记录（按用户隔离）
			const currentDate = new Date().toISOString().split('T')[0];
			const weightHistoryKey = this.getUserStorageKey('weightHistory');
			const weightHistory = uni.getStorageSync(weightHistoryKey) || [];
			
			// 添加新的体重记录
			const newWeightRecord = {
				weight: weight,
				date: currentDate,
				timestamp: Date.now()
			};
			
			// 检查今天是否已有记录，如果有则更新，没有则添加
			const todayIndex = weightHistory.findIndex(record => record.date === currentDate);
			if (todayIndex !== -1) {
				weightHistory[todayIndex] = newWeightRecord;
			} else {
				weightHistory.push(newWeightRecord);
			}
			
			// 按日期排序（最新的在前面）
			weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
			
			// 保存到本地存储
			uni.setStorageSync(weightHistoryKey, weightHistory);
			
			// 计算体重变化
			let weightChange = '';
			if (weightHistory.length >= 2) {
				const currentWeight = weightHistory[0].weight;
				const previousWeight = weightHistory[1].weight;
				const change = currentWeight - previousWeight;
				
				if (change > 0) {
					weightChange = ` (+${change.toFixed(1)}kg)`;
				} else if (change < 0) {
					weightChange = ` (${change.toFixed(1)}kg)`;
				} else {
					weightChange = ' (无变化)';
				}
			}
			
			uni.showToast({
				title: `体重记录成功: ${weight}kg${weightChange}`,
				icon: 'success',
				duration: 2000
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
			
			const weight = parseFloat(this.maxWeightInput);
			if (isNaN(weight) || weight <= 0) {
				uni.showToast({
					title: '请输入有效的重量',
					icon: 'none'
				});
				return;
			}
			
			// 保存手动记录的最大重量
			const exerciseName = this.exercises[this.exerciseIndex];
			const standardExerciseName = this.getStandardExerciseName(exerciseName) || exerciseName;
			const personalRecordsKey = this.getUserStorageKey('personalRecords');
			const savedRecords = uni.getStorageSync(personalRecordsKey) || {};
			const currentDate = new Date().toISOString().split('T')[0];
			
			// 检查是否是新记录
			let isNewRecord = false;
			if (!savedRecords[standardExerciseName] || weight > savedRecords[standardExerciseName].weight) {
				isNewRecord = true;
				savedRecords[standardExerciseName] = {
					weight: weight,
					date: currentDate
				};
				uni.setStorageSync(personalRecordsKey, savedRecords);
				
				// 如果是新记录，显示庆祝效果
				if (isNewRecord) {
					uni.showModal({
						title: '🎉 恭喜！',
						content: `您在 ${standardExerciseName} 上创造了新的个人记录：${weight}kg！`,
						showCancel: false,
						confirmText: '太棒了！',
						confirmColor: '#3b82f6'
					});
				}
			}
			
			// 重新计算并更新个人记录（合并训练记录和手动记录）
			this.updatePersonalRecordsWithManualData();
			this.updateStrengthProgress();
			
			let message = `${standardExerciseName}记录成功`;
			if (isNewRecord) {
				message += ' - 新个人记录!';
			}
			
			if (!isNewRecord) {
				uni.showToast({
					title: message,
					icon: 'success',
					duration: 2000
				});
			}
			
			this.maxWeightInput = '';
		},
		loadWorkoutHistory() {
			// 从本地存储加载训练记录
			const workoutHistoryKey = this.getUserStorageKey('workoutHistory');
			const workoutHistory = uni.getStorageSync(workoutHistoryKey) || [];
			this.workoutLogs = workoutHistory.map(workout => ({
				id: workout.id,
				date: workout.date,
				type: workout.name,
				duration: workout.duration,
				status: workout.status
			}));
		},
		
		// 更新个人记录（合并训练记录和手动记录）
		updatePersonalRecordsWithManualData() {
			const workoutHistoryKey = this.getUserStorageKey('workoutHistory');
			const personalRecordsKey = this.getUserStorageKey('personalRecords');
			const workoutHistory = uni.getStorageSync(workoutHistoryKey) || [];
			const savedRecords = uni.getStorageSync(personalRecordsKey) || {};
			let records = {};
			let hasNewRecord = false;
			
			// 首先加载已保存的手动记录
			Object.keys(savedRecords).forEach(exerciseName => {
				records[exerciseName] = {
					weight: savedRecords[exerciseName].weight,
					date: savedRecords[exerciseName].date,
					isNew: this.isRecentDate(savedRecords[exerciseName].date)
				};
			});
			
			// 然后从训练记录中提取每个动作的最大重量
			workoutHistory.forEach(workout => {
				if (workout.exercises && workout.exercises.length > 0) {
					workout.exercises.forEach(exercise => {
						const exerciseName = this.getStandardExerciseName(exercise.name);
						if (exerciseName && exercise.sets && exercise.sets.length > 0) {
							exercise.sets.forEach(set => {
								const weight = parseFloat(set.weight);
								if (!isNaN(weight) && weight > 0) {
									// 比较训练记录中的重量和已保存的记录
									if (!records[exerciseName] || weight > records[exerciseName].weight) {
										// 检查是否是新记录
										const isNewRecord = !savedRecords[exerciseName] || weight > savedRecords[exerciseName].weight;
										if (isNewRecord) hasNewRecord = true;
										
										records[exerciseName] = {
											weight: weight,
											date: workout.date,
											isNew: isNewRecord && this.isRecentDate(workout.date)
										};
									}
								}
							});
						}
					});
				}
			});
			
			// 转换为数组格式并排序
			this.personalRecords = Object.keys(records)
				.map(exerciseName => ({
					exercise: exerciseName,
					weight: records[exerciseName].weight + ' kg',
					date: records[exerciseName].date,
					isNew: records[exerciseName].isNew
				}))
				.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
			
			// 更新保存的记录（保持手动记录和训练记录的最高值）
			const recordsToSave = {};
			Object.keys(records).forEach(key => {
				recordsToSave[key] = {
					weight: records[key].weight,
					date: records[key].date
				};
			});
			uni.setStorageSync(personalRecordsKey, recordsToSave);
			
			// 如果有新记录，3秒后清除新记录标识
			if (hasNewRecord) {
				setTimeout(() => {
					this.personalRecords.forEach(record => {
						record.isNew = false;
					});
				}, 3000);
			}
		},
		
		// 更新个人记录（仅基于训练记录）
		updatePersonalRecords() {
			const workoutHistoryKey = this.getUserStorageKey('workoutHistory');
			const personalRecordsKey = this.getUserStorageKey('personalRecords');
			const workoutHistory = uni.getStorageSync(workoutHistoryKey) || [];
			const savedRecords = uni.getStorageSync(personalRecordsKey) || {};
			let records = {};
			let hasNewRecord = false;
			
			// 从训练记录中提取每个动作的最大重量
			workoutHistory.forEach(workout => {
				if (workout.exercises && workout.exercises.length > 0) {
					workout.exercises.forEach(exercise => {
						const exerciseName = this.getStandardExerciseName(exercise.name);
						if (exerciseName && exercise.sets && exercise.sets.length > 0) {
							exercise.sets.forEach(set => {
								const weight = parseFloat(set.weight);
								if (!isNaN(weight) && weight > 0) {
									if (!records[exerciseName] || weight > records[exerciseName].weight) {
										// 检查是否是新记录
										const isNewRecord = !savedRecords[exerciseName] || weight > savedRecords[exerciseName].weight;
										if (isNewRecord) hasNewRecord = true;
										
										records[exerciseName] = {
											weight: weight,
											date: workout.date,
											isNew: isNewRecord && this.isRecentDate(workout.date)
										};
									}
								}
							});
						}
					});
				}
			});
			
			// 转换为数组格式并排序
			this.personalRecords = Object.keys(records)
				.map(exerciseName => ({
					exercise: exerciseName,
					weight: records[exerciseName].weight + ' kg',
					date: records[exerciseName].date,
					isNew: records[exerciseName].isNew
				}))
				.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
			
			// 保存到本地存储
			const recordsToSave = {};
			Object.keys(records).forEach(key => {
				recordsToSave[key] = {
					weight: records[key].weight,
					date: records[key].date
				};
			});
			uni.setStorageSync(personalRecordsKey, recordsToSave);
			
			// 如果有新记录，3秒后清除新记录标识
			if (hasNewRecord) {
				setTimeout(() => {
					this.personalRecords.forEach(record => {
						record.isNew = false;
					});
				}, 3000);
			}
		},
		
		// 更新力量进步统计
		updateStrengthProgress() {
			const workoutHistoryKey = this.getUserStorageKey('workoutHistory');
			const strengthProgressKey = this.getUserStorageKey('strengthProgress');
			const workoutHistory = uni.getStorageSync(workoutHistoryKey) || [];
			const savedProgress = uni.getStorageSync(strengthProgressKey) || {};
			
			// 获取当前个人记录
			const currentRecords = {};
			this.personalRecords.forEach(record => {
				currentRecords[record.exercise] = parseFloat(record.weight);
			});
			
			// 计算进步情况
			this.strengthProgress = Object.keys(currentRecords).map(exerciseName => {
				const current = currentRecords[exerciseName];
				const previous = savedProgress[exerciseName] || current;
				const change = current - previous;
				
				return {
					exercise: exerciseName,
					current: current + ' kg',
					change: Math.round(change * 10) / 10,
					previousWeight: previous
				};
			});
			
			// 更新保存的进度数据
			const progressToSave = {};
			Object.keys(currentRecords).forEach(key => {
				progressToSave[key] = currentRecords[key];
			});
			uni.setStorageSync(strengthProgressKey, progressToSave);
		},
		
		// 更新训练统计数据
		updateTrainingStats() {
			const workoutHistoryKey = this.getUserStorageKey('workoutHistory');
			const workoutHistory = uni.getStorageSync(workoutHistoryKey) || [];
			const now = new Date();
			const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
			const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
			
			let thisWeekCount = 0;
			let thisMonthCount = 0;
			let totalDuration = 0;
			
			workoutHistory.forEach(workout => {
				const workoutDate = new Date(workout.date);
				
				// 统计本周训练
				if (workoutDate >= thisWeekStart) {
					thisWeekCount++;
				}
				
				// 统计本月训练
				if (workoutDate >= thisMonthStart) {
					thisMonthCount++;
				}
				
				// 累计训练时长
				const duration = parseInt(workout.duration);
				if (!isNaN(duration)) {
					totalDuration += duration;
				}
			});
			
			// 计算平均时长
			const avgDuration = workoutHistory.length > 0 ? Math.round(totalDuration / workoutHistory.length) : 0;
			
			this.trainingStats = {
				thisWeek: thisWeekCount,
				thisMonth: thisMonthCount,
				total: workoutHistory.length,
				avgDuration: avgDuration + ' 分钟'
			};
		},
		
		// 获取标准化的动作名称
		getStandardExerciseName(name) {
			return this.exerciseMapping[name] || null;
		},
		
		// 检查日期是否为最近（用于显示新记录标识）
		isRecentDate(dateString) {
			const date = new Date(dateString);
			const now = new Date();
			const diffTime = Math.abs(now - date);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays <= 7; // 一周内的记录显示为新记录
		},
		addWorkoutLog() {
			uni.navigateTo({
				url: '/pages/record/record'
			});
		},
		viewLogDetails(log) {
			// 查找完整的训练记录
			const workoutHistoryKey = this.getUserStorageKey('workoutHistory');
			const workoutHistory = uni.getStorageSync(workoutHistoryKey) || [];
			const fullWorkout = workoutHistory.find(workout => workout.id === log.id);
			
			if (fullWorkout) {
				let detailText = `训练名称：${fullWorkout.name}\n`;
				detailText += `训练类型：${fullWorkout.type}\n`;
				detailText += `训练时长：${fullWorkout.duration}\n`;
				detailText += `开始时间：${fullWorkout.startTime}\n\n`;
				detailText += `训练动作：\n`;
				
				fullWorkout.exercises.forEach((exercise, index) => {
					detailText += `${index + 1}. ${exercise.name}\n`;
					exercise.sets.forEach((set, setIndex) => {
						detailText += `   第${setIndex + 1}组: ${set.weight}kg × ${set.reps}次\n`;
					});
				});
				
				uni.showModal({
					title: '训练详情',
					content: detailText,
					showCancel: false,
					confirmText: '知道了'
				});
			} else {
				uni.showToast({
					title: '记录详情不存在',
					icon: 'none'
				});
			}
		},
		

		
		// 数据同步方法
		async syncData() {
			if (this.syncStatus.syncing) return;
			
			if (!cloudDataService.isLoggedIn) {
				uni.showModal({
					title: '提示',
					content: '需要登录云端账号才能同步数据，是否前往登录？',
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
				const result = await cloudDataService.autoSync();
				
				if (result.success) {
					this.syncStatus.icon = '✅';
					this.syncStatus.text = '同步成功';
					
					// 重新加载数据
					this.loadWorkoutHistory();
					this.updatePersonalRecordsWithManualData();
					this.updateStrengthProgress();
					this.updateTrainingStats();
					
					uni.showToast({
						title: '数据同步成功',
						icon: 'success'
					});
				} else {
					this.syncStatus.icon = '❌';
					this.syncStatus.text = '同步失败';
					
					uni.showToast({
						title: result.message || '同步失败',
						icon: 'none'
					});
				}
			} catch (error) {
				this.syncStatus.icon = '❌';
				this.syncStatus.text = '同步失败';
				
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			}
			
			this.syncStatus.syncing = false;
			
			// 3秒后恢复初始状态
			setTimeout(() => {
				this.updateSyncStatus();
			}, 3000);
		},
		
		// 更新同步状态
		updateSyncStatus() {
			if (cloudDataService.isLoggedIn) {
				this.syncStatus = {
					icon: '☁️',
					text: '云端已连接',
					syncing: false
				};
			} else {
				this.syncStatus = {
					icon: '📱',
					text: '本地模式',
					syncing: false
				};
			}
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
	min-width: 120rpx; /* 确保右侧有足够的占位空间 */
}

// 同步状态样式
.sync-status {
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	background-color: rgba(59, 130, 246, 0.1);
	cursor: pointer;
	transition: all 0.3s ease;
	
	&:hover {
		background-color: rgba(59, 130, 246, 0.2);
	}
	
	&:active {
		transform: scale(0.95);
	}
}

.sync-icon {
	font-size: 24rpx;
	line-height: 1;
}

.sync-text {
	font-size: 24rpx;
	color: #333;
	line-height: 1;
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



// 空状态样式
.empty-records {
	text-align: center;
	padding: 60rpx 20rpx;
	color: var(--text-color-light);
}

.empty-text {
	font-size: 28rpx;
	margin-bottom: 10rpx;
	display: block;
}

.empty-desc {
	font-size: 24rpx;
	opacity: 0.8;
	display: block;
}

// 进步颜色样式
.text-error {
	color: var(--error-color);
}

.text-gray {
	color: var(--text-color-light);
}

.loss {
	font-size: 24rpx;
	font-weight: normal;
}

// 测试按钮样式
.test-buttons {
	display: flex;
	gap: 20rpx;
	justify-content: center;
}

.btn-outline {
	background-color: transparent;
	border: 2rpx solid var(--primary-color);
	color: var(--primary-color);
	
	&:active {
		background-color: var(--primary-color);
		color: #fff;
	}
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