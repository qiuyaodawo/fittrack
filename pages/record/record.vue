<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item" @tap="navigateTo('index')">首页</view>
				<view class="nav-item" @tap="navigateTo('history')">记录</view>
				<view class="nav-item" @tap="navigateTo('progress')">进度追踪</view>
				<view class="nav-item" @tap="navigateTo('plans')">健身计划</view>
				<view class="nav-item" @tap="navigateTo('workouts')">训练数据库</view>
			</view>
			<view class="nav-actions">
				<button class="btn-sm btn-success" @tap="saveWorkout" :disabled="!hasExercises">保存训练</button>
			</view>
		</view>
		
		<view class="content-container">
			<!-- 训练信息卡片 -->
			<view class="card workout-info">
				<text class="section-title">训练信息</text>
				<view class="form-group">
					<text class="form-label">训练名称</text>
					<input type="text" class="input" v-model="workoutInfo.name" placeholder="输入训练名称（如：胸肌训练）" />
				</view>
				<view class="form-group">
					<text class="form-label">训练类型</text>
					<picker :value="workoutTypeIndex" :range="workoutTypes" @change="onWorkoutTypeChange">
						<view class="picker-value">{{workoutTypes[workoutTypeIndex]}}</view>
					</picker>
				</view>
			</view>
			
			<!-- 添加动作按钮 -->
			<view class="add-exercise-section">
				<button class="btn btn-primary" @tap="showAddExerciseModal">
					<text class="add-icon">+</text>
					添加动作
				</button>
			</view>
			
			<!-- 已添加的动作列表 -->
			<view class="exercises-list" v-if="selectedExercises.length > 0">
				<view class="card exercise-card" v-for="(exercise, index) in selectedExercises" :key="index">
					<view class="exercise-header">
						<text class="exercise-name">{{exercise.name}}</text>
						<view class="exercise-actions">
							<text class="edit-btn" @tap="editExercise(index)">编辑</text>
							<text class="delete-btn" @tap="removeExercise(index)">删除</text>
						</view>
					</view>
					
					<!-- 组数设置 -->
					<view class="sets-container">
						<view class="sets-header">
							<view class="sets-title-group">
								<text class="sets-title">组数设置</text>
								<view class="sets-selector">
									<button class="sets-btn decrease" @tap="decreaseSets(index)" :disabled="getSetCountValue(index) <= 1">
										<text class="btn-icon">−</text>
									</button>
									<input 
										type="number" 
										class="sets-input" 
										v-model="setCountInputs[index]" 
										@input="validateSetCountInput(index)"
										@blur="validateSetCountInput(index)"
										placeholder="组数"
										min="1"
										max="99"
									/>
									<text class="sets-unit">组</text>
									<button class="sets-btn increase" @tap="increaseSets(index)" :disabled="getSetCountValue(index) >= 99">
										<text class="btn-icon">+</text>
									</button>
								</view>
							</view>
						</view>
						
						<view class="sets-config">
							<view class="config-item">
								<text class="config-label">重量(kg)</text>
								<input type="digit" class="input-sm" v-model="exercise.weight" placeholder="重量" />
							</view>
							<view class="config-item">
								<text class="config-label">次数</text>
								<input type="number" class="input-sm" v-model="exercise.reps" placeholder="次数" />
							</view>
							<view class="config-item">
								<text class="config-label">间隔(秒)</text>
								<input type="number" class="input-sm" v-model="exercise.rest" placeholder="间隔" />
							</view>
						</view>
					</view>
					
					<!-- 备注 -->
					<view class="exercise-notes">
						<text class="form-label">备注</text>
						<textarea class="textarea" v-model="exercise.notes" placeholder="输入训练备注（可选）"></textarea>
					</view>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view class="empty-state" v-if="selectedExercises.length === 0">
				<view class="empty-icon">💪</view>
				<text class="empty-text">还没有添加任何动作</text>
				<text class="empty-desc">点击上方"添加动作"按钮开始记录训练</text>
			</view>
		</view>
		
		<!-- 选择动作弹窗 -->
		<view class="modal" v-if="showExerciseModal" @tap.self="closeExerciseModal">
			<view class="modal-content large-modal">
				<view class="modal-header">
					<text class="modal-title">选择动作</text>
					<view class="modal-close" @tap="closeExerciseModal">×</view>
				</view>
				
				<view class="modal-body">
					<!-- 搜索框 -->
					<view class="search-section">
						<input type="text" class="input search-input" v-model="exerciseSearchKeyword" placeholder="搜索动作名称..." />
					</view>
					
					<!-- 分类筛选 -->
					<view class="filter-tags">
						<view 
							class="filter-tag" 
							:class="{'active-tag': activeExerciseFilter === tag.id}"
							v-for="tag in exerciseFilterTags" 
							:key="tag.id"
							@tap="setExerciseFilter(tag.id)"
						>
							{{tag.name}}
						</view>
					</view>
					
					<!-- 动作列表 -->
					<view class="exercise-options">
						<view 
							class="exercise-option" 
							v-for="exercise in filteredExercises" 
							:key="exercise.id"
							@tap="selectExercise(exercise)"
						>
							<view class="exercise-info">
								<text class="exercise-option-name">{{exercise.name}}</text>
								<text class="exercise-option-desc">{{exercise.description}}</text>
								<view class="exercise-tags">
									<view class="tag" v-for="tag in exercise.tags" :key="tag">{{tag}}</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import cloudDataService from '@/utils/cloudDataService.js';
import localDataService from '@/utils/localDataService.js';

export default {
	data() {
		return {
			// 训练基本信息
			workoutInfo: {
				name: '',
				date: ''
			},
			workoutTypeIndex: 0,
			workoutTypes: ['力量训练', '有氧训练', 'HIIT', '拉伸恢复', '功能性训练'],
			
			// 选中的动作列表
			selectedExercises: [],
			
			// 组数输入控制
			setCountInputs: {}, // 存储每个动作的组数输入值
			
			// 弹窗控制
			showExerciseModal: false,
			editingExerciseIndex: -1,
			
			// 动作搜索和筛选
			exerciseSearchKeyword: '',
			activeExerciseFilter: 'all',
			exerciseFilterTags: [
				{ id: 'all', name: '全部' },
				{ id: 'chest', name: '胸部' },
				{ id: 'back', name: '背部' },
				{ id: 'legs', name: '腿部' },
				{ id: 'shoulders', name: '肩部' },
				{ id: 'arms', name: '手臂' },
				{ id: 'core', name: '核心' }
			],
			
			// 动作数据库（与健身计划同步）
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
					description: '经典的腹部训练动作，主要锻炼腹直肌上部',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 36,
					name: '俄罗斯转体',
					description: '坐姿进行的旋转动作，主要锻炼腹斜肌',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 37,
					name: '登山者',
					description: '动态的核心训练动作，同时具有有氧训练效果',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 38,
					name: '死虫',
					description: '仰卧进行的对侧手脚协调动作，训练核心稳定性',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 39,
					name: '鸟狗式',
					description: '四点支撑的对侧手脚伸展动作，训练核心稳定性',
					tags: ['核心', '自重'],
					category: 'core'
				}
			]
		}
	},
	computed: {
		hasExercises() {
			return this.selectedExercises.length > 0;
		},
		filteredExercises() {
			let result = this.exerciseDatabase;
			
			// 关键词搜索过滤
			if (this.exerciseSearchKeyword) {
				const keyword = this.exerciseSearchKeyword.toLowerCase();
				result = result.filter(exercise => 
					exercise.name.toLowerCase().includes(keyword) || 
					exercise.description.toLowerCase().includes(keyword)
				);
			}
			
			// 分类过滤
			if (this.activeExerciseFilter !== 'all') {
				result = result.filter(exercise => exercise.category === this.activeExerciseFilter);
			}
			
			return result;
		}
	},
	onLoad() {
		// 设置当前日期
		const now = new Date();
		this.workoutInfo.date = now.toISOString().split('T')[0];
	},
	methods: {
		navigateTo(page) {
			uni.reLaunch({
				url: `/pages/${page}/${page}`
			});
		},
		
		// 训练信息相关方法
		onWorkoutTypeChange(e) {
			this.workoutTypeIndex = e.detail.value;
		},
		
		// 动作管理方法
		showAddExerciseModal() {
			this.editingExerciseIndex = -1;
			this.showExerciseModal = true;
			this.exerciseSearchKeyword = '';
			this.activeExerciseFilter = 'all';
		},
		closeExerciseModal() {
			this.showExerciseModal = false;
		},
		setExerciseFilter(filterId) {
			this.activeExerciseFilter = filterId;
		},
		selectExercise(exercise) {
			const newExercise = {
				id: exercise.id,
				name: exercise.name,
				description: exercise.description,
				category: exercise.category,
				setsCount: 3, // 默认3组
				weight: '',
				reps: '',
				rest: '90',
				notes: ''
			};
			
			this.selectedExercises.push(newExercise);
			
			// 初始化该动作的组数输入框
			const exerciseIndex = this.selectedExercises.length - 1;
			this.$set(this.setCountInputs, exerciseIndex, '3');
			
			this.closeExerciseModal();
			
			uni.showToast({
				title: '动作添加成功',
				icon: 'success'
			});
		},
		
		// 组数管理方法
		
		// 验证组数输入
		validateSetCountInput(exerciseIndex) {
			let value = this.setCountInputs[exerciseIndex];
			if (value !== undefined && value !== null) {
				// 只允许数字
				value = value.toString().replace(/[^\d]/g, '');
				// 限制在1-99之间
				if (value !== '') {
					const num = parseInt(value);
					if (num < 1) {
						value = '1';
					} else if (num > 99) {
						value = '99';
					}
					
					// 更新动作的组数
					const exercise = this.selectedExercises[exerciseIndex];
					exercise.setsCount = parseInt(value);
				}
				this.$set(this.setCountInputs, exerciseIndex, value);
			}
		},
		
		// 获取组数输入值
		getSetCountValue(exerciseIndex) {
			const exercise = this.selectedExercises[exerciseIndex];
			return exercise ? exercise.setsCount : 1;
		},
		
		// 减少组数
		decreaseSets(exerciseIndex) {
			const exercise = this.selectedExercises[exerciseIndex];
			if (exercise.setsCount > 1) {
				exercise.setsCount--;
				// 更新输入框显示
				this.$set(this.setCountInputs, exerciseIndex, exercise.setsCount.toString());
			}
		},
		
		// 增加组数
		increaseSets(exerciseIndex) {
			const exercise = this.selectedExercises[exerciseIndex];
			if (exercise.setsCount < 99) {
				exercise.setsCount++;
				// 更新输入框显示
				this.$set(this.setCountInputs, exerciseIndex, exercise.setsCount.toString());
			}
		},
		

		
		// 动作编辑和删除
		editExercise(index) {
			uni.showToast({
				title: '编辑功能开发中',
				icon: 'none'
			});
		},
		removeExercise(index) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这个动作吗？',
				success: (res) => {
					if (res.confirm) {
						this.selectedExercises.splice(index, 1);
						
						// 清理对应的组数输入框数据，并重新整理索引
						const newSetCountInputs = {};
						Object.keys(this.setCountInputs).forEach(key => {
							const keyIndex = parseInt(key);
							if (keyIndex < index) {
								newSetCountInputs[keyIndex] = this.setCountInputs[key];
							} else if (keyIndex > index) {
								newSetCountInputs[keyIndex - 1] = this.setCountInputs[key];
							}
						});
						this.setCountInputs = newSetCountInputs;
						
						uni.showToast({
							title: '动作已删除',
							icon: 'success'
						});
					}
				}
			});
		},
				// 保存训练
		async saveWorkout() {
			// 验证表单
			if (!this.workoutInfo.name) {
				uni.showToast({
					title: '请输入训练名称',
					icon: 'none'
				});
				return;
			}
			
			if (this.selectedExercises.length === 0) {
				uni.showToast({
					title: '请至少添加一个动作',
					icon: 'none'
				});
				return;
			}
			
			// 验证每个动作的数据
			let hasInvalidData = false;
			this.selectedExercises.forEach(exercise => {
				if (!exercise.weight || !exercise.reps) {
					hasInvalidData = true;
				}
			});
			
			if (hasInvalidData) {
				uni.showToast({
					title: '请完善所有动作的重量和次数',
					icon: 'none'
				});
				return;
			}
			
			// 显示保存中状态
			uni.showLoading({
				title: '保存中...'
			});
			
			try {
				// 构造训练记录数据，将新格式转换为标准格式
				const now = new Date();
				const convertedExercises = this.selectedExercises.map(exercise => {
					// 根据组数创建sets数组
					const sets = [];
					for (let i = 0; i < exercise.setsCount; i++) {
						sets.push({
							weight: exercise.weight,
							reps: exercise.reps,
							rest: exercise.rest
						});
					}
					
					return {
						...exercise,
						sets: sets
					};
				});
				
				const workoutData = {
					id: Date.now(),
					name: this.workoutInfo.name,
					type: this.workoutTypes[this.workoutTypeIndex],
					date: this.workoutInfo.date,
					startTime: now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'),
					exercises: convertedExercises,
					status: '已完成',
					duration: this.calculateDuration()
				};
				
				// 保存到本地存储
				let workoutHistory = uni.getStorageSync('workoutHistory') || [];
				workoutHistory.unshift(workoutData);
				uni.setStorageSync('workoutHistory', workoutHistory);
				
				// 检查并更新个人记录
				this.checkForNewRecords(workoutData);
				
				// 尝试同步到本地服务器
				if (localDataService.isLoggedIn) {
					try {
						await localDataService.syncWorkoutHistory();
						console.log('训练记录已同步到本地服务器');
					} catch (syncError) {
						console.error('本地服务器同步失败，但数据已保存到本地:', syncError);
						// 同步失败不影响本地保存
					}
				}
				
				uni.hideLoading();
				uni.showToast({
					title: '训练记录保存成功',
					icon: 'success',
					duration: 2000
				});
				
				// 2秒后返回首页
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}, 2000);
				
			} catch (error) {
				uni.hideLoading();
				console.error('保存训练记录失败:', error);
				uni.showToast({
					title: '保存失败，请重试',
					icon: 'none'
				});
			}
		},
		
		// 计算训练时长
		calculateDuration() {
			let totalTime = 0;
			this.selectedExercises.forEach(exercise => {
				const setsCount = exercise.setsCount || 1;
				const restTime = parseInt(exercise.rest) || 90;
				
				// 每组假设需要30秒执行时间
				totalTime += setsCount * 30;
				// 加上组间休息时间（组数-1次休息）
				totalTime += (setsCount - 1) * restTime;
				// 动作间休息2分钟
				totalTime += 120;
			});
			
			// 转换为分钟
			return Math.round(totalTime / 60) + ' 分钟';
		},
		
		// 检查是否有新的个人记录
		checkForNewRecords(workoutData) {
			const savedRecords = uni.getStorageSync('personalRecords') || {};
			let newRecords = [];
			
			// 动作名称映射（与进度页面保持一致）
			const exerciseMapping = {
				'杠铃卧推': '卧推',
				'哑铃卧推': '卧推',
				'上斜卧推': '卧推',
				'下斜卧推': '卧推',
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
				'腿举': '腿举',
				'罗马尼亚硬拉': '硬拉',
				'硬拉': '硬拉',
				'杠铃肩推': '肩推',
				'哑铃肩推': '肩推',
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
				'鸟狗式': '鸟狗式'
			};
			
			workoutData.exercises.forEach(exercise => {
				const standardName = exerciseMapping[exercise.name];
				if (standardName) {
					exercise.sets.forEach(set => {
						const weight = parseFloat(set.weight);
						if (!isNaN(weight) && weight > 0) {
							const currentRecord = savedRecords[standardName];
							if (!currentRecord || weight > currentRecord.weight) {
								newRecords.push({
									exercise: standardName,
									weight: weight,
									previousWeight: currentRecord ? currentRecord.weight : 0
								});
								
								// 更新保存的记录
								savedRecords[standardName] = {
									weight: weight,
									date: workoutData.date
								};
							}
						}
					});
				}
			});
			
			// 保存更新的记录
			if (newRecords.length > 0) {
				uni.setStorageSync('personalRecords', savedRecords);
				
				// 显示新记录通知
				let message = '恭喜！创造了新个人记录：\n';
				newRecords.forEach(record => {
					const improvement = record.previousWeight > 0 ? 
						` (+${(record.weight - record.previousWeight).toFixed(1)}kg)` : '';
					message += `${record.exercise}: ${record.weight}kg${improvement}\n`;
				});
				
				setTimeout(() => {
					uni.showModal({
						title: '🏆 新个人记录！',
						content: message,
						showCancel: false,
						confirmText: '太棒了！'
					});
				}, 2500); // 在保存成功提示后显示
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
	border-radius: 8rpx;
	border: none;
}

.btn-success {
	background-color: var(--success-color);
	color: #fff;
	
	&:disabled {
		background-color: #ccc;
		color: #666;
	}
}

.content-container {
	width: 90%;
	margin: 0 auto;
	padding: 30rpx;
}

.workout-info {
	margin-bottom: 30rpx;
}

.form-group {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	font-weight: 500;
	margin-bottom: 15rpx;
	display: block;
	color: var(--text-color);
}

.picker-value {
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 24rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	background-color: #fff;
}

.add-exercise-section {
	margin-bottom: 40rpx;
	text-align: center;
}

.add-icon {
	font-size: 36rpx;
	margin-right: 10rpx;
}

// 动作卡片样式
.exercise-card {
	margin-bottom: 30rpx;
	padding: 30rpx;
}

.exercise-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid var(--border-color);
}

.exercise-name {
	font-size: 32rpx;
	font-weight: bold;
	color: var(--text-color);
}

.exercise-actions {
	display: flex;
	gap: 20rpx;
}

.edit-btn {
	color: var(--primary-color);
	font-size: 26rpx;
}

.delete-btn {
	color: var(--error-color);
	font-size: 26rpx;
}

// 组数设置样式
.sets-container {
	margin-bottom: 30rpx;
}

.sets-header {
	margin-bottom: 20rpx;
}

.sets-title-group {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.sets-selector {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	background: #f8f9fa;
	padding: 12rpx;
	border-radius: 12rpx;
	border: 2rpx solid #e9ecef;
}

.sets-btn {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	border: none;
	font-size: 28rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
	box-shadow: 0 3rpx 8rpx rgba(0, 0, 0, 0.1);
}

.sets-btn.decrease {
	background: linear-gradient(135deg, #ff6b6b, #ee5a52);
	color: white;
}

.sets-btn.increase {
	background: linear-gradient(135deg, #51cf66, #40c057);
	color: white;
}

.sets-btn:hover {
	transform: scale(1.05);
	box-shadow: 0 5rpx 12rpx rgba(0, 0, 0, 0.15);
}

.sets-btn:disabled {
	background: #e9ecef !important;
	color: #adb5bd !important;
	transform: none !important;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05) !important;
	cursor: not-allowed;
}

.btn-icon {
	font-size: 24rpx;
	font-weight: bold;
}

.sets-input {
	width: 100rpx;
	height: 60rpx;
	text-align: center;
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	background: white;
	border: 2rpx solid #dee2e6;
	border-radius: 8rpx;
	box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s;
}

.sets-input:focus {
	border-color: var(--primary-color);
	box-shadow: 0 0 0 3rpx rgba(59, 130, 246, 0.1);
	outline: none;
}

.sets-unit {
	font-size: 24rpx;
	font-weight: 500;
	color: #666;
	min-width: 30rpx;
}

.sets-config {
	display: flex;
	gap: 20rpx;
	flex-wrap: wrap;
}

.config-item {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 180rpx;
}

.config-label {
	font-size: 24rpx;
	color: var(--text-color-light);
	margin-bottom: 8rpx;
}

.sets-title {
	font-size: 28rpx;
	font-weight: 500;
	color: var(--text-color);
}

.btn-outline {
	background-color: transparent;
	border: 2rpx solid var(--primary-color);
	color: var(--primary-color);
}

.set-item {
	margin-bottom: 20rpx;
	padding: 20rpx;
	background-color: #f8fafc;
	border-radius: 8rpx;
}

.set-label {
	font-size: 26rpx;
	font-weight: 500;
	margin-bottom: 15rpx;
	color: var(--text-color-light);
}

.set-inputs {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.input-group {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.input-label {
	font-size: 24rpx;
	color: var(--text-color-light);
	margin-bottom: 8rpx;
}

.input-sm {
	height: 60rpx;
	padding: 0 15rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 6rpx;
	font-size: 26rpx;
}

.set-actions {
	display: flex;
	align-items: center;
}

.remove-set-btn {
	color: var(--error-color);
	font-size: 24rpx;
}

.exercise-notes {
	margin-top: 20rpx;
}

.textarea {
	width: 100%;
	min-height: 100rpx;
	padding: 15rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	font-size: 26rpx;
}

// 空状态样式
.empty-state {
	text-align: center;
	padding: 100rpx 40rpx;
}

.empty-icon {
	font-size: 80rpx;
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
	display: block;
}

// 弹窗样式
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

.modal-content {
	background-color: #fff;
	border-radius: 16rpx;
	width: 90%;
	max-height: 80%;
	overflow: hidden;
}

.large-modal {
	width: 95%;
	max-height: 95%;
	height: 95%;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 2rpx solid var(--border-color);
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
}

.modal-close {
	font-size: 40rpx;
	color: var(--text-color-light);
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-body {
	padding: 30rpx;
	max-height: calc(95vh - 200rpx);
	overflow-y: auto;
}

.search-section {
	margin-bottom: 30rpx;
}

.search-input {
	width: 100%;
	height: 80rpx;
	margin-bottom: 0;
}

.filter-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 15rpx;
	margin-bottom: 30rpx;
}

.filter-tag {
	padding: 12rpx 24rpx;
	border-radius: 40rpx;
	background-color: #f1f5f9;
	color: var(--text-color-light);
	font-size: 26rpx;
	
	&.active-tag {
		background-color: var(--primary-color);
		color: #fff;
	}
}

.exercise-options {
	max-height: calc(95vh - 400rpx);
	overflow-y: auto;
}

.exercise-option {
	padding: 25rpx;
	border-bottom: 2rpx solid var(--border-color);
	
	&:last-child {
		border-bottom: none;
	}
}

.exercise-option-name {
	font-size: 30rpx;
	font-weight: 500;
	color: var(--text-color);
	margin-bottom: 10rpx;
	display: block;
}

.exercise-option-desc {
	font-size: 26rpx;
	color: var(--text-color-light);
	margin-bottom: 15rpx;
	display: block;
}

.exercise-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
}

.tag {
	padding: 6rpx 12rpx;
	background-color: #e5e7eb;
	color: var(--text-color-light);
	font-size: 22rpx;
	border-radius: 12rpx;
}
</style>