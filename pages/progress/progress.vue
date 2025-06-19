<template>
	<view class="page-container">
		<!-- 使用全局导航组件 -->
		<global-nav current-page="progress"></global-nav>
		
		<view class="content-container">
			<!-- 上方并排布局 -->
			<view class="top-row">
				<view class="card stat-card weight-card">
					<text class="stat-card-title">体重变化</text>
					<view class="weight-content" v-if="weightChangeInfo.current">
						<!-- 当前体重信息区域 - 优化布局 -->
						<view class="current-weight-section">
							<view class="weight-info-row">
								<view class="weight-main-info">
									<text class="weight-label">当前体重</text>
									<view class="weight-value-container">
										<text class="weight-value">{{weightChangeInfo.current}} kg</text>
										<text
											:class="weightChangeInfo.change > 0 ? 'weight-change weight-increase' : weightChangeInfo.change < 0 ? 'weight-change weight-decrease' : 'weight-change weight-stable'"
											v-if="weightChangeInfo.change !== null && weightChangeInfo.change !== 0"
										>
											{{weightChangeInfo.change > 0 ? '+' : ''}}{{weightChangeInfo.change}} kg
										</text>
									</view>
								</view>
								<view class="weight-date-info">
									<text class="weight-date">{{weightChangeInfo.date}}</text>
								</view>
							</view>
						</view>

						<!-- 优化的柱状图区域 -->
						<view class="weight-chart-section" v-if="chartConfig.hasData">
							<text class="chart-section-title">近7天变化趋势</text>
							<view class="responsive-chart-container" :style="{ height: chartConfig.chartHeight + 100 + 'px' }">
								<!-- Y轴刻度 - 响应式定位 -->
								<view class="y-axis-container" :style="{ height: chartConfig.chartHeight + 'px' }">
									<view
										class="y-tick"
										v-for="(tick, index) in chartConfig.yTicks"
										:key="index"
										:style="{ bottom: tick.position + 'px' }"
									>
										<text class="y-tick-label">{{tick.value}}kg</text>
										<view class="y-tick-line"></view>
									</view>
								</view>

								<!-- 图表主区域 - 动态尺寸 -->
								<view class="chart-main-area" :style="{
									height: chartConfig.chartHeight + 'px',
									width: chartConfig.chartWidth + 'px'
								}">
									<!-- 背景网格 -->
									<view class="chart-grid">
										<view
											class="grid-line"
											v-for="(tick, index) in chartConfig.yTicks"
											:key="index"
											:style="{ bottom: tick.position + 'px' }"
										></view>
									</view>

									<!-- 柱状图区域 -->
									<view class="bars-area">
										<view
											class="bar-container"
											v-for="(bar, index) in chartConfig.bars"
											:key="index"
											:style="{
												left: bar.x + 'px',
												width: bar.width + 'px'
											}"
											@touchstart="onBarHover(index)"
											@touchend="onBarLeave()"
											@tap="onBarClick(bar, index)"
										>
											<!-- 柱子 - 添加极端值标识 -->
											<view
												class="bar-rect"
												:class="{
													'bar-active': hoveredBarIndex === index,
													'bar-extreme': bar.isExtreme
												}"
												:style="{
													height: bar.height + 'px',
													bottom: '0px'
												}"
											>
												<!-- 数值标签 - 防止溢出 -->
												<view
													class="bar-value-label"
													:class="{ 'label-extreme': bar.isExtreme }"
												>
													{{bar.value}}kg
												</view>
											</view>
										</view>
									</view>
								</view>

								<!-- X轴日期标签 - 精确对齐 -->
								<view class="x-axis-container" :style="{ width: chartConfig.chartWidth + 'px' }">
									<view
										class="x-tick"
										v-for="(label, index) in chartConfig.xLabels"
										:key="index"
										:style="{ left: label.x + 'px' }"
									>
										<text class="x-tick-label" :class="{ 'has-data': label.hasData }">{{label.date}}</text>
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
import localDataService from '@/utils/localDataService.js';

export default {
	// 注册全局导航组件
	components: {
		'global-nav': () => import('@/components/global-nav/global-nav.vue')
	},
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

			// 新的图表配置
			chartConfig: {
				hasData: false,
				yTicks: [],
				bars: [],
				chartHeight: 300,
				chartWidth: 600,
				barWidth: 60,
				minValue: 0,
				maxValue: 100
			},

			// 柱状图交互状态
			hoveredBarIndex: -1,

			// 响应式相关变量
			resizeHandler: null,
			resizeTimer: null,

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

		// 监听窗口尺寸变化，实现响应式图表
		this.setupResizeListener();
	},

	onHide() {
		// 页面隐藏时清理监听器
		this.cleanupResizeListener();
	},
	onLoad() {
		// 检查登录状态并同步数据
		this.checkLoginAndSync();
		this.loadPersonalRecords();
		this.loadRecentWorkouts();
		this.loadBodyWeightData();
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
			
			// 如果已登录，立即同步体重数据到服务器
			if (localDataService.isLoggedIn) {
				this.syncWeightDataToServer();
			}
			
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
			
			// 如果已登录，立即同步个人记录数据到服务器
			if (localDataService.isLoggedIn) {
				this.syncPersonalRecordsToServer();
			}
			
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
			const strengthProgressKey = this.getUserStorageKey('strengthProgress');
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

			if (!localDataService.isLoggedIn) {
				uni.showModal({
					title: '提示',
					content: '需要登录账号才能同步数据，是否前往登录？',
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
			if (localDataService.isLoggedIn) {
				this.syncStatus = {
					icon: '🔗',
					text: '服务器已连接',
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
					chartData: [],
					yAxisLabels: [],
					linePoints: '',
					dataPoints: []
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

			// 生成新的图表配置
			this.generateChartConfig(chartData);

			this.weightChangeInfo = {
				current: currentRecord.weight,
				change: change,
				date: currentRecord.date
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
					weight: record ? record.weight : null,
					hasData: !!record  // 标记是否有数据
				});
			}

			return chartData;
		},

		// 全新的图表配置生成方法 - 支持完整一周显示，动态适配容器
		generateChartConfig(chartData) {
			// 过滤有效数据用于计算Y轴范围
			const validData = chartData.filter(item => item.weight !== null);

			if (validData.length === 0) {
				this.chartConfig.hasData = false;
				return;
			}

			// 动态计算图表尺寸 - 基于容器响应式适配
			const containerWidth = this.getChartContainerWidth();
			const chartHeight = 280; // 增加高度，为数值标签留出更多空间
			const chartWidth = Math.max(containerWidth - 160, 400); // 减去Y轴和边距，最小400px
			const barWidth = Math.min(Math.max(chartWidth / 12, 40), 80); // 动态柱宽，范围40-80px
			const totalDays = 7;     // 固定显示7天
			const barSpacing = (chartWidth - totalDays * barWidth) / (totalDays + 1);

			// 智能计算Y轴范围 - 根据数据分布动态调整
			const weights = validData.map(item => item.weight);
			const minWeight = Math.min(...weights);
			const maxWeight = Math.max(...weights);
			const dataRange = maxWeight - minWeight;

			let yMin, yMax;
			if (dataRange < 2) {
				// 数据变化很小时，使用固定范围确保可视化效果
				const center = (minWeight + maxWeight) / 2;
				yMin = Math.max(0, Math.floor(center - 3));
				yMax = Math.ceil(center + 3);
			} else if (dataRange < 5) {
				// 数据变化适中时，适当扩大范围
				const center = (minWeight + maxWeight) / 2;
				const expandedRange = Math.max(dataRange * 1.5, 6);
				yMin = Math.max(0, Math.floor(center - expandedRange / 2));
				yMax = Math.ceil(center + expandedRange / 2);
			} else {
				// 数据变化较大时，添加合理边距
				const margin = dataRange * 0.2;
				yMin = Math.max(0, Math.floor(minWeight - margin));
				yMax = Math.ceil(maxWeight + margin);
			}

			// 智能生成Y轴刻度 - 根据数据范围调整刻度密度
			const yTicks = this.generateYAxisTicks(yMin, yMax, chartHeight);

			// 生成柱子和X轴标签配置 - 精确对齐
			const bars = [];
			const xLabels = [];

			chartData.forEach((item, index) => {
				const x = barSpacing + index * (barWidth + barSpacing);

				// 为所有日期生成X轴标签位置，确保精确居中对齐
				xLabels.push({
					x: x + barWidth / 2, // 标签居中位置
					date: item.dateLabel,
					hasData: item.hasData
				});

				// 只为有数据的日期生成柱子，确保高度计算准确
				if (item.weight !== null) {
					const heightRatio = (item.weight - yMin) / (yMax - yMin);
					const height = Math.max(heightRatio * chartHeight, 3); // 最小高度3px，确保可见

					bars.push({
						x: x,
						width: barWidth,
						height: height,
						value: item.weight,
						date: item.dateLabel,
						dayIndex: index,  // 记录是第几天
						isExtreme: this.isExtremeValue(item.weight, weights) // 标记极端值
					});
				}
			});

			// 更新图表配置，添加响应式参数
			this.chartConfig = {
				hasData: true,
				yTicks: yTicks,
				bars: bars,
				xLabels: xLabels,
				chartHeight: chartHeight,
				chartWidth: chartWidth,
				barWidth: barWidth,
				barSpacing: barSpacing,
				minValue: yMin,
				maxValue: yMax,
				dataRange: dataRange,
				containerWidth: containerWidth
			};

			console.log('优化后图表配置:', this.chartConfig);
		},

		// 新增：获取图表容器宽度的方法
		getChartContainerWidth() {
			// 在实际应用中，这里应该获取真实的容器宽度
			// 暂时使用估算值，基于60%卡片宽度
			const screenWidth = uni.getSystemInfoSync().screenWidth;
			const containerWidth = screenWidth * 0.8; // 80%页面宽度
			const cardWidth = containerWidth * 0.6; // 60%卡片宽度
			return cardWidth - 60; // 减去卡片内边距
		},

		// 新增：智能生成Y轴刻度的方法
		generateYAxisTicks(yMin, yMax, chartHeight) {
			const range = yMax - yMin;
			let tickCount = 6; // 默认6个刻度

			// 根据数据范围调整刻度数量
			if (range <= 5) {
				tickCount = Math.max(Math.ceil(range) + 1, 4); // 小范围时增加刻度密度
			} else if (range > 20) {
				tickCount = 8; // 大范围时适当增加刻度
			}

			const yTicks = [];
			for (let i = 0; i < tickCount; i++) {
				const value = yMin + (range * i) / (tickCount - 1);
				const position = (chartHeight * i) / (tickCount - 1);
				yTicks.push({
					value: Math.round(value * 10) / 10,
					position: position
				});
			}

			return yTicks;
		},

		// 新增：判断是否为极端值的方法
		isExtremeValue(value, allValues) {
			if (allValues.length < 3) return false;

			const sorted = [...allValues].sort((a, b) => a - b);
			const q1 = sorted[Math.floor(sorted.length * 0.25)];
			const q3 = sorted[Math.floor(sorted.length * 0.75)];
			const iqr = q3 - q1;

			return value < (q1 - 1.5 * iqr) || value > (q3 + 1.5 * iqr);
		},

		// 新增：设置响应式监听器
		setupResizeListener() {
			// 在小程序环境中，监听窗口尺寸变化
			if (typeof uni !== 'undefined' && uni.onWindowResize) {
				this.resizeHandler = () => {
					// 延迟执行，避免频繁更新
					clearTimeout(this.resizeTimer);
					this.resizeTimer = setTimeout(() => {
						this.handleResize();
					}, 300);
				};
				uni.onWindowResize(this.resizeHandler);
			}
		},

		// 新增：清理响应式监听器
		cleanupResizeListener() {
			if (this.resizeHandler && typeof uni !== 'undefined' && uni.offWindowResize) {
				uni.offWindowResize(this.resizeHandler);
			}
			if (this.resizeTimer) {
				clearTimeout(this.resizeTimer);
			}
		},

		// 新增：处理尺寸变化
		handleResize() {
			if (this.chartConfig.hasData) {
				// 重新生成图表配置以适应新的容器尺寸
				const weightHistoryKey = this.getUserStorageKey('weightHistory');
				const weightHistory = uni.getStorageSync(weightHistoryKey) || [];

				if (weightHistory.length > 0) {
					const chartData = this.getLast7DaysWeightData(weightHistory);
					this.generateChartConfig(chartData);
				}
			}
		},

		// 优化：增强的柱状图交互方法
		onBarHover(index) {
			this.hoveredBarIndex = index;
			// 添加触觉反馈（如果支持）
			if (typeof uni !== 'undefined' && uni.vibrateShort) {
				uni.vibrateShort({
					type: 'light'
				});
			}
		},

		onBarLeave() {
			this.hoveredBarIndex = -1;
		},

		onBarClick(bar, index) {
			console.log('点击柱状图:', bar, index);

			// 显示详细信息
			const changeText = this.getWeightChangeText(bar.value, index);
			uni.showToast({
				title: `${bar.date}: ${bar.value}kg${changeText}`,
				icon: 'none',
				duration: 2000
			});

			// 添加触觉反馈
			if (typeof uni !== 'undefined' && uni.vibrateShort) {
				uni.vibrateShort({
					type: 'medium'
				});
			}
		},

		// 新增：获取体重变化文本
		getWeightChangeText(currentWeight, index) {
			if (index === 0 || !this.chartConfig.bars[index - 1]) {
				return '';
			}

			const previousWeight = this.chartConfig.bars[index - 1].value;
			const change = currentWeight - previousWeight;

			if (Math.abs(change) < 0.1) {
				return ' (无变化)';
			}

			return change > 0 ? ` (+${change.toFixed(1)}kg)` : ` (${change.toFixed(1)}kg)`;
		},
		


		// 新的柱状图交互方法
		onBarHover(index) {
			this.hoveredBarIndex = index;
		},

		onBarLeave() {
			this.hoveredBarIndex = -1;
		},

		onBarClick(bar, index) {
			console.log('点击柱状图:', bar, index);
			uni.showToast({
				title: `${bar.date}: ${bar.value}kg`,
				icon: 'none',
				duration: 1500
			});
		},
		
		// 修复：检查登录状态并同步数据 - 使用安全的同步策略
		async checkLoginAndSync() {
			if (localDataService.isLoggedIn) {
				try {
					console.log('进度页面：开始同步数据...');

					// 使用安全的双向同步，避免覆盖最新的本地数据
					await localDataService.autoSync();

					// 同步完成后重新加载页面数据
					setTimeout(() => {
						this.loadPersonalRecords();
						this.loadRecentWorkouts();
						this.loadBodyWeightData();
					}, 500);

					console.log('进度页面：数据同步完成');
				} catch (error) {
					console.error('进度页面：数据同步失败:', error);
				}
			}
		},

		// 修复：推送本地数据到服务器 - 包含训练记录
		async pushLocalDataToServer() {
			try {
				console.log('推送本地数据到服务器...');

				// 同步训练记录数据（重要：这是之前缺失的）
				await localDataService.syncWorkoutHistory();
				console.log('训练记录推送完成');

				// 同步体重数据
				const weightHistoryKey = this.getUserStorageKey('weightHistory');
				const bodyWeightKey = this.getUserStorageKey('bodyWeight');
				const weightHistory = uni.getStorageSync(weightHistoryKey) || [];

				// 如果有体重数据，先同步到bodyWeight键下
				if (weightHistory.length > 0) {
					uni.setStorageSync(bodyWeightKey, weightHistory);
					await localDataService.syncBodyWeight();
				}

				// 同步个人记录数据
				await localDataService.syncPersonalRecords();

				// 同步健身计划数据
				await localDataService.syncPlans();

				// 同步每日计划数据（本周训练计划）
				await localDataService.syncDailyPlans();
				console.log('每日计划推送完成');

				console.log('本地数据推送完成');
			} catch (error) {
				console.error('推送本地数据失败:', error);
			}
		},

		// 新增：同步体重数据到服务器
		async syncWeightDataToServer() {
			try {
				console.log('开始同步体重数据到服务器...');

				// 先将weightHistory数据转换为bodyWeight格式并同步到localDataService的存储键
				const weightHistoryKey = this.getUserStorageKey('weightHistory');
				const bodyWeightKey = this.getUserStorageKey('bodyWeight');
				const weightHistory = uni.getStorageSync(weightHistoryKey) || [];

				// 将weightHistory格式的数据保存到bodyWeight键下，以便localDataService能够读取
				uni.setStorageSync(bodyWeightKey, weightHistory);

				const result = await localDataService.syncBodyWeight();

				if (result.success) {
					console.log('体重数据同步成功');
				} else {
					console.error('体重数据同步失败:', result.message);
				}
			} catch (error) {
				console.error('体重数据同步异常:', error);
			}
		},

		// 新增：同步个人记录数据到服务器
		async syncPersonalRecordsToServer() {
			try {
				console.log('开始同步个人记录数据到服务器...');
				const result = await localDataService.syncPersonalRecords();
				
				if (result.success) {
					console.log('个人记录数据同步成功');
				} else {
					console.error('个人记录数据同步失败:', result.message);
				}
			} catch (error) {
				console.error('个人记录数据同步异常:', error);
			}
		},

		// 新增：用于加载个人记录的方法（兼容性）
		loadPersonalRecords() {
			this.updatePersonalRecordsWithManualData();
		},

		// 新增：用于加载最近训练的方法（兼容性）
		loadRecentWorkouts() {
			this.loadWeeklyBodyParts();
		},

		// 新增：用于加载体重数据的方法（兼容性）
		loadBodyWeightData() {
			// 同步bodyWeight数据到weightHistory，确保数据一致性
			const bodyWeightKey = this.getUserStorageKey('bodyWeight');
			const weightHistoryKey = this.getUserStorageKey('weightHistory');
			const bodyWeight = uni.getStorageSync(bodyWeightKey) || [];
			const weightHistory = uni.getStorageSync(weightHistoryKey) || [];

			// 如果bodyWeight有数据而weightHistory没有，或者bodyWeight数据更新，则同步
			if (bodyWeight.length > 0 && (weightHistory.length === 0 ||
				JSON.stringify(bodyWeight) !== JSON.stringify(weightHistory))) {
				console.log('同步bodyWeight数据到weightHistory');
				uni.setStorageSync(weightHistoryKey, bodyWeight);
			}

			this.loadWeightChangeInfo();
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
		flex: 1; /* 默认等分 */
	}

	/* 体重变化卡片占用60%空间 */
	.card.stat-card:first-child {
		flex: 6; /* 占用6份空间 */
	}

	/* 本周锻炼部位卡片占用40%空间 */
	.card.weekly-body-parts {
		flex: 4; /* 占用4份空间 */
		min-width: 300rpx; /* 确保内容可读 */
	}

	@media screen and (max-width: 768px) {
		flex-direction: column;

		.card.stat-card:first-child,
		.card.weekly-body-parts {
			flex: none; /* 移动端取消flex比例 */
		}
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

/* 新的柱状图样式 - 使用flex布局确保对齐 */
.bar-chart-new {
	width: 100%;
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 20rpx;
	box-sizing: border-box;
	border: 1rpx solid #e5e7eb;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	display: flex;
	align-items: stretch;
}

.chart-container {
	display: flex;
	height: 300rpx;
	position: relative;
}

.y-axis {
	width: 60rpx;
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding-right: 10rpx;
}

.y-axis-label {
	position: absolute;
	right: 10rpx;
	font-size: 20rpx;
	color: #6b7280;
	transform: translateY(50%);
	white-space: nowrap;
}

.chart-area {
	flex: 1;
	position: relative;
	margin-left: 10rpx;
}

.grid-lines {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

.grid-line {
	position: absolute;
	left: 0;
	right: 0;
	height: 1rpx;
	background-color: #f1f5f9;
}

// 柱状图容器
.bars-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 2;
}

// 单个柱状图项
.bar-item {
	position: absolute;
	bottom: 0;
	cursor: pointer;
	transition: all 0.3s ease;
}

// 柱子样式
.bar {
	width: 100%;
	height: 100%;
	background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
	border-radius: 4rpx 4rpx 0 0;
	position: relative;
	transition: all 0.3s ease;
	box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.3);

	&:hover,
	&.bar-hover {
		background: linear-gradient(180deg, #2563eb 0%, #1e40af 100%);
		transform: scale(1.05);
		box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.5);
	}
}

// 柱子上的数值标签
.bar-value {
	position: absolute;
	top: -30rpx;
	left: 50%;
	transform: translateX(-50%);
	font-size: 20rpx;
	font-weight: bold;
	color: var(--primary-color);
	background-color: rgba(255, 255, 255, 0.95);
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
	white-space: nowrap;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
	border: 1rpx solid #e5e7eb;
	z-index: 10;
}

.x-axis {
	position: relative;
	margin-top: 15rpx;
	padding-left: 70rpx;
	height: 40rpx;
}

.x-axis-label {
	font-size: 22rpx;
	color: #6b7280;
	font-weight: 500;
	text-align: center;
	white-space: nowrap;
	width: auto;
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

// 移动端适配
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

	// 移动端柱状图优化
	.bar-chart {
		padding: 15rpx;
	}

	.chart-container {
		height: 250rpx;
	}

	.bar-value {
		font-size: 18rpx;
		top: -25rpx;
		padding: 2rpx 6rpx;
	}

	.y-axis-label {
		font-size: 18rpx;
	}

	.x-axis-label {
		font-size: 20rpx;
	}

	// 移动端触摸交互优化
	.bar-item {
		// 增加触摸区域
		&::before {
			content: '';
			position: absolute;
			top: -20rpx;
			left: -10rpx;
			right: -10rpx;
			bottom: -10rpx;
			z-index: -1;
		}
	}
}

/* 体重卡片样式优化 */
.weight-card {
	.stat-card-title {
		margin-bottom: 30rpx;
	}
}

/* 当前体重信息区域 */
.current-weight-section {
	margin-bottom: 30rpx;
	padding: 25rpx;
	background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
	border-radius: 12rpx;
	border: 1rpx solid #e2e8f0;
}

.weight-info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20rpx;
}

.weight-main-info {
	flex: 1;
	min-width: 200rpx;
}

.weight-label {
	font-size: 26rpx;
	color: #64748b;
	font-weight: 500;
	display: block;
	margin-bottom: 8rpx;
}

.weight-value-container {
	display: flex;
	align-items: baseline;
	gap: 12rpx;
	flex-wrap: wrap;
}

.weight-value {
	font-size: 36rpx;
	font-weight: 700;
	color: #1e293b;
	line-height: 1.2;
}

.weight-change {
	font-size: 24rpx;
	font-weight: 600;
	padding: 4rpx 8rpx;
	border-radius: 6rpx;
	line-height: 1;

	&.weight-increase {
		color: #dc2626;
		background-color: rgba(220, 38, 38, 0.1);
	}

	&.weight-decrease {
		color: #16a34a;
		background-color: rgba(22, 163, 74, 0.1);
	}

	&.weight-stable {
		color: #64748b;
		background-color: rgba(100, 116, 139, 0.1);
	}
}

.weight-date-info {
	text-align: right;
}

.weight-date {
	font-size: 24rpx;
	color: #64748b;
	font-weight: 500;
}

/* 图表区域样式 */
.weight-chart-section {
	margin-top: 25rpx;
}

.chart-section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #374151;
	margin-bottom: 20rpx;
	display: block;
}

/* 响应式图表容器 */
.responsive-chart-container {
	width: 100%;
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 50rpx 30rpx 30rpx 30rpx;
	box-sizing: border-box;
	border: 1rpx solid #e5e7eb;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	position: relative;
	overflow: visible;
	min-height: 350rpx;
}

/* Y轴容器 - 响应式 */
.y-axis-container {
	position: absolute;
	left: 30rpx;
	top: 50rpx;
	width: 80rpx;
	z-index: 5;
}

.y-tick {
	position: absolute;
	left: 0;
	width: 70rpx;
	height: 20rpx;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.y-tick-label {
	font-size: 20rpx;
	color: #6b7280;
	font-weight: 500;
	margin-right: 8rpx;
}

.y-tick-line {
	width: 6rpx;
	height: 1rpx;
	background-color: #d1d5db;
}

/* 图表主区域 - 动态尺寸 */
.chart-main-area {
	margin-left: 120rpx;
	margin-right: 30rpx;
	position: relative;
	border-left: 2rpx solid #e5e7eb;
	border-bottom: 2rpx solid #e5e7eb;
	overflow: visible;
	background-color: #fafbfc;
}

/* 背景网格 */
.chart-grid {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

.grid-line {
	position: absolute;
	left: 0;
	right: 0;
	height: 1rpx;
	background-color: #f1f5f9;
	opacity: 0.8;
}

/* 柱状图区域 */
.bars-area {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10;
}

.bar-container {
	position: absolute;
	bottom: 0;
	cursor: pointer;
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.98);
	}
}

.bar-rect {
	width: 100%;
	background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
	border-radius: 8rpx 8rpx 0 0;
	position: relative;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 3rpx 10rpx rgba(59, 130, 246, 0.3);

	&.bar-active {
		background: linear-gradient(180deg, #2563eb 0%, #1e40af 100%);
		transform: scale(1.05);
		box-shadow: 0 8rpx 25rpx rgba(59, 130, 246, 0.5);
		z-index: 15;
	}

	&.bar-extreme {
		background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
		box-shadow: 0 3rpx 10rpx rgba(245, 158, 11, 0.4);

		&.bar-active {
			background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
			box-shadow: 0 8rpx 25rpx rgba(245, 158, 11, 0.6);
		}
	}
}

.bar-value-label {
	position: absolute;
	top: -45rpx;
	left: 50%;
	transform: translateX(-50%);
	font-size: 20rpx;
	font-weight: 600;
	color: #1f2937;
	background-color: rgba(255, 255, 255, 0.95);
	padding: 6rpx 10rpx;
	border-radius: 8rpx;
	white-space: nowrap;
	box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.15);
	border: 1rpx solid #e5e7eb;
	z-index: 20;
	transition: all 0.3s ease;
	backdrop-filter: blur(4rpx);

	&.label-extreme {
		background-color: rgba(245, 158, 11, 0.95);
		color: white;
		border-color: #f59e0b;
	}
}

.bar-active .bar-value-label {
	background-color: #3b82f6;
	color: white;
	border-color: #3b82f6;
	transform: translateX(-50%) translateY(-6rpx);
	box-shadow: 0 4rpx 15rpx rgba(59, 130, 246, 0.4);
}

/* X轴容器 - 精确对齐 */
.x-axis-container {
	margin-left: 120rpx;
	margin-right: 30rpx;
	position: relative;
	height: 50rpx;
	margin-top: 20rpx;
}

.x-tick {
	position: absolute;
	transform: translateX(-50%);
	display: flex;
	justify-content: center;
	align-items: center;
}

.x-tick-label {
	font-size: 22rpx;
	color: #9ca3af;
	font-weight: 400;
	text-align: center;
	white-space: nowrap;
	transition: all 0.3s ease;
	padding: 4rpx 8rpx;
	border-radius: 4rpx;

	&.has-data {
		color: #374151;
		font-weight: 600;
		background-color: rgba(59, 130, 246, 0.1);
	}
}

/* 移动端响应式适配 */
@media screen and (max-width: 768px) {
	.content-container {
		width: 95%;
		padding: 20rpx;
	}

	.top-row {
		flex-direction: column;
		gap: 20rpx;

		.card.stat-card:first-child,
		.card.weekly-body-parts {
			flex: none;
		}
	}

	/* 体重卡片移动端优化 */
	.current-weight-section {
		padding: 20rpx;
	}

	.weight-info-row {
		flex-direction: column;
		align-items: flex-start;
		gap: 15rpx;
	}

	.weight-value {
		font-size: 32rpx;
	}

	.weight-change {
		font-size: 22rpx;
	}

	.weight-date-info {
		text-align: left;
		width: 100%;
	}

	/* 图表容器移动端适配 */
	.responsive-chart-container {
		padding: 40rpx 20rpx 25rpx 20rpx;
		min-height: 320rpx;
	}

	.y-axis-container {
		width: 70rpx;
		left: 20rpx;
		top: 40rpx;
	}

	.y-tick {
		width: 60rpx;
	}

	.y-tick-label {
		font-size: 18rpx;
		margin-right: 6rpx;
	}

	.chart-main-area {
		margin-left: 100rpx;
		margin-right: 20rpx;
	}

	.bar-value-label {
		font-size: 18rpx;
		top: -38rpx;
		padding: 4rpx 6rpx;
	}

	.x-axis-container {
		margin-left: 100rpx;
		margin-right: 20rpx;
		height: 45rpx;
		margin-top: 15rpx;
	}

	.x-tick-label {
		font-size: 20rpx;
		padding: 3rpx 6rpx;
	}

	.chart-section-title {
		font-size: 26rpx;
		margin-bottom: 15rpx;
	}
}

/* 超小屏幕适配 */
@media screen and (max-width: 480px) {
	.responsive-chart-container {
		padding: 35rpx 15rpx 20rpx 15rpx;
		min-height: 280rpx;
	}

	.y-axis-container {
		width: 60rpx;
		left: 15rpx;
		top: 35rpx;
	}

	.y-tick {
		width: 50rpx;
	}

	.y-tick-label {
		font-size: 16rpx;
		margin-right: 4rpx;
	}

	.chart-main-area {
		margin-left: 85rpx;
		margin-right: 15rpx;
	}

	.bar-value-label {
		font-size: 16rpx;
		top: -32rpx;
		padding: 3rpx 5rpx;
	}

	.x-axis-container {
		margin-left: 85rpx;
		margin-right: 15rpx;
		height: 40rpx;
		margin-top: 12rpx;
	}

	.x-tick-label {
		font-size: 18rpx;
		padding: 2rpx 4rpx;
	}

	.weight-value {
		font-size: 28rpx;
	}

	.weight-change {
		font-size: 20rpx;
	}
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
	.bar-container {
		/* 增加触摸区域 */
		&::before {
			content: '';
			position: absolute;
			top: -30rpx;
			left: -15rpx;
			right: -15rpx;
			bottom: -15rpx;
			z-index: -1;
		}
	}

	.bar-rect {
		/* 触摸反馈优化 */
		&:active {
			transform: scale(1.02);
		}
	}
}
</style>