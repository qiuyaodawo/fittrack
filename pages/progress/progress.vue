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
			<!-- 上方并排布局 -->
			<view class="top-row">
				<view class="card stat-card">
					<text class="stat-card-title">体重变化</text>
					<view class="weight-content" v-if="weightChangeInfo.current">
						<view class="pr-item">
							<text class="pr-exercise">当前体重</text>
							<view class="pr-weight-info">
								<text class="pr-weight">
									{{weightChangeInfo.current}} kg
									<text :class="weightChangeInfo.change > 0 ? 'text-error pr-change' : weightChangeInfo.change < 0 ? 'text-success pr-change' : 'text-gray pr-change'" v-if="weightChangeInfo.change !== null && weightChangeInfo.change !== 0">
										{{weightChangeInfo.change > 0 ? ' +' : ' '}}{{weightChangeInfo.change}} kg
									</text>
								</text>
							</view>
							<text class="pr-date">{{weightChangeInfo.date}}</text>
						</view>
						
						<!-- 近7天体重变化条形图 -->
						<view class="weight-chart" v-if="weightChangeInfo.chartData.length > 0">
							<text class="chart-title">近7天变化</text>
							<view class="bar-chart">
								<view class="chart-bars">
									<view 
										class="chart-bar-item" 
										v-for="(item, index) in weightChangeInfo.chartData" 
										:key="index"
									>
										<view 
											class="chart-bar"
											:class="{'no-data': item.weight === null}"
											:style="getBarStyle(item)"
										>
											<text class="bar-value" v-if="item.weight">{{item.weight}}kg</text>
										</view>
										<text class="bar-label">{{item.dateLabel}}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view class="empty-records" v-else>
						<text class="empty-text">暂无体重记录</text>
						<text class="empty-desc">记录体重后会显示变化情况</text>
					</view>
				</view>
				
				<view class="card weekly-body-parts">
					<view class="flex-row justify-between align-center">
						<text class="section-title">本周锻炼部位</text>
						<text class="week-range">{{currentWeekRange}}</text>
					</view>
					
					<view class="body-parts-list">
						<view class="body-part-item" v-for="(part, index) in weeklyBodyParts" :key="index">
							<view class="body-part-info">
								<text class="body-part-name">{{part.name}}</text>
								<text class="body-part-count">{{part.count}} 次</text>
							</view>
						</view>
					</view>
					
					<view class="weekly-summary" v-if="weeklyBodyParts.length > 0">
						<text class="summary-text">本周共锻炼 {{totalWorkouts}} 次，涉及 {{trainedBodyParts}} 个部位</text>
					</view>
					
					<view class="empty-state" v-else>
						<text class="empty-text">本周还没有训练记录</text>
						<text class="empty-desc">开始训练来记录锻炼部位吧</text>
					</view>
				</view>
			</view>
			
			<!-- 个人记录卡片 -->
			<view class="card stat-card">
				<text class="stat-card-title">个人记录</text>
				<view class="personal-records" v-if="personalRecords.length > 0">
					<view class="pr-item" v-for="(record, index) in personalRecords" :key="index">
						<text class="pr-exercise">{{record.exercise}}</text>
						<view class="pr-weight-info">
							<text class="pr-weight">
								{{record.weight}}
								<text :class="record.change > 0 ? 'text-success pr-change' : record.change < 0 ? 'text-error pr-change' : 'text-gray pr-change'" v-if="record.change !== undefined && record.change !== 0">
									{{record.change > 0 ? ' +' : ' '}}{{record.change}} kg
								</text>
							</text>
						</view>
						<text class="pr-date">{{record.date}}</text>
					</view>
				</view>
				<view class="empty-records" v-else>
					<text class="empty-text">暂无个人记录</text>
					<text class="empty-desc">完成训练后会自动更新记录</text>
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
			exercises: [], // 将从训练数据库动态加载
			
			// 训练数据库（与其他页面同步）
			exerciseDatabase: [
				// 胸部动作
				{
					id: 1,
					name: '杠铃卧推',
					description: '使用杠铃在平板上进行胸部训练的基础动作，是发展胸肌力量的黄金动作',
					tags: ['胸部', '杠铃'],
					category: 'chest'
				},
				{
					id: 2,
					name: '哑铃卧推',
					description: '使用哑铃进行的卧推动作，能够更好地刺激胸肌稳定性',
					tags: ['胸部', '哑铃'],
					category: 'chest'
				},
				{
					id: 3,
					name: '上斜卧推',
					description: '在上斜角度进行的卧推，主要锻炼胸肌上部',
					tags: ['胸部', '杠铃'],
					category: 'chest'
				},
				{
					id: 4,
					name: '下斜卧推',
					description: '在下斜角度进行的卧推，主要锻炼胸肌下部',
					tags: ['胸部', '杠铃'],
					category: 'chest'
				},
				{
					id: 5,
					name: '哑铃飞鸟',
					description: '使用哑铃进行的胸部分离动作，能够很好地拉伸胸肌',
					tags: ['胸部', '哑铃'],
					category: 'chest'
				},
				{
					id: 6,
					name: '俯卧撑',
					description: '经典的自重胸部训练动作，随时随地可以进行',
					tags: ['胸部', '自重'],
					category: 'chest'
				},
				{
					id: 7,
					name: '双杠臂屈伸',
					description: '在双杠上进行的复合动作，同时锻炼胸肌和三头肌',
					tags: ['胸部', '自重'],
					category: 'chest'
				},
				
				// 背部动作
				{
					id: 8,
					name: '引体向上',
					description: '锻炼背部和手臂力量的经典自重训练，发展背部宽度',
					tags: ['背部', '自重'],
					category: 'back'
				},
				{
					id: 9,
					name: '杠铃划船',
					description: '使用杠铃进行的背部厚度训练，发展背阔肌和菱形肌',
					tags: ['背部', '杠铃'],
					category: 'back'
				},
				{
					id: 10,
					name: '哑铃划船',
					description: '使用哑铃进行的单侧背部训练，可以修正力量不平衡',
					tags: ['背部', '哑铃'],
					category: 'back'
				},
				{
					id: 11,
					name: '高位下拉',
					description: '在拉力器上进行的背部宽度训练，适合初学者学习引体向上动作模式',
					tags: ['背部', '器械'],
					category: 'back'
				},
				{
					id: 12,
					name: '坐姿划船',
					description: '在坐姿划船机上进行的背部训练，能够很好地锻炼中背部肌群',
					tags: ['背部', '器械'],
					category: 'back'
				},
				{
					id: 13,
					name: 'T杠划船',
					description: '使用T杠进行的划船动作，能够很好地发展背部厚度',
					tags: ['背部', '杠铃'],
					category: 'back'
				},
				{
					id: 14,
					name: '面拉',
					description: '使用绳索进行的后束三角肌和菱形肌训练动作',
					tags: ['背部', '器械'],
					category: 'back'
				},
				
				// 腿部动作
				{
					id: 15,
					name: '杠铃深蹲',
					description: '锻炼下肢肌群的黄金动作，是所有腿部训练的基础',
					tags: ['腿部', '杠铃'],
					category: 'legs'
				},
				{
					id: 16,
					name: '前蹲',
					description: '杠铃置于前侧的深蹲变式，更多地锻炼股四头肌',
					tags: ['腿部', '杠铃'],
					category: 'legs'
				},
				{
					id: 17,
					name: '哑铃深蹲',
					description: '使用哑铃进行的深蹲，适合初学者或家庭训练',
					tags: ['腿部', '哑铃'],
					category: 'legs'
				},
				{
					id: 18,
					name: '腿举',
					description: '在腿举机上进行的下肢训练，可以使用更大的重量',
					tags: ['腿部', '器械'],
					category: 'legs'
				},
				{
					id: 19,
					name: '保加利亚深蹲',
					description: '单腿进行的深蹲变式，能够很好地锻炼单侧力量',
					tags: ['腿部', '自重'],
					category: 'legs'
				},
				{
					id: 20,
					name: '罗马尼亚硬拉',
					description: '主要锻炼腘绳肌和臀部肌群的硬拉变式',
					tags: ['腿部', '杠铃'],
					category: 'legs'
				},
				{
					id: 21,
					name: '硬拉',
					description: '锻炼后链肌群的复合动作，提升整体力量的经典动作',
					tags: ['背部', '腿部', '杠铃'],
					category: 'legs'
				},
				
				// 肩部动作
				{
					id: 22,
					name: '杠铃肩推',
					description: '使用杠铃进行的肩部推举，发展肩部整体力量',
					tags: ['肩部', '杠铃'],
					category: 'shoulders'
				},
				{
					id: 23,
					name: '哑铃肩推',
					description: '使用哑铃进行的肩部推举，发展肩部力量和围度的经典动作',
					tags: ['肩部', '哑铃'],
					category: 'shoulders'
				},
				{
					id: 24,
					name: '侧平举',
					description: '锻炼三角肌中束的分离动作，塑造肩部宽度',
					tags: ['肩部', '哑铃'],
					category: 'shoulders'
				},
				{
					id: 25,
					name: '前平举',
					description: '主要锻炼三角肌前束的分离动作',
					tags: ['肩部', '哑铃'],
					category: 'shoulders'
				},
				{
					id: 26,
					name: '阿诺德推举',
					description: '结合推举和旋转的复合肩部动作，以阿诺德·施瓦辛格命名',
					tags: ['肩部', '哑铃'],
					category: 'shoulders'
				},
				{
					id: 27,
					name: '倒立撑',
					description: '高难度的自重肩部训练动作，需要良好的平衡能力',
					tags: ['肩部', '自重'],
					category: 'shoulders'
				},
				
				// 手臂动作
				{
					id: 28,
					name: '杠铃弯举',
					description: '锻炼二头肌的基础动作，使用杠铃进行',
					tags: ['手臂', '杠铃'],
					category: 'arms'
				},
				{
					id: 29,
					name: '哑铃弯举',
					description: '使用哑铃进行的二头肌训练，可以单侧或双侧进行',
					tags: ['手臂', '哑铃'],
					category: 'arms'
				},
				{
					id: 30,
					name: '锤式弯举',
					description: '中性握法的弯举动作，同时锻炼二头肌和肱桡肌',
					tags: ['手臂', '哑铃'],
					category: 'arms'
				},
				{
					id: 31,
					name: '窄距卧推',
					description: '窄握距的卧推变式，主要锻炼三头肌',
					tags: ['手臂', '杠铃'],
					category: 'arms'
				},
				{
					id: 32,
					name: '三头肌下压',
					description: '在拉力器上锻炼三头肌的经典动作',
					tags: ['手臂', '器械'],
					category: 'arms'
				},
				{
					id: 33,
					name: '臂屈伸',
					description: '在双杠或椅子上进行的三头肌训练动作',
					tags: ['手臂', '自重'],
					category: 'arms'
				},
				
				// 核心动作
				{
					id: 34,
					name: '平板支撑',
					description: '强化核心肌群的等长收缩训练，是核心训练的基础动作',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 35,
					name: '卷腹',
					description: '锻炼腹直肌的经典动作，是腹肌训练的基础',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 36,
					name: '俄罗斯转体',
					description: '锻炼腹斜肌和核心旋转力量的动作',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 37,
					name: '登山者',
					description: '结合有氧和核心训练的动态动作',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 38,
					name: '死虫',
					description: '锻炼核心稳定性的对侧肢体协调动作',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 39,
					name: '鸟狗式',
					description: '提升核心稳定性和平衡能力的瑜伽动作',
					tags: ['核心', '自重'],
					category: 'core'
				}
			],
			
			personalRecords: [],
			strengthProgress: [],

			
			// 本周锻炼部位数据
			weeklyBodyParts: [],
			currentWeekRange: '',
			totalWorkouts: 0,
			trainedBodyParts: 0,
			
			// 体重变化信息
			weightChangeInfo: {
				current: null,
				change: null,
				date: null
			},
			
			// 同步状态
			syncStatus: {
				icon: '🔄',
				text: '点击同步',
				syncing: false
			},
			
			// 动作名称映射，用于统一不同写法的动作名
			exerciseMapping: {
				// 胸部动作映射
				'杠铃卧推': '杠铃卧推',
				'哑铃卧推': '哑铃卧推',
				'上斜卧推': '上斜卧推',
				'下斜卧推': '下斜卧推',
				'哑铃飞鸟': '哑铃飞鸟',
				'俯卧撑': '俯卧撑',
				'双杠臂屈伸': '双杠臂屈伸',
				
				// 背部动作映射
				'引体向上': '引体向上',
				'杠铃划船': '杠铃划船',
				'哑铃划船': '哑铃划船',
				'高位下拉': '高位下拉',
				'坐姿划船': '坐姿划船',
				'T杠划船': 'T杠划船',
				'面拉': '面拉',
				
				// 腿部动作映射
				'杠铃深蹲': '杠铃深蹲',
				'前蹲': '前蹲',
				'哑铃深蹲': '哑铃深蹲',
				'腿举': '腿举',
				'保加利亚深蹲': '保加利亚深蹲',
				'罗马尼亚硬拉': '罗马尼亚硬拉',
				'硬拉': '硬拉',
				
				// 肩部动作映射
				'杠铃肩推': '杠铃肩推',
				'哑铃肩推': '哑铃肩推',
				'侧平举': '侧平举',
				'前平举': '前平举',
				'阿诺德推举': '阿诺德推举',
				'倒立撑': '倒立撑',
				
				// 手臂动作映射
				'杠铃弯举': '杠铃弯举',
				'哑铃弯举': '哑铃弯举',
				'锤式弯举': '锤式弯举',
				'窄距卧推': '窄距卧推',
				'三头肌下压': '三头肌下压',
				'臂屈伸': '臂屈伸',
				
				// 核心动作映射
				'平板支撑': '平板支撑',
				'卷腹': '卷腹',
				'俄罗斯转体': '俄罗斯转体',
				'登山者': '登山者',
				'死虫': '死虫',
				'鸟狗式': '鸟狗式',
				
				// 兼容旧的映射关系
				'平板卧推': '杠铃卧推',
				'杠铃硬拉': '硬拉',
				'肩推': '杠铃肩推',
				'深蹲': '杠铃深蹲',
				'卧推': '杠铃卧推',
				'仰卧起坐': '卷腹'
			}
		}
	},
	onShow() {
		// 页面显示时更新统计数据
		// 初始化动作列表（排除自重动作）
		this.initializeExerciseList();
		
		// 清理旧的无效记录
		this.cleanupOldRecords();
		
		this.updatePersonalRecordsWithManualData();
		this.updateStrengthProgress();
		
		// 加载本周锻炼部位数据
		this.loadWeeklyBodyParts();
		
		// 加载体重变化信息
		this.loadWeightChangeInfo();
		
		// 更新同步状态
		this.updateSyncStatus();
		

	},
	methods: {
		navigateTo(page) {
			uni.reLaunch({
				url: `/pages/${page}/${page}`
			});
		},
		
		// 初始化动作列表，排除自重动作
		initializeExerciseList() {
			// 过滤掉标签包含"自重"的动作
			const weightExercises = this.exerciseDatabase.filter(exercise => {
				return !exercise.tags.includes('自重');
			});
			
			// 提取动作名称并按字母顺序排序
			this.exercises = weightExercises
				.map(exercise => exercise.name)
				.sort((a, b) => a.localeCompare(b, 'zh-CN'));
			
			// 确保exerciseIndex在有效范围内
			if (this.exerciseIndex >= this.exercises.length) {
				this.exerciseIndex = 0;
			}
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
			
			// 更新体重变化信息显示
			this.loadWeightChangeInfo();
			

			
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
			const strengthProgressKey = this.getUserStorageKey('strengthProgress');
			const savedRecords = uni.getStorageSync(personalRecordsKey) || {};
			const savedProgress = uni.getStorageSync(strengthProgressKey) || {};
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
				
				// 如果是新的个人记录，更新力量进步的基准点
				if (savedProgress[standardExerciseName] === undefined) {
					// 如果是第一次记录该动作，设置基准点为当前重量
					savedProgress[standardExerciseName] = weight;
				} else {
					// 如果已有基准点，保持不变，这样可以显示总的进步
					// 不更新基准点，让用户看到从最初记录以来的总进步
				}
				uni.setStorageSync(strengthProgressKey, savedProgress);
			}
			
			// 立即更新个人记录显示
			this.updatePersonalRecordsWithManualData();
			this.updateStrengthProgress();
			
			let message = `${standardExerciseName}记录成功`;
			if (isNewRecord) {
				message += ' - 新个人记录!';
				// 如果是新记录，显示庆祝效果
				uni.showModal({
					title: '🎉 恭喜！',
					content: `您在 ${standardExerciseName} 上创造了新的个人记录：${weight}kg！`,
					showCancel: false,
					confirmText: '太棒了！',
					confirmColor: '#3b82f6'
				});
			} else {
				uni.showToast({
					title: message,
					icon: 'success',
					duration: 2000
				});
			}
			
			this.maxWeightInput = '';
		},

		
		// 更新个人记录（合并训练记录和手动记录）
		updatePersonalRecordsWithManualData() {
			const workoutHistoryKey = this.getUserStorageKey('workoutHistory');
			const personalRecordsKey = this.getUserStorageKey('personalRecords');
			const workoutHistory = uni.getStorageSync(workoutHistoryKey) || [];
			const savedRecords = uni.getStorageSync(personalRecordsKey) || {};
			let records = {};
			let hasNewRecord = false;
			
			// 获取当前可用的动作列表（用于过滤旧记录）
			const validExercises = this.exerciseDatabase
				.filter(exercise => !exercise.tags.includes('自重'))
				.map(exercise => exercise.name);
			
			// 首先加载已保存的手动记录，但只保留当前动作库中存在的动作
			Object.keys(savedRecords).forEach(exerciseName => {
				// 只保留当前动作库中存在的动作
				if (validExercises.includes(exerciseName)) {
					records[exerciseName] = {
						weight: savedRecords[exerciseName].weight,
						date: savedRecords[exerciseName].date,
						isNew: this.isRecentDate(savedRecords[exerciseName].date)
					};
				}
			});
			
			// 然后从训练记录中提取每个动作的最大重量
			workoutHistory.forEach(workout => {
				if (workout.exercises && workout.exercises.length > 0) {
					workout.exercises.forEach(exercise => {
						const exerciseName = this.getStandardExerciseName(exercise.name);
						// 只处理当前动作库中存在的动作
						if (exerciseName && validExercises.includes(exerciseName) && exercise.sets && exercise.sets.length > 0) {
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
			
			// 获取力量进步数据
			const strengthProgressKey = this.getUserStorageKey('strengthProgress');
			const savedProgress = uni.getStorageSync(strengthProgressKey) || {};
			
			// 转换为数组格式并排序，同时添加力量进步信息
			this.personalRecords = Object.keys(records)
				.map(exerciseName => {
					const currentWeight = records[exerciseName].weight;
					let change = 0;
					
					// 如果savedProgress中有该动作的记录，计算变化
					if (savedProgress[exerciseName] !== undefined) {
						const previousWeight = savedProgress[exerciseName];
						change = Math.round((currentWeight - previousWeight) * 10) / 10;
					}
					
					return {
						exercise: exerciseName,
						weight: currentWeight + ' kg',
						date: records[exerciseName].date,
						isNew: records[exerciseName].isNew,
						change: change
					};
				})
				.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
			
			// 更新保存的记录（只保存有效的动作记录）
			const recordsToSave = {};
			const progressToSave = {};
			Object.keys(records).forEach(key => {
				recordsToSave[key] = {
					weight: records[key].weight,
					date: records[key].date
				};
				// 如果savedProgress中没有该动作记录，设置基准点为当前重量
				// 如果已有基准点，保持不变，这样可以显示从基准点以来的进步
				if (savedProgress[key] === undefined) {
					progressToSave[key] = records[key].weight;
				} else {
					progressToSave[key] = savedProgress[key];
				}
			});
			uni.setStorageSync(personalRecordsKey, recordsToSave);
			uni.setStorageSync(strengthProgressKey, progressToSave);
			
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
			
			// 获取当前可用的动作列表（用于过滤旧记录）
			const validExercises = this.exerciseDatabase
				.filter(exercise => !exercise.tags.includes('自重'))
				.map(exercise => exercise.name);
			
			// 获取当前个人记录
			const currentRecords = {};
			this.personalRecords.forEach(record => {
				// 只处理当前动作库中存在的动作
				if (validExercises.includes(record.exercise)) {
					currentRecords[record.exercise] = parseFloat(record.weight);
				}
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
			
			// 更新保存的进度数据（只保存有效的动作）
			const progressToSave = {};
			Object.keys(currentRecords).forEach(key => {
				progressToSave[key] = currentRecords[key];
			});
			uni.setStorageSync(strengthProgressKey, progressToSave);
		},
		

		
		// 获取标准化的动作名称
		getStandardExerciseName(name) {
			return this.exerciseMapping[name] || name;
		},
		
		// 检查日期是否为最近（用于显示新记录标识）
		isRecentDate(dateString) {
			const date = new Date(dateString);
			const now = new Date();
			const diffTime = Math.abs(now - date);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays <= 7; // 一周内的记录显示为新记录
		},

		
		// 清理旧的无效记录
		cleanupOldRecords() {
			// 获取当前可用的动作列表
			const validExercises = this.exerciseDatabase
				.filter(exercise => !exercise.tags.includes('自重'))
				.map(exercise => exercise.name);
			
			// 清理个人记录存储
			const personalRecordsKey = this.getUserStorageKey('personalRecords');
			const savedRecords = uni.getStorageSync(personalRecordsKey) || {};
			const cleanedRecords = {};
			
			Object.keys(savedRecords).forEach(exerciseName => {
				if (validExercises.includes(exerciseName)) {
					cleanedRecords[exerciseName] = savedRecords[exerciseName];
				}
			});
			
			// 如果有变化，更新存储
			if (Object.keys(cleanedRecords).length !== Object.keys(savedRecords).length) {
				uni.setStorageSync(personalRecordsKey, cleanedRecords);
				console.log('已清理个人记录中的无效动作');
			}
			
			// 清理力量进步存储
			const strengthProgressKey = this.getUserStorageKey('strengthProgress');
			const savedProgress = uni.getStorageSync(strengthProgressKey) || {};
			const cleanedProgress = {};
			
			Object.keys(savedProgress).forEach(exerciseName => {
				if (validExercises.includes(exerciseName)) {
					cleanedProgress[exerciseName] = savedProgress[exerciseName];
				}
			});
			
			// 如果有变化，更新存储
			if (Object.keys(cleanedProgress).length !== Object.keys(savedProgress).length) {
				uni.setStorageSync(strengthProgressKey, cleanedProgress);
				console.log('已清理力量进步中的无效动作');
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
					this.updatePersonalRecordsWithManualData();
					this.updateStrengthProgress();
					
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
		},
		
		// 加载本周锻炼部位数据
		loadWeeklyBodyParts() {
			// 获取本周的开始和结束日期
			const now = new Date();
			const startOfWeek = new Date(now);
			const day = now.getDay();
			const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一开始
			startOfWeek.setDate(diff);
			startOfWeek.setHours(0, 0, 0, 0);
			
			const endOfWeek = new Date(startOfWeek);
			endOfWeek.setDate(startOfWeek.getDate() + 6);
			endOfWeek.setHours(23, 59, 59, 999);
			
			// 设置当前周范围显示
			const formatDate = (date) => {
				return `${date.getMonth() + 1}/${date.getDate()}`;
			};
			this.currentWeekRange = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
			
			// 从训练记录中统计本周各部位训练次数
			const workoutHistoryKey = this.getUserStorageKey('workoutHistory');
			const workoutHistory = uni.getStorageSync(workoutHistoryKey) || [];
			
			// 定义部位映射和图标
			const bodyPartMapping = {
				'chest': { name: '胸部', icon: '💪' },
				'back': { name: '背部', icon: '🏋️' },
				'legs': { name: '腿部', icon: '🦵' },
				'shoulders': { name: '肩部', icon: '🤲' },
				'arms': { name: '手臂', icon: '💪' },
				'core': { name: '核心', icon: '🔥' }
			};
			
			// 统计本周各部位训练次数
			const weeklyStats = {};
			let totalWorkouts = 0;
			
			workoutHistory.forEach(workout => {
				const workoutDate = new Date(workout.date);
				if (workoutDate >= startOfWeek && workoutDate <= endOfWeek) {
					totalWorkouts++;
					
					// 统计每个动作对应的部位
					workout.exercises.forEach(exercise => {
						// 根据动作名称找到对应的部位
						const exerciseInfo = this.exerciseDatabase.find(ex => ex.name === exercise.name);
						if (exerciseInfo) {
							const category = exerciseInfo.category;
							if (!weeklyStats[category]) {
								weeklyStats[category] = 0;
							}
							weeklyStats[category]++;
						}
					});
				}
			});
			
			// 转换为显示格式，显示所有部位（包括0次的）
			this.weeklyBodyParts = Object.keys(bodyPartMapping).map(category => {
				const count = weeklyStats[category] || 0;
				
				return {
					name: bodyPartMapping[category].name,
					icon: bodyPartMapping[category].icon,
					count: count
				};
			}).sort((a, b) => b.count - a.count); // 按训练次数降序排列
			
			this.totalWorkouts = totalWorkouts;
			this.trainedBodyParts = this.weeklyBodyParts.filter(part => part.count > 0).length;
		},
		
		// 加载体重变化信息
		loadWeightChangeInfo() {
			const weightHistoryKey = this.getUserStorageKey('weightHistory');
			const weightHistory = uni.getStorageSync(weightHistoryKey) || [];
			
			if (weightHistory.length === 0) {
				this.weightChangeInfo = {
					current: null,
					change: null,
					date: null,
					chartData: []
				};
				return;
			}
			
			// 按日期排序（最新的在前面）
			weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
			
			const currentRecord = weightHistory[0];
			let change = null;
			
			// 如果有至少两条记录，计算变化
			if (weightHistory.length >= 2) {
				const previousRecord = weightHistory[1];
				change = Math.round((currentRecord.weight - previousRecord.weight) * 10) / 10;
			}
			
			// 获取近7天的数据用于图表
			const chartData = this.getLast7DaysWeightData(weightHistory);
			
			this.weightChangeInfo = {
				current: currentRecord.weight,
				change: change,
				date: currentRecord.date,
				chartData: chartData
			};
		},
		
		// 获取近7天的体重数据
		getLast7DaysWeightData(weightHistory) {
			const today = new Date();
			const chartData = [];
			
			// 生成近7天的日期
			for (let i = 6; i >= 0; i--) {
				const date = new Date(today);
				date.setDate(today.getDate() - i);
				const dateString = date.toISOString().split('T')[0];
				
				// 查找该日期的体重记录
				const record = weightHistory.find(r => r.date === dateString);
				
				chartData.push({
					date: dateString,
					dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
					weight: record ? record.weight : null
				});
			}
			
			return chartData;
		},
		

		
		// 计算条形图样式
		getBarStyle(item) {
			if (!item.weight) {
				return {
					height: '15rpx',
					backgroundColor: '#e5e7eb',
					opacity: '0.5'
				};
			}
			
			// 获取所有有效体重数据来计算相对高度
			const validWeights = this.weightChangeInfo.chartData
				.filter(item => item.weight !== null)
				.map(item => item.weight);
			
			if (validWeights.length === 0) {
				return { height: '0' };
			}
			
			// 如果只有一个数据点，使用固定高度
			if (validWeights.length === 1) {
				return {
					height: '120rpx',
					backgroundColor: 'var(--primary-color)'
				};
			}
			
			const minWeight = Math.min(...validWeights);
			const maxWeight = Math.max(...validWeights);
			let range = maxWeight - minWeight;
			
			// 如果体重差异太小（小于0.5kg），设置最小显示范围
			if (range < 0.5) {
				range = 0.5;
			}
			
			// 计算相对高度，最小60rpx，最大200rpx
			const normalizedValue = (item.weight - minWeight) / range;
			const barHeight = 60 + normalizedValue * 140;
			
			return {
				height: `${barHeight}rpx`,
				backgroundColor: 'var(--primary-color)'
			};
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

.top-row {
	display: flex;
	gap: 30rpx;
	margin-bottom: 40rpx;
	
	.card {
		flex: 1;
	}
	
	@media screen and (max-width: 768px) {
		flex-direction: column;
	}
}

.card {
	padding: 30rpx;
	margin-bottom: 40rpx;
}

.stat-card {
	display: flex;
	flex-direction: column;
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

// 本周锻炼部位样式
.weekly-body-parts {
	.week-range {
		font-size: 24rpx;
		color: var(--text-color-light);
	}
}

.body-parts-list {
	margin: 20rpx 0;
}

.body-part-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 2rpx solid #f1f5f9;
}

.body-part-item:last-child {
	border-bottom: none;
}

.body-part-info {
	display: flex;
	align-items: center;
	gap: 20rpx;
	flex: 1;
}

.body-part-name {
	font-size: 28rpx;
	font-weight: 500;
	color: var(--text-color);
	min-width: 80rpx;
}

.body-part-count {
	font-size: 26rpx;
	color: var(--primary-color);
	font-weight: bold;
}

.weekly-summary {
	text-align: center;
	padding: 20rpx;
	background-color: rgba(59, 130, 246, 0.1);
	border-radius: 8rpx;
	margin-top: 20rpx;
}

.summary-text {
	font-size: 26rpx;
	color: var(--text-color);
}

.empty-state {
	text-align: center;
	padding: 60rpx 20rpx;
	color: var(--text-color-light);
}

// 空状态样式
.empty-records {
	text-align: center;
	padding: 60rpx 20rpx;
	color: var(--text-color-light);
}

// 体重变化卡片样式
.weight-content {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.weight-chart {
	margin-top: 20rpx;
}

.chart-title {
	font-size: 26rpx;
	color: var(--text-color);
	margin-bottom: 15rpx;
	display: block;
	font-weight: 500;
}

.bar-chart {
	width: 100%;
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 20rpx;
	box-sizing: border-box;
	border: 1rpx solid #e5e7eb;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.chart-bars {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	height: 300rpx;
	padding: 40rpx 10rpx 0 10rpx;
}

.chart-bar-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	margin: 0 5rpx;
}

.chart-bar {
	width: 30rpx;
	margin: 0 auto 10rpx auto;
	border-radius: 4rpx;
	position: relative;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	transition: all 0.3s ease;
	
	&.no-data {
		background-color: #e5e7eb !important;
		opacity: 0.5;
	}
}

.bar-value {
	position: absolute;
	top: -30rpx;
	font-size: 20rpx;
	font-weight: bold;
	color: var(--text-color);
	white-space: nowrap;
	left: 50%;
	transform: translateX(-50%);
}

.bar-label {
	font-size: 22rpx;
	color: #6b7280;
	font-weight: 500;
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

.pr-weight-info {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
}

.pr-weight {
	font-size: 30rpx;
	font-weight: bold;
	color: var(--primary-color);
	display: flex;
	align-items: baseline;
}

.pr-change {
	font-size: 22rpx;
	font-weight: normal;
	margin-left: 8rpx;
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