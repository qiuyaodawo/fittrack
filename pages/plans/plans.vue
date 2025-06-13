<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item" @tap="navigateTo('index')">首页</view>
				<view class="nav-item" @tap="navigateTo('history')">记录</view>
				<view class="nav-item" @tap="navigateTo('progress')">进度追踪</view>
				<view class="nav-item active">健身计划</view>
				<view class="nav-item" @tap="navigateTo('workouts')">训练数据库</view>
			</view>
			<view class="nav-actions">
				<!-- 导航动作占位符，保持布局平衡 -->
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
							<text class="form-label">计划类型</text>
							<picker :value="planTypeIndex" :range="planTypes" @change="onPlanTypeChange">
								<view class="picker-value">{{planTypes[planTypeIndex]}}</view>
							</picker>
						</view>
						
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
						
						<view class="form-item" v-if="planTypeIndex === 1">
							<text class="form-label">计划周数</text>
							<picker :value="weeksIndex" :range="planWeeks" @change="onWeeksChange">
								<view class="picker-value">{{planWeeks[weeksIndex]}}</view>
							</picker>
						</view>
						
						<button class="btn btn-primary" @tap="generatePlan">生成计划</button>
					</view>
					
					<view class="plan-preview" v-if="showPreview">
						<view class="preview-header">
							<text class="preview-title">生成计划预览</text>
							<view class="close-preview" @tap="closePreview">×</view>
						</view>
						
						<view class="preview-content">
							<view class="day-plan" v-for="(day, index) in previewPlan" :key="index">
								<text class="day-title">{{day.day}}: {{day.focus}}</text>
								
								<view class="exercise-list-interactive">
									<view class="exercise-item-interactive" 
										v-for="(exercise, idx) in day.exercises" 
										:key="idx"
										@tap="editExerciseInPreview(index, idx, exercise)">
										<view class="exercise-info">
											<text class="exercise-name">• {{getExerciseDisplayName(exercise)}}</text>
										</view>
									</view>
									<button class="add-exercise-btn-mini" @tap="addExerciseInPreview(index)">
										<text class="plus-icon">+</text>
									</button>
								</view>
							</view>
						</view>
						
						<view class="preview-footer">
							<button class="btn btn-primary" @tap="savePlan">保存计划</button>
						</view>
					</view>
				</view>
			</view>
			
			<view class="card my-plans">
				<text class="section-title">我的计划</text>
				
				<view class="plan-list">
					<view class="my-plan-card" v-for="(plan, index) in myPlans" :key="index">
						<view class="plan-card-content" @tap="viewPlanDetails(plan)">
							<view class="flex-row justify-between align-center">
								<text class="plan-title">{{plan.title}}</text>
								<view class="badge" :class="'badge-' + plan.statusClass">{{plan.status}}</view>
							</view>
							<text class="plan-desc">{{plan.description}}</text>
							<view class="flex-row justify-between align-center">
								<text class="plan-progress">{{plan.progress}}</text>
								<view class="plan-actions-vertical">
									<text class="text-primary plan-action">{{plan.actionText}}</text>
									<text class="delete-action" @tap.stop="deletePlan(plan, index)">删除计划</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 动作编辑弹窗 -->
		<view class="modal" v-if="showExerciseEditModal" @tap.self="closeExerciseEditModal">
			<view class="modal-content exercise-edit-modal">
				<view class="modal-header">
					<text class="modal-title">{{isAddingExercise ? '添加动作' : '编辑动作'}}</text>
					<view class="close-btn" @tap="closeExerciseEditModal">×</view>
				</view>
				
				<view class="modal-body">
					<view class="form-group">
						<text class="form-label">动作名称</text>
						<input v-model="editingExercise.name" placeholder="请输入动作名称" class="form-input readonly-input" readonly disabled />
					</view>
					
					<!-- 组数设置 -->
					<view class="form-group">
						<text class="form-label">组数</text>
						<view class="sets-selector">
							<button class="sets-btn decrease" @tap="decreaseEditSets" :disabled="editingExercise.sets <= 1">
								<text class="btn-icon">−</text>
							</button>
							<input 
								type="number" 
								class="sets-input" 
								v-model="editingExercise.sets"
								@input="validateEditSetsInput"
								@blur="validateEditSetsInput"
								placeholder="组数"
								min="1"
								max="99"
							/>
							<text class="sets-unit">组</text>
							<button class="sets-btn increase" @tap="increaseEditSets" :disabled="editingExercise.sets >= 99">
								<text class="btn-icon">+</text>
							</button>
						</view>
					</view>
					
					<!-- 次数设置 -->
					<view class="form-group">
						<text class="form-label">次数</text>
						<view class="sets-selector">
							<button class="sets-btn decrease" @tap="decreaseEditReps" :disabled="editingExercise.reps <= 1">
								<text class="btn-icon">−</text>
							</button>
							<input 
								type="number" 
								class="sets-input" 
								v-model="editingExercise.reps"
								@input="validateEditRepsInput"
								@blur="validateEditRepsInput"
								placeholder="次数"
								min="1"
								max="99"
							/>
							<text class="sets-unit">次</text>
							<button class="sets-btn increase" @tap="increaseEditReps" :disabled="editingExercise.reps >= 99">
								<text class="btn-icon">+</text>
							</button>
						</view>
					</view>
					
					<!-- 组间休息设置 -->
					<view class="form-group">
						<text class="form-label">组间休息 (秒)</text>
						<input type="number" v-model="editingExercise.rest" placeholder="请输入休息时间" class="form-input" />
					</view>
					
					<view class="action-buttons" v-if="!isAddingExercise">
						<button class="btn btn-danger" @tap="deleteExerciseInPreview">删除动作</button>
					</view>
				</view>
				
				<view class="modal-footer">
					<button class="btn btn-outline" @tap="closeExerciseEditModal">取消</button>
					<button class="btn btn-primary" @tap="saveExerciseInPreview" :disabled="!editingExercise.name">
						{{isAddingExercise ? '添加' : '保存'}}
					</button>
				</view>
			</view>
		</view>
		
		<!-- 创建新计划弹窗 -->
		<view class="modal" v-if="showCreatePlanModal" @tap.self="closeModal">
			<view class="modal-content create-plan-modal">
				<view class="modal-header">
					<text class="modal-title">创建训练计划</text>
					<view class="close-btn" @tap="closeModal">×</view>
				</view>
				
				<view class="modal-body">
					<!-- 计划基本信息 -->
					<view class="form-group">
						<text class="form-label">计划名称</text>
						<input v-model="customPlan.title" placeholder="请输入计划名称" class="form-input" />
					</view>
					
					<!-- 周数控制 -->
					<view class="form-group">
						<text class="form-label">训练周期</text>
						<view class="week-control">
							<view class="week-selector">
								<button class="week-btn decrease" @tap="changeWeeks(-1)" :disabled="customPlan.weeks <= 1">
									<text class="btn-icon">−</text>
								</button>
								<input 
									type="number" 
									class="week-input" 
									v-model="weeksInputValue"
									@input="handleWeeksInput"
									@blur="validateWeeksInput"
									placeholder="周数"
									min="1"
									max="99"
								/>
								<text class="week-unit">周</text>
								<button class="week-btn increase" @tap="changeWeeks(1)" :disabled="customPlan.weeks >= 99">
									<text class="btn-icon">+</text>
								</button>
							</view>
						</view>
					</view>
					
					<!-- 周数切换 -->
					<view class="form-group week-selection-container">
						<view v-if="customPlan.weeks > 1">
							<text class="form-label">选择编辑周次</text>
							<view class="week-tabs">
								<view class="week-tab" 
									v-for="week in customPlan.weeks" 
									:key="week"
									:class="{'active': customPlan.currentWeek === week}"
									@tap="switchWeek(week)">
									第{{week}}周
								</view>
							</view>
						</view>
					</view>
					
					<!-- 一周七天的训练安排 -->
					<view class="form-group">
						<text class="form-label">训练安排 (第{{customPlan.currentWeek}}周)</text>
						<view class="days-grid">
							<view class="day-card" 
								v-for="(day, index) in weekDays" 
								:key="index"
								@tap="editDay(day, customPlan.currentWeek)"
								:class="{'has-plan': getDayPlan(customPlan.currentWeek, day), 'rest-day': getDayPlan(customPlan.currentWeek, day) && getDayPlan(customPlan.currentWeek, day).restDay}">
								
								<text class="day-name">{{day}}</text>
								<view class="day-status" v-if="getDayPlan(customPlan.currentWeek, day)">
									<text class="status-text">
										{{getDayPlan(customPlan.currentWeek, day).restDay ? '休息' : getDayPlan(customPlan.currentWeek, day).exercises.length + '个动作'}}
									</text>
								</view>
								<view class="day-status empty" v-else>
									<text class="status-text">未设置</text>
								</view>
								
								<view class="day-preview" v-if="getDayPlan(customPlan.currentWeek, day) && !getDayPlan(customPlan.currentWeek, day).restDay">
									<text class="exercise-preview" 
										v-for="(exercise, exIndex) in getDayPlan(customPlan.currentWeek, day).exercises.slice(0, 2)" 
										:key="exIndex">
										{{exercise.name}}
									</text>
									<text class="more-exercises" v-if="getDayPlan(customPlan.currentWeek, day).exercises.length > 2">
										...等{{getDayPlan(customPlan.currentWeek, day).exercises.length}}项
									</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<view class="modal-footer">
					<button class="btn btn-outline" @tap="closeModal">取消</button>
					<button class="btn btn-primary" @tap="saveCustomPlan" :disabled="!customPlan.title">保存计划</button>
				</view>
			</view>
		</view>
		
		<!-- 日训练编辑弹窗 -->
		<view class="modal" v-if="showDayEditor" @tap.self="closeDayEditor">
			<view class="modal-content day-editor-modal">
				<view class="modal-header">
					<text class="modal-title">{{currentEditDay}} - 第{{currentEditWeek}}周</text>
					<view class="close-btn" @tap="closeDayEditor">×</view>
				</view>
				
				<view class="modal-body">
					<!-- 休息日选项 -->
					<view class="rest-day-option">
						<label class="checkbox-label">
							<checkbox :checked="dayTraining.restDay" @change="toggleRestDay" />
							<text>设为休息日</text>
						</label>
					</view>
					
					<!-- 训练内容（非休息日时显示） -->
					<view v-if="!dayTraining.restDay">
						<!-- 训练动作列表 -->
						<view class="exercises-section">
							<view class="section-header">
								<text class="section-title">训练动作</text>
								<button class="btn btn-small btn-primary" @tap="addExercise">添加动作</button>
							</view>
							
							<view class="exercise-list" v-if="dayTraining.exercises.length > 0">
															<view class="exercise-item" v-for="(exercise, index) in dayTraining.exercises" :key="index">
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
								<text>还没有添加训练动作</text>
							</view>
						</view>
						
						<!-- 训练备注 -->
						<view class="notes-section">
							<text class="section-title">训练备注</text>
							<textarea v-model="dayTraining.notes" placeholder="添加训练备注..." class="notes-input"></textarea>
						</view>
					</view>
				</view>
				
				<view class="modal-footer">
					<button class="btn btn-outline" @tap="closeDayEditor">取消</button>
					<button class="btn btn-primary" @tap="saveDayTraining">保存</button>
				</view>
			</view>
		</view>
		
		<!-- 动作选择/编辑弹窗 -->
		<view class="modal" v-if="showExerciseSelector" @tap.self="closeExerciseSelector">
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
										:class="{'selected': exerciseDetails.name === exercise}"
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
							<input :value="exerciseDetails.sets" @input="handleSetsInput" class="form-input" placeholder="3" type="number" />
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
					<button class="btn btn-primary" @tap="saveExercise" :disabled="!exerciseDetails.name">
						{{selectedExercise !== null ? '更新' : '添加'}}
					</button>
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
			goalIndex: 0,
			goals: ['增肌', '减脂', '力量提升', '耐力训练'],
			
			daysIndex: 0,
			trainingDays: ['3天', '4天', '5天', '6天'],
			
			levelIndex: 0,
			levels: ['初级', '中级', '高级'],
			
			weeksIndex: 0,
			planWeeks: ['4周', '8周', '12周', '16周'],
			
			planTypeIndex: 0,
			planTypes: ['一周计划', '长期计划'],
			
			showPreview: false,
			previewPlan: [],
			
			// 动作编辑相关
			showExerciseEditModal: false,
			editingExercise: {
				name: '',
				sets: 1,
				reps: 1,
				rest: '90'
			},
			editingDayIndex: -1,
			editingExerciseIndex: -1,
			isAddingExercise: false,
			
			// 创建新计划相关数据
			showCreatePlanModal: false,
			planDurations: ['4周', '8周', '12周', '16周'],
			
			// 自定义计划数据
			customPlan: {
				title: '',
				weeks: 1,
				currentWeek: 1,
				weekPlans: {} // 存储每周的训练安排，格式：{1: {周一: {...}, 周二: {...}}, 2: {...}}
			},
			weeksInputValue: 1, // 周数输入显示值
			
			// 日程编辑器相关数据
			showDayEditor: false,
			currentEditDay: null,
			currentEditWeek: 1,
			dayTraining: {
				exercises: [],
				restDay: false,
				notes: ''
			},
			weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
			
			// 动作编辑相关
			showExerciseSelector: false,
			selectedExercise: null,
			exerciseDetails: {
				name: '',
				sets: 3,
				reps: 12,
				weight: '',
				rest: 90,
				notes: ''
			},
					// 自定义选择器显示状态
			showGoalOptions: false,
			showDaysOptions: false,
			showLevelOptions: false,
			showDurationOptions: false,
			
			// 云同步状态
			syncStatus: {
				icon: 'sync-connected',
				text: '已连接',
				syncing: false
			},
			
			// 可选择的动作库
			exerciseLibrary: {
				胸肌: ['杠铃卧推', '哑铃卧推', '上斜卧推', '下斜卧推', '哑铃飞鸟', '俯卧撑', '双杠臂屈伸'],
				背部: ['引体向上', '杠铃划船', '哑铃划船', '高位下拉', '坐姿划船', 'T杠划船', '面拉'],
				腿部: ['杠铃深蹲', '前蹲', '哑铃深蹲', '腿举', '保加利亚深蹲', '罗马尼亚硬拉', '硬拉'],
				肩部: ['杠铃肩推', '哑铃肩推', '侧平举', '前平举', '阿诺德推举', '倒立撑'],
				手臂: ['杠铃弯举', '哑铃弯举', '锤式弯举', '窄距卧推', '三头肌下压', '臂屈伸'],
				核心: ['平板支撑', '卷腹', '俄罗斯转体', '登山者', '死虫', '鸟狗式']
			},
			
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
	},	onShow() {
		// 页面显示时加载我的计划
		this.loadMyPlans();
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
		onGoalChange(e) {
			this.goalIndex = e.detail.value;
			// 如果当前有预览，则自动更新预览
			if (this.showPreview) {
				this.updatePreview();
			}
		},
		onDaysChange(e) {
			this.daysIndex = e.detail.value;
			// 如果当前有预览，则自动更新预览
			if (this.showPreview) {
				this.updatePreview();
			}
		},
		onLevelChange(e) {
			this.levelIndex = e.detail.value;
			// 如果当前有预览，则自动更新预览
			if (this.showPreview) {
				this.updatePreview();
			}
		},
		onWeeksChange(e) {
			this.weeksIndex = e.detail.value;
			// 如果当前有预览，则自动更新预览
			if (this.showPreview) {
				this.updatePreview();
			}
		},
		onPlanTypeChange(e) {
			this.planTypeIndex = e.detail.value;
			// 如果当前有预览，则自动更新预览
			if (this.showPreview) {
				this.updatePreview();
			}
		},
		
		// 更新预览的方法
		updatePreview() {
			this.previewPlan = this.createPlanByParameters();
		},
		
		// 关闭预览
		closePreview() {
			this.showPreview = false;
		},
		
		// 在预览中编辑动作
		editExerciseInPreview(dayIndex, exerciseIndex, exerciseData) {
			this.editingDayIndex = dayIndex;
			this.editingExerciseIndex = exerciseIndex;
			
			// 如果是字符串格式的动作名称，转换为对象格式
			if (typeof exerciseData === 'string') {
				this.editingExercise = {
					name: exerciseData,
					sets: 1,
					reps: 1,
					rest: '90'
				};
			} else {
				// 如果已经是对象格式，确保动作名称是纯净的
				this.editingExercise = {
					name: this.extractPureName(exerciseData.name || exerciseData),
					sets: exerciseData.sets || 1,
					reps: exerciseData.reps || 1,
					rest: exerciseData.rest || '90'
				};
			}
			
			this.isAddingExercise = false;
			this.showExerciseEditModal = true;
		},
		
		// 在预览中添加动作
		addExerciseInPreview(dayIndex) {
			this.editingDayIndex = dayIndex;
			this.editingExerciseIndex = -1;
			this.editingExercise = {
				name: '',
				sets: 1,
				reps: 1,
				rest: '90'
			};
			this.isAddingExercise = true;
			this.showExerciseEditModal = true;
		},
		
		// 保存动作编辑
		saveExerciseInPreview() {
			if (!this.editingExercise.name.trim()) {
				return;
			}
			
			// 获取原始动作名称（对于编辑操作，保持原始名称不变）
			let finalName = this.editingExercise.name.trim();
			if (!this.isAddingExercise) {
				// 编辑时，确保使用原始的纯净动作名称，不允许修改
				const originalExercise = this.previewPlan[this.editingDayIndex].exercises[this.editingExerciseIndex];
				if (originalExercise) {
					finalName = typeof originalExercise === 'string' 
						? this.extractPureName(originalExercise)
						: this.extractPureName(originalExercise.name || originalExercise);
				}
			} else {
				// 添加新动作时，允许使用输入的名称
				finalName = this.extractPureName(finalName);
			}
			
			// 构造动作对象
			const exerciseData = {
				name: finalName,
				sets: parseInt(this.editingExercise.sets) || 1,
				reps: parseInt(this.editingExercise.reps) || 1,
				rest: this.editingExercise.rest.trim()
			};
			
			if (this.isAddingExercise) {
				// 添加新动作
				if (!this.previewPlan[this.editingDayIndex].exercises) {
					this.previewPlan[this.editingDayIndex].exercises = [];
				}
				this.previewPlan[this.editingDayIndex].exercises.push(exerciseData);
			} else {
				// 编辑现有动作
				this.previewPlan[this.editingDayIndex].exercises[this.editingExerciseIndex] = exerciseData;
			}
			
			this.closeExerciseEditModal();
		},
		
		// 删除动作
		deleteExerciseInPreview() {
			if (this.editingDayIndex >= 0 && this.editingExerciseIndex >= 0) {
				this.previewPlan[this.editingDayIndex].exercises.splice(this.editingExerciseIndex, 1);
				this.closeExerciseEditModal();
			}
		},
		
		// 关闭动作编辑弹窗
		closeExerciseEditModal() {
			this.showExerciseEditModal = false;
			this.editingDayIndex = -1;
			this.editingExerciseIndex = -1;
			this.editingExercise = {
				name: '',
				sets: 1,
				reps: 1,
				rest: '90'
			};
			this.isAddingExercise = false;
		},
		
		// 组数控制方法
		decreaseEditSets() {
			if (this.editingExercise.sets > 1) {
				this.editingExercise.sets--;
			}
		},
		
		increaseEditSets() {
			if (this.editingExercise.sets < 99) {
				this.editingExercise.sets++;
			}
		},
		
		validateEditSetsInput() {
			let value = this.editingExercise.sets;
			if (value !== undefined && value !== null) {
				// 只允许数字
				value = value.toString().replace(/[^\d]/g, '');
				// 限制在1-99之间
				if (value !== '') {
					const num = parseInt(value);
					if (num < 1) {
						value = 1;
					} else if (num > 99) {
						value = 99;
					}
				} else {
					value = 1;
				}
				this.editingExercise.sets = parseInt(value);
			}
		},
		
		// 次数控制方法
		decreaseEditReps() {
			if (this.editingExercise.reps > 1) {
				this.editingExercise.reps--;
			}
		},
		
		increaseEditReps() {
			if (this.editingExercise.reps < 99) {
				this.editingExercise.reps++;
			}
		},
		
		validateEditRepsInput() {
			let value = this.editingExercise.reps;
			if (value !== undefined && value !== null) {
				// 只允许数字
				value = value.toString().replace(/[^\d]/g, '');
				// 限制在1-99之间
				if (value !== '') {
					const num = parseInt(value);
					if (num < 1) {
						value = 1;
					} else if (num > 99) {
						value = 99;
					}
				} else {
					value = 1;
				}
				this.editingExercise.reps = parseInt(value);
			}
		},
		
		// 提取纯净的动作名称（去除训练参数）
		extractPureName(name) {
			if (typeof name !== 'string') return name;
			// 移除组数、次数、休息时间等信息，只保留动作名称
			return name.split(' ')[0] || name;
		},
		
		// 将字符串格式的动作转换为对象格式
		convertExerciseToObject(exerciseStr) {
			if (typeof exerciseStr === 'object') {
				// 确保对象格式也有完整的属性
				return {
					name: exerciseStr.name || exerciseStr,
					sets: exerciseStr.sets || 3,
					reps: exerciseStr.reps || 10,
					rest: exerciseStr.rest || '90'
				};
			}
			
			// 如果是非训练项目（如"拉伸"、"组间休息"等），直接返回默认格式
			if (exerciseStr.includes('休息') || exerciseStr.includes('拉伸') || 
				exerciseStr.includes('分钟') || exerciseStr.includes('轮') ||
				exerciseStr.includes('心率') || exerciseStr.includes('低强度') ||
				exerciseStr.includes('辅助') || exerciseStr.includes('激活')) {
				return {
					name: exerciseStr,
					sets: 1,
					reps: 1,
					rest: '90'
				};
			}
			
			// 处理HIIT类型的训练（如"开合跳 30秒/休息30秒"）
			const hiitMatch = exerciseStr.match(/^(.+?)\s+(\d+)秒\/休息(\d+)秒/);
			if (hiitMatch) {
				const workTime = parseInt(hiitMatch[2]);
				const restTime = parseInt(hiitMatch[3]);
				return {
					name: hiitMatch[1],
					sets: 3,
					reps: workTime,
					rest: restTime.toString()
				};
			}
			
			// 解析字符串格式的动作，如 "俯卧撑 3组 x 8-12次"
			const parts = exerciseStr.split(' ');
			const name = parts[0];
			
			// 默认值
			let sets = 3;
			let reps = 10;
			let rest = '90';
			
			// 提取组数
			const setsMatch = exerciseStr.match(/(\d+)组/);
			if (setsMatch) {
				sets = parseInt(setsMatch[1]);
			}
			
			// 提取次数（取范围的中间值）
			const repsMatch = exerciseStr.match(/x\s*(\d+)(?:-(\d+))?次/);
			if (repsMatch) {
				const min = parseInt(repsMatch[1]);
				const max = repsMatch[2] ? parseInt(repsMatch[2]) : min;
				reps = Math.round((min + max) / 2);
			}
			
			// 提取秒数（如果是时间类型，如平板支撑）
			const timeMatch = exerciseStr.match(/(\d+)(?:-(\d+))?秒(?!\/)/);
			if (timeMatch && !exerciseStr.includes('/')) {
				const min = parseInt(timeMatch[1]);
				const max = timeMatch[2] ? parseInt(timeMatch[2]) : min;
				reps = Math.round((min + max) / 2);
			}
			
			// 确保所有值都是有效的
			sets = Math.max(1, Math.min(99, sets));
			reps = Math.max(1, Math.min(99, reps));
			
			return {
				name: name,
				sets: sets,
				reps: reps,
				rest: rest
			};
		},
		
		// 转换整个计划数据
		convertPlanData(planData) {
			return planData.map(day => ({
				...day,
				exercises: day.exercises.map(exercise => this.convertExerciseToObject(exercise))
			}));
		},
		
		// 获取动作显示名称
		getExerciseDisplayName(exercise) {
			if (typeof exercise === 'string') {
				return exercise;
			} else if (typeof exercise === 'object' && exercise.name) {
				// 构造完整的训练参数显示
				let pureName = this.extractPureName(exercise.name);
				let displayName = pureName;
				
				// 添加组数信息
				if (exercise.sets && exercise.sets > 0) {
					displayName += ` ${exercise.sets}组`;
				}
				
				// 添加次数信息
				if (exercise.reps && exercise.reps > 0) {
					displayName += ` × ${exercise.reps}次`;
				}
				
				// 添加休息时间信息 - 确保总是显示休息时间
				const restTime = exercise.rest || '90';
				displayName += ` 休息${restTime}秒`;
				
				return displayName;
			} else {
				return exercise.toString();
			}
		},
		// 创建新计划方法
		createPlan() {
			// 重置自定义计划数据
			this.customPlan = {
				title: '',
				weeks: 1,
				currentWeek: 1,
				weekPlans: {}
			};
			this.weeksInputValue = 1;
			// 强制更新视图
			this.$forceUpdate();
			this.showCreatePlanModal = true;
		},
		closeModal() {
			this.showCreatePlanModal = false;
			this.closeAllSelectors();
		},
		
		// 周数控制方法
		changeWeeks(delta) {
			const newWeeks = this.customPlan.weeks + delta;
			if (newWeeks >= 1 && newWeeks <= 99) {
				this.customPlan.weeks = newWeeks;
				this.weeksInputValue = newWeeks; // 同步更新显示值
				// 如果当前周数超出范围，调整到最后一周
				if (this.customPlan.currentWeek > newWeeks) {
					this.customPlan.currentWeek = newWeeks;
				}
			}
		},
		
		// 处理周数输入
		handleWeeksInput(e) {
			let value = e.detail.value.toString();
			
			// 移除所有非数字字符
			value = value.replace(/\D/g, '');
			
			// 检查输入长度是否超过2位（防止输入999等超长数字）
			if (value.length > 2) {
				// 如果输入超过2位，自动调整为99
				this.weeksInputValue = 99;
				this.customPlan.weeks = 99;
				// 如果当前编辑的周数超出了新的总周数，调整到最后一周
				if (this.customPlan.currentWeek > 99) {
					this.customPlan.currentWeek = 99;
				}
				uni.showToast({
					title: '最大值为99，已自动调整',
					icon: 'none',
					duration: 1500
				});
				return;
			}
			
			// 如果输入为空或者删除了所有内容
			if (value === '') {
				// 暂时允许为空，等失焦时处理
				return;
			}
			
			let numValue = parseInt(value);
			
			// 如果解析失败
			if (isNaN(numValue)) {
				return;
			}
			
			// 当输入的数值超过99时，自动调整为99
			if (numValue > 99) {
				// 自动调整为99
				this.weeksInputValue = 99;
				this.customPlan.weeks = 99;
				// 如果当前编辑的周数超出了新的总周数，调整到最后一周
				if (this.customPlan.currentWeek > 99) {
					this.customPlan.currentWeek = 99;
				}
				uni.showToast({
					title: '最大值为99，已自动调整',
					icon: 'none',
					duration: 1500
				});
				return;
			}
			
			// 处理零值
			if (numValue === 0) {
				numValue = 1;
				uni.showToast({
					title: '最小值为1，已自动调整',
					icon: 'none', 
					duration: 1500
				});
			}
			
			// 更新值
			this.weeksInputValue = numValue;
			this.customPlan.weeks = numValue;
			
			// 如果当前编辑的周数超出了新的总周数，调整到最后一周
			if (this.customPlan.currentWeek > numValue) {
				this.customPlan.currentWeek = numValue;
			}
		},
		
		// 验证周数输入（失焦时）
		validateWeeksInput(e) {
			let value = e.detail.value.toString();
			
			// 移除非数字字符
			value = value.replace(/\D/g, '');
			
			let numValue = parseInt(value);
			let showToast = false;
			let toastMessage = '';
			
			// 检查是否为有效数字
			if (isNaN(numValue) || value === '' || numValue === 0) {
				numValue = 1;
				showToast = true;
				toastMessage = '周数不能为空，已设置为1';
			} else if (numValue < 1) {
				numValue = 1;
				showToast = true;
				toastMessage = '周数不能小于1，已自动调整为1';
			} else if (numValue > 99) {
				numValue = 99;
				showToast = true;
				toastMessage = '周数不能大于99，已自动调整为99';
			}
			
			// 同步更新两个值
			this.customPlan.weeks = numValue;
			this.weeksInputValue = numValue;
			
			// 如果当前编辑的周数超出了总周数，调整到最后一周
			if (this.customPlan.currentWeek > numValue) {
				this.customPlan.currentWeek = numValue;
			}
			
			// 显示调整提示
			if (showToast) {
				uni.showToast({
					title: toastMessage,
					icon: 'none',
					duration: 2000
				});
			}
		},
		
		// 切换周
		switchWeek(week) {
			this.customPlan.currentWeek = week;
		},
		
		// 处理计划名称输入
		handleTitleInput(e) {
			this.customPlan.title = e.detail.value;
			console.log('计划名称输入:', this.customPlan.title);
		},
		
		// 处理组数输入
		handleSetsInput(e) {
			const value = parseInt(e.detail.value) || 1;
			this.exerciseDetails.sets = Math.max(1, value);
		},
		
		// 处理次数输入
		handleRepsInput(e) {
			const value = parseInt(e.detail.value) || 1;
			this.exerciseDetails.reps = Math.max(1, value);
		},
		
		// 处理重量输入
		handleWeightInput(e) {
			const value = parseFloat(e.detail.value);
			this.exerciseDetails.weight = isNaN(value) ? '' : Math.max(0, value);
		},
		
		// 处理组间休息输入
		handleRestInput(e) {
			const value = parseInt(e.detail.value) || 30;
			this.exerciseDetails.rest = Math.max(30, value);
		},
		

		
		// 获取某天的训练计划
		getDayPlan(week, day) {
			if (!this.customPlan.weekPlans[week]) {
				return null;
			}
			return this.customPlan.weekPlans[week][day];
		},
		
		// 编辑某天的训练
		editDay(day, week) {
			this.currentEditDay = day;
			this.currentEditWeek = week;
			
			// 加载当天的训练数据
			const dayPlan = this.getDayPlan(week, day);
			if (dayPlan) {
				this.dayTraining = {
					exercises: [...dayPlan.exercises],
					restDay: dayPlan.restDay,
					notes: dayPlan.notes || ''
				};
			} else {
				this.dayTraining = {
					exercises: [],
					restDay: false,
					notes: ''
				};
			}
			
			this.showDayEditor = true;
		},
		
		// 关闭日编辑器
		closeDayEditor() {
			this.showDayEditor = false;
			this.currentEditDay = null;
			this.currentEditWeek = 1;
		},
		
		// 切换休息日
		toggleRestDay(e) {
			this.dayTraining.restDay = e.detail.value.length > 0;
		},
		
		// 保存当天训练
		saveDayTraining() {
			// 确保周计划存在
			if (!this.customPlan.weekPlans[this.currentEditWeek]) {
				this.customPlan.weekPlans[this.currentEditWeek] = {};
			}
			
			// 保存当天计划
			this.customPlan.weekPlans[this.currentEditWeek][this.currentEditDay] = {
				exercises: [...this.dayTraining.exercises],
				restDay: this.dayTraining.restDay,
				notes: this.dayTraining.notes
			};
			
			this.closeDayEditor();
			
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			});
		},
		
		// 添加动作
		addExercise() {
			this.selectedExercise = null;
			// 重置动作详情
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
		
		// 编辑动作
		editExercise(index) {
			this.selectedExercise = index;
			const exercise = this.dayTraining.exercises[index];
			// 复制动作数据进行编辑
			this.exerciseDetails = { ...exercise };
			this.showExerciseSelector = true;
		},
		
		// 删除动作
		removeExercise(index) {
			// 暂时隐藏创建计划弹窗和日编辑弹窗，确保删除确认弹窗能显示
			const originalShowCreatePlanModal = this.showCreatePlanModal;
			const originalShowDayEditor = this.showDayEditor;
			
			this.showCreatePlanModal = false;
			this.showDayEditor = false;
			
			this.$nextTick(() => {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个动作吗？',
					success: (res) => {
						if (res.confirm) {
							this.dayTraining.exercises.splice(index, 1);
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
						}
						// 恢复弹窗显示
						this.showCreatePlanModal = originalShowCreatePlanModal;
						this.showDayEditor = originalShowDayEditor;
					},
					fail: () => {
						// 失败时也恢复弹窗显示
						this.showCreatePlanModal = originalShowCreatePlanModal;
						this.showDayEditor = originalShowDayEditor;
					}
				});
			});
		},
		
		// 关闭动作选择器
		closeExerciseSelector() {
			this.showExerciseSelector = false;
			this.selectedExercise = null;
		},
		
		// 选择动作名称
		selectExerciseName(name) {
			this.exerciseDetails.name = name;
			console.log('选择了动作:', name);
			console.log('当前exerciseDetails:', this.exerciseDetails);
			// 强制更新视图以确保条件渲染生效
			this.$forceUpdate();
		},
		
		// 保存动作
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
				this.dayTraining.exercises[this.selectedExercise] = exercise;
			} else {
				// 添加模式
				this.dayTraining.exercises.push(exercise);
			}
			
			this.closeExerciseSelector();
			
			uni.showToast({
				title: this.selectedExercise !== null ? '更新成功' : '添加成功',
				icon: 'success'
			});
		},
				// 保存自定义计划
		async saveCustomPlan() {
			if (!this.customPlan.title.trim()) {
				uni.showToast({
					title: '请输入计划名称',
					icon: 'none'
				});
				return;
			}
			
			// 转换为保存格式
			const planData = {
				id: Date.now(),
				title: this.customPlan.title,
				description: `自定义${this.customPlan.weeks}周训练计划`,
				planType: '自定义计划',
				duration: `${this.customPlan.weeks}周`,
				status: '未开始',
				statusClass: 'warning',
				progress: `0周/共${this.customPlan.weeks}周`,
				actionText: '开始计划',
				createdDate: new Date().toISOString().split('T')[0],
				customPlan: true,
				weekPlans: this.customPlan.weekPlans,
				totalWeeks: this.customPlan.weeks
			};
			
			try {
				// 保存到本地存储
				const myPlansKey = this.getUserStorageKey('myPlans');
				const savedPlans = uni.getStorageSync(myPlansKey) || [];
				savedPlans.unshift(planData);
				uni.setStorageSync(myPlansKey, savedPlans);
				
				// 尝试同步到云端
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo && userInfo.userId) {
					try {
						await cloudDataService.savePlanToCloud(planData);
						console.log('计划已同步至云端');
					} catch (error) {
						console.error('云端同步失败:', error);
						// 云端同步失败不影响本地保存
					}
				}
				
				// 更新显示的计划列表
				this.loadMyPlans();
				
				// 关闭弹窗
				this.closeModal();
				
				uni.showToast({
					title: '计划创建成功',
					icon: 'success',
					duration: 2000
				});
			} catch (error) {
				console.error('保存计划失败:', error);
				uni.showToast({
					title: '保存失败，请重试',
					icon: 'none'
				});
			}
		},
		onNewPlanGoalChange(e) {
			console.log('目标改变:', e.detail.value);
			this.newPlan.goalIndex = parseInt(e.detail.value);
			// 清空之前的计划预览
			this.newPlan.customSchedule = [];
		},
		onNewPlanDaysChange(e) {
			console.log('训练天数改变:', e.detail.value);
			this.newPlan.trainingDaysIndex = parseInt(e.detail.value);
			// 清空之前的计划预览
			this.newPlan.customSchedule = [];
		},
		onNewPlanLevelChange(e) {
			console.log('训练水平改变:', e.detail.value);
			this.newPlan.levelIndex = parseInt(e.detail.value);
			// 清空之前的计划预览
			this.newPlan.customSchedule = [];
		},
		onDurationChange(e) {
			console.log('计划周期改变:', e.detail.value);
			this.newPlan.durationIndex = parseInt(e.detail.value);
		},
		
		// picker取消事件
		onPickerCancel() {
			console.log('picker取消');
		},
		
		// 自定义选择器方法
		selectGoal(index) {
			this.newPlan.goalIndex = index;
			this.showGoalOptions = false;
			// 清空之前的计划预览
			this.newPlan.customSchedule = [];
			console.log('选择目标:', this.goals[index]);
		},
		
		selectDays(index) {
			this.newPlan.trainingDaysIndex = index;
			this.showDaysOptions = false;
			// 清空之前的计划预览
			this.newPlan.customSchedule = [];
			console.log('选择训练天数:', this.trainingDays[index]);
		},
		
		selectLevel(index) {
			this.newPlan.levelIndex = index;
			this.showLevelOptions = false;
			// 清空之前的计划预览
			this.newPlan.customSchedule = [];
			console.log('选择训练水平:', this.levels[index]);
		},
		
		selectDuration(index) {
			this.newPlan.durationIndex = index;
			this.showDurationOptions = false;
			console.log('选择计划周期:', this.planDurations[index]);
		},
		
		// 关闭所有选择器
		closeAllSelectors() {
			this.showGoalOptions = false;
			this.showDaysOptions = false;
			this.showLevelOptions = false;
			this.showDurationOptions = false;
		},
		
		// 生成新计划预览
		generateNewPlanPreview() {
			const goal = this.newPlan.goalIndex;
			const days = this.newPlan.trainingDaysIndex;
			const level = this.newPlan.levelIndex;
			
			// 根据训练天数确定训练日程
			const schedules = [
				['周一', '周三', '周五'], // 3天
				['周一', '周二', '周四', '周五'], // 4天
				['周一', '周二', '周三', '周五', '周六'], // 5天
				['周一', '周二', '周三', '周四', '周五', '周六'] // 6天
			];
			
			const currentSchedule = schedules[days];
			let plan = [];
			
			if (goal === 0) { // 增肌计划
				plan = this.generateMuscleGainPlan(currentSchedule, level);
			} else if (goal === 1) { // 减脂计划
				plan = this.generateFatLossPlan(currentSchedule, level);
			} else if (goal === 2) { // 力量提升计划
				plan = this.generateStrengthPlan(currentSchedule, level);
			} else { // 耐力训练计划
				plan = this.generateEndurancePlan(currentSchedule, level);
			}
			
			this.newPlan.customSchedule = plan;
			
			uni.showToast({
				title: '计划预览已生成',
				icon: 'success'
			});
		},
		confirmCreatePlan() {
			// 验证表单
			if (!this.newPlan.title) {
				uni.showToast({
					title: '请输入计划名称',
					icon: 'none'
				});
				return;
			}
			
			// 如果没有生成计划预览，先生成一个
			if (this.newPlan.customSchedule.length === 0) {
				this.generateNewPlanPreview();
			}
			
			// 创建新计划
			const newPlanObj = {
				id: Date.now(),
				title: this.newPlan.title,
				description: this.newPlan.description || `这是一个${this.planDurations[this.newPlan.durationIndex]}的${this.goals[this.newPlan.goalIndex]}计划，每周训练${this.trainingDays[this.newPlan.trainingDaysIndex]}，适合${this.levels[this.newPlan.levelIndex]}训练者。`,
				goal: this.goals[this.newPlan.goalIndex],
				level: this.levels[this.newPlan.levelIndex],
				duration: this.planDurations[this.newPlan.durationIndex],
				trainingDays: this.trainingDays[this.newPlan.trainingDaysIndex],
				status: '未开始',
				statusClass: 'warning',
				progress: `0周/共${this.planDurations[this.newPlan.durationIndex].replace('周', '')}周`,
				actionText: '开始计划',
				createdDate: new Date().toISOString().split('T')[0],
				exercises: this.newPlan.customSchedule // 保存详细的训练计划
			};
			
			// 保存到本地存储
			const savedPlans = uni.getStorageSync('myPlans') || [];
			savedPlans.unshift(newPlanObj);
			uni.setStorageSync('myPlans', savedPlans);
			
			// 更新显示的计划列表
			this.loadMyPlans();
			
			// 提示用户
			uni.showToast({
				title: '计划创建成功',
				icon: 'success'
			});
			
			// 重置表单并关闭弹窗
			this.newPlan = {
				title: '',
				description: '',
				goalIndex: 0,
				durationIndex: 1,
				trainingDaysIndex: 0,
				levelIndex: 0,
				customSchedule: [],
				customExercises: []
			};
			this.closeAllSelectors();
			this.closeModal();
		},
		generatePlan() {
			// 模拟生成计划
			uni.showLoading({
				title: '生成中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				
				// 根据目标、训练天数、训练水平生成计划
				this.previewPlan = this.createPlanByParameters();
				this.showPreview = true;
			}, 1500);
		},
		
		createPlanByParameters() {
			const goal = this.goalIndex; // 0:增肌, 1:减脂, 2:力量提升, 3:耐力训练
			const days = this.daysIndex; // 0:3天, 1:4天, 2:5天, 3:6天
			const level = this.levelIndex; // 0:初级, 1:中级, 2:高级
			const planType = this.planTypeIndex; // 0:一周计划, 1:长期计划
			
			// 根据训练天数确定训练日程
			const schedules = [
				['周一', '周三', '周五'], // 3天
				['周一', '周二', '周四', '周五'], // 4天
				['周一', '周二', '周三', '周五', '周六'], // 5天
				['周一', '周二', '周三', '周四', '周五', '周六'] // 6天
			];
			
			const currentSchedule = schedules[days];
			let plan = [];
			
			if (planType === 0) { // 一周计划
				plan = this.generateWeeklyPlan(currentSchedule, goal, level);
			} else { // 长期计划
				if (goal === 0) { // 增肌计划
					plan = this.generateMuscleGainPlan(currentSchedule, level);
				} else if (goal === 1) { // 减脂计划
					plan = this.generateFatLossPlan(currentSchedule, level);
				} else if (goal === 2) { // 力量提升计划
					plan = this.generateStrengthPlan(currentSchedule, level);
				} else { // 耐力训练计划
					plan = this.generateEndurancePlan(currentSchedule, level);
				}
			}
			
			return plan;
		},
		
		// 生成一周计划
		generateWeeklyPlan(schedule, goal, level) {
			const weeklyPlans = {
				// 增肌一周计划
				0: {
					初级: {
						3: [ // 3天
							{ day: '周一', focus: '上肢综合', exercises: [
								{name: '俯卧撑', sets: 3, reps: 10, rest: '90'},
								{name: '哑铃弯举', sets: 3, reps: 12, rest: '90'},
								{name: '三头肌撑体', sets: 3, reps: 8, rest: '90'},
								{name: '侧平举', sets: 3, reps: 12, rest: '90'}
							]},
							{ day: '周三', focus: '下肢综合', exercises: [
								{name: '徒手深蹲', sets: 3, reps: 15, rest: '90'},
								{name: '弓步蹲', sets: 3, reps: 10, rest: '90'},
								{name: '小腿提踵', sets: 3, reps: 18, rest: '90'},
								{name: '臀桥', sets: 3, reps: 12, rest: '90'}
							]},
							{ day: '周五', focus: '核心全身', exercises: [
								{name: '平板支撑', sets: 3, reps: 30, rest: '90'},
								{name: '卷腹', sets: 3, reps: 15, rest: '90'},
								{name: '俯卧撑', sets: 2, reps: 8, rest: '90'},
								{name: '深蹲', sets: 2, reps: 12, rest: '90'}
							]}
						],
						4: [ // 4天
							{ day: '周一', focus: '胸肌', exercises: [
								{name: '俯卧撑', sets: 3, reps: 10, rest: '90'},
								{name: '哑铃卧推', sets: 3, reps: 12, rest: '90'},
								{name: '哑铃飞鸟', sets: 3, reps: 12, rest: '90'}
							]},
							{ day: '周二', focus: '背部', exercises: [
								{name: '辅助引体向上', sets: 3, reps: 6, rest: '90'},
								{name: '哑铃划船', sets: 3, reps: 12, rest: '90'},
								{name: '坐姿划船', sets: 3, reps: 12, rest: '90'}
							]},
							{ day: '周四', focus: '腿部', exercises: [
								{name: '徒手深蹲', sets: 3, reps: 18, rest: '90'},
								{name: '哑铃深蹲', sets: 3, reps: 12, rest: '90'},
								{name: '腿举', sets: 3, reps: 18, rest: '90'}
							]},
							{ day: '周五', focus: '肩部手臂', exercises: [
								{name: '哑铃肩推', sets: 3, reps: 12, rest: '90'},
								{name: '侧平举', sets: 3, reps: 12, rest: '90'},
								{name: '哑铃弯举', sets: 3, reps: 12, rest: '90'},
								{name: '三头肌下压', sets: 3, reps: 12, rest: '90'}
							]}
						],
						5: [ // 5天
							{ day: '周一', focus: '胸肌', exercises: ['俯卧撑 3组 x 8-12次', '哑铃卧推 3组 x 10-12次', '哑铃飞鸟 3组 x 12-15次'] },
							{ day: '周二', focus: '背部', exercises: ['辅助引体向上 3组 x 5-8次', '哑铃划船 3组 x 10-12次', '坐姿划船 3组 x 12-15次'] },
							{ day: '周三', focus: '腿部', exercises: ['徒手深蹲 3组 x 15-20次', '哑铃深蹲 3组 x 12-15次', '腿举 3组 x 15-20次', '腿弯举 3组 x 12次'] },
							{ day: '周五', focus: '肩部', exercises: ['哑铃肩推 3组 x 10-12次', '侧平举 3组 x 12-15次', '前平举 3组 x 12次', '俯身飞鸟 3组 x 12次'] },
							{ day: '周六', focus: '手臂核心', exercises: ['哑铃弯举 3组 x 12-15次', '三头肌下压 3组 x 12-15次', '平板支撑 3组 x 45秒', '卷腹 3组 x 15次'] }
						],
						6: [ // 6天
							{ day: '周一', focus: '胸肌', exercises: ['俯卧撑 3组 x 8-12次', '哑铃卧推 3组 x 10-12次', '哑铃飞鸟 3组 x 12-15次'] },
							{ day: '周二', focus: '背部', exercises: ['辅助引体向上 3组 x 5-8次', '哑铃划船 3组 x 10-12次', '坐姿划船 3组 x 12-15次'] },
							{ day: '周三', focus: '腿部', exercises: ['徒手深蹲 3组 x 15-20次', '哑铃深蹲 3组 x 12-15次', '腿举 3组 x 15-20次', '腿弯举 3组 x 12次'] },
							{ day: '周四', focus: '肩部', exercises: ['哑铃肩推 3组 x 10-12次', '侧平举 3组 x 12-15次', '前平举 3组 x 12次', '俯身飞鸟 3组 x 12次'] },
							{ day: '周五', focus: '手臂', exercises: ['哑铃弯举 3组 x 12-15次', '锤式弯举 3组 x 12次', '三头肌下压 3组 x 12-15次', '三头肌撑体 3组 x 8-10次'] },
							{ day: '周六', focus: '核心有氧', exercises: ['平板支撑 3组 x 45秒', '卷腹 3组 x 15次', '俄罗斯转体 3组 x 15次', '快走 20分钟'] }
						]
					},
					中级: {
						3: [
							{ day: '周一', focus: '上肢力量', exercises: ['杠铃卧推 4组 x 8-10次', '杠铃划船 4组 x 8-10次', '杠铃弯举 3组 x 10-12次', '窄距卧推 3组 x 8-10次'] },
							{ day: '周三', focus: '下肢力量', exercises: ['杠铃深蹲 4组 x 8-10次', '罗马尼亚硬拉 4组 x 8-10次', '保加利亚深蹲 3组 x 10-12次'] },
							{ day: '周五', focus: '肩部核心', exercises: ['杠铃肩推 4组 x 8-10次', '侧平举 3组 x 12-15次', '平板支撑 3组 x 60秒', '俄罗斯转体 3组 x 20次'] }
						],
						4: [
							{ day: '周一', focus: '胸肩三头', exercises: ['杠铃卧推 4组 x 8-10次', '倾斜哑铃卧推 3组 x 10-12次', '肩推 4组 x 8-10次', '三头肌下压 3组 x 12-15次'] },
							{ day: '周二', focus: '背二头', exercises: ['引体向上 4组 x 8-10次', '杠铃划船 4组 x 8-10次', '哑铃划船 3组 x 10-12次', '杠铃弯举 4组 x 10-12次'] },
							{ day: '周四', focus: '腿部训练', exercises: ['杠铃深蹲 4组 x 8-10次', '罗马尼亚硬拉 4组 x 8-10次', '腿举 3组 x 12-15次', '小腿提踵 4组 x 15-20次'] },
							{ day: '周六', focus: '手臂专项', exercises: ['窄距卧推 4组 x 8-10次', '哑铃弯举 4组 x 10-12次', '锤式弯举 3组 x 12次', '三头肌伸展 3组 x 12次'] }
						],
						5: [
							{ day: '周一', focus: '胸部', exercises: ['杠铃卧推 4组 x 8-10次', '倾斜哑铃卧推 4组 x 10-12次', '哑铃飞鸟 3组 x 12-15次'] },
							{ day: '周二', focus: '背部', exercises: ['引体向上 4组 x 8-10次', '杠铃划船 4组 x 8-10次', '坐姿划船 3组 x 10-12次', '高位下拉 3组 x 12次'] },
							{ day: '周三', focus: '腿部', exercises: ['杠铃深蹲 4组 x 8-10次', '罗马尼亚硬拉 4组 x 8-10次', '腿举 3组 x 12-15次', '腿弯举 3组 x 12次'] },
							{ day: '周五', focus: '肩部', exercises: ['杠铃肩推 4组 x 8-10次', '哑铃侧平举 4组 x 12-15次', '后束飞鸟 3组 x 15次', '直立划船 3组 x 12次'] },
							{ day: '周六', focus: '手臂', exercises: ['杠铃弯举 4组 x 10-12次', '窄距卧推 4组 x 8-10次', '锤式弯举 3组 x 12次', '三头肌下压 3组 x 12次'] }
						],
						6: [
							{ day: '周一', focus: '胸部', exercises: ['杠铃卧推 4组 x 8-10次', '倾斜哑铃卧推 4组 x 10-12次', '哑铃飞鸟 3组 x 12-15次', '双杠臂屈伸 3组 x 8-12次'] },
							{ day: '周二', focus: '背部', exercises: ['引体向上 4组 x 8-10次', '杠铃划船 4组 x 8-10次', '坐姿划船 3组 x 10-12次', '高位下拉 3组 x 12次'] },
							{ day: '周三', focus: '腿部 (股四头肌)', exercises: ['杠铃深蹲 4组 x 8-10次', '腿举 4组 x 12-15次', '保加利亚深蹲 3组 x 10-12次', '腿屈伸 3组 x 12-15次'] },
							{ day: '周四', focus: '肩部', exercises: ['杠铃肩推 4组 x 8-10次', '哑铃侧平举 4组 x 12-15次', '后束飞鸟 3组 x 15次', '直立划船 3组 x 12次'] },
							{ day: '周五', focus: '手臂', exercises: ['杠铃弯举 4组 x 10-12次', '窄距卧推 4组 x 8-10次', '锤式弯举 3组 x 12次', '三头肌下压 3组 x 12次'] },
							{ day: '周六', focus: '腿部 (后链)', exercises: ['罗马尼亚硬拉 4组 x 8-10次', '腿弯举 4组 x 12-15次', '臀桥 3组 x 15-20次', '小腿提踵 4组 x 15-20次'] }
						]
					},
					高级: {
						3: [
							{ day: '周一', focus: '推力主导', exercises: ['杠铃卧推 5组 x 6-8次', '肩推 4组 x 8次', '倾斜卧推 4组 x 8-10次', '三头肌训练 4组'] },
							{ day: '周三', focus: '拉力主导', exercises: ['硬拉 4组 x 6次', '引体向上 4组 x 8次', '杠铃划船 4组 x 8次', '二头肌训练 4组'] },
							{ day: '周五', focus: '下肢主导', exercises: ['杠铃深蹲 5组 x 6-8次', '前蹲 3组 x 8次', '罗马尼亚硬拉 4组 x 8次', '腿部辅助训练 3组'] }
						],
						4: [
							{ day: '周一', focus: '胸肌推力', exercises: ['杠铃卧推 5组 x 6-8次', '倾斜杠铃卧推 4组 x 8-10次', '双杠臂屈伸 4组 x 8-12次', '三头肌训练 3组'] },
							{ day: '周二', focus: '背部拉力', exercises: ['加重引体向上 5组 x 5-8次', 'T杠划船 4组 x 6-8次', '单臂哑铃划船 4组 x 8-10次', '二头肌训练 3组'] },
							{ day: '周四', focus: '下肢力量', exercises: ['杠铃深蹲 5组 x 6-8次', '前蹲 4组 x 8-10次', '杠铃硬拉 4组 x 6-8次', '腿部辅助 3组'] },
							{ day: '周六', focus: '肩部推力', exercises: ['杠铃肩推 5组 x 6-8次', '哑铃肩推 4组 x 8-10次', '倒立撑 3组 x 5-8次', '侧平举 3组 x 12-15次'] }
						],
						5: [
							{ day: '周一', focus: '胸部', exercises: ['杠铃卧推 5组 x 6-8次', '上斜杠铃卧推 4组 x 8-10次', '下斜哑铃卧推 4组 x 10-12次', '双杠臂屈伸 3组 x 8-12次'] },
							{ day: '周二', focus: '背部', exercises: ['加重引体向上 5组 x 5-8次', 'T杠划船 4组 x 6-8次', '单臂哑铃划船 4组 x 8-10次', '高位下拉 3组 x 10-12次'] },
							{ day: '周三', focus: '腿部', exercises: ['杠铃深蹲 5组 x 6-8次', '前蹲 4组 x 8-10次', '杠铃硬拉 4组 x 6-8次', '保加利亚深蹲 3组 x 10-12次'] },
							{ day: '周五', focus: '肩部', exercises: ['杠铃肩推 5组 x 6-8次', '哑铃肩推 4组 x 8-10次', '倒立撑 3组 x 5-8次', '后束飞鸟 3组 x 12-15次'] },
							{ day: '周六', focus: '手臂', exercises: ['杠铃弯举 5组 x 6-8次', '近距离卧推 5组 x 6-8次', '锤式弯举 4组 x 8-10次', '三头肌伸展 3组 x 10-12次'] }
						],
						6: [
							{ day: '周一', focus: '胸部', exercises: ['杠铃卧推 5组 x 6-8次', '上斜杠铃卧推 4组 x 8-10次', '下斜哑铃卧推 4组 x 10-12次', '双杠臂屈伸 3组 x 8-12次'] },
							{ day: '周二', focus: '背部', exercises: ['加重引体向上 5组 x 5-8次', 'T杠划船 4组 x 6-8次', '单臂哑铃划船 4组 x 8-10次', '高位下拉 3组 x 10-12次'] },
							{ day: '周三', focus: '腿部 (股四头肌)', exercises: ['杠铃深蹲 5组 x 6-8次', '前蹲 4组 x 8-10次', '腿举 4组 x 12-15次', '腿屈伸 3组 x 12-15次'] },
							{ day: '周四', focus: '肩部', exercises: ['杠铃肩推 5组 x 6-8次', '哑铃肩推 4组 x 8-10次', '倒立撑 3组 x 5-8次', '后束飞鸟 3组 x 12-15次'] },
							{ day: '周五', focus: '手臂', exercises: ['杠铃弯举 5组 x 6-8次', '近距离卧推 5组 x 6-8次', '锤式弯举 4组 x 8-10次', '三头肌伸展 3组 x 10-12次'] },
							{ day: '周六', focus: '腿部 (后链)', exercises: ['杠铃硬拉 4组 x 6-8次', '罗马尼亚硬拉 4组 x 8-10次', '腿弯举 4组 x 12-15次', '小腿提踵 4组 x 15-20次'] }
						]
					},
					高级: {
						3: [
							{ day: '周一', focus: '推力主导', exercises: ['杠铃卧推 5组 x 6-8次', '肩推 4组 x 8次', '倾斜卧推 4组 x 8-10次', '三头肌训练 4组'] },
							{ day: '周三', focus: '拉力主导', exercises: ['硬拉 4组 x 6次', '引体向上 4组 x 8次', '杠铃划船 4组 x 8次', '二头肌训练 4组'] },
							{ day: '周五', focus: '下肢主导', exercises: ['杠铃深蹲 5组 x 6-8次', '前蹲 3组 x 8次', '罗马尼亚硬拉 4组 x 8次', '腿部辅助训练 3组'] }
						],
						4: [
							{ day: '周一', focus: '胸肌推力', exercises: ['杠铃卧推 5组 x 6-8次', '倾斜杠铃卧推 4组 x 8-10次', '双杠臂屈伸 4组 x 8-12次', '三头肌训练 3组'] },
							{ day: '周二', focus: '背部拉力', exercises: ['加重引体向上 5组 x 5-8次', 'T杠划船 4组 x 6-8次', '单臂哑铃划船 4组 x 8-10次', '二头肌训练 3组'] },
							{ day: '周四', focus: '下肢力量', exercises: ['杠铃深蹲 5组 x 6-8次', '前蹲 4组 x 8-10次', '杠铃硬拉 4组 x 6-8次', '腿部辅助 3组'] },
							{ day: '周六', focus: '肩部推力', exercises: ['杠铃肩推 5组 x 6-8次', '哑铃肩推 4组 x 8-10次', '倒立撑 3组 x 5-8次', '侧平举 3组 x 12-15次'] }
						],
						5: [
							{ day: '周一', focus: '胸部', exercises: ['杠铃卧推 5组 x 6-8次', '上斜杠铃卧推 4组 x 8-10次', '下斜哑铃卧推 4组 x 10-12次', '双杠臂屈伸 3组 x 8-12次'] },
							{ day: '周二', focus: '背部', exercises: ['加重引体向上 5组 x 5-8次', 'T杠划船 4组 x 6-8次', '单臂哑铃划船 4组 x 8-10次', '高位下拉 3组 x 10-12次'] },
							{ day: '周三', focus: '腿部', exercises: ['杠铃深蹲 5组 x 6-8次', '前蹲 4组 x 8-10次', '杠铃硬拉 4组 x 6-8次', '保加利亚深蹲 3组 x 10-12次'] },
							{ day: '周五', focus: '肩部', exercises: ['杠铃肩推 5组 x 6-8次', '哑铃肩推 4组 x 8-10次', '倒立撑 3组 x 5-8次', '后束飞鸟 3组 x 12-15次'] },
							{ day: '周六', focus: '手臂', exercises: ['杠铃弯举 5组 x 6-8次', '近距离卧推 5组 x 6-8次', '锤式弯举 4组 x 8-10次', '三头肌伸展 3组 x 10-12次'] },
							{ day: '周六', focus: '腿部 (后链)', exercises: ['杠铃硬拉 4组 x 6-8次', '罗马尼亚硬拉 4组 x 8-10次', '腿弯举 4组 x 12-15次', '小腿提踵 4组 x 15-20次'] }
						],
						6: [
							{ day: '周一', focus: '胸部', exercises: ['杠铃卧推 5组 x 6-8次', '上斜杠铃卧推 4组 x 8-10次', '下斜哑铃卧推 4组 x 10-12次', '双杠臂屈伸 3组 x 8-12次'] },
							{ day: '周二', focus: '背部', exercises: ['加重引体向上 5组 x 5-8次', 'T杠划船 4组 x 6-8次', '单臂哑铃划船 4组 x 8-10次', '高位下拉 3组 x 10-12次'] },
							{ day: '周三', focus: '腿部 (股四头肌)', exercises: ['杠铃深蹲 5组 x 6-8次', '前蹲 4组 x 8-10次', '腿举 4组 x 12-15次', '腿屈伸 3组 x 12-15次'] },
							{ day: '周四', focus: '肩部', exercises: ['杠铃肩推 5组 x 6-8次', '哑铃肩推 4组 x 8-10次', '倒立撑 3组 x 5-8次', '后束飞鸟 3组 x 12-15次'] },
							{ day: '周五', focus: '手臂', exercises: ['杠铃弯举 5组 x 6-8次', '近距离卧推 5组 x 6-8次', '锤式弯举 4组 x 8-10次', '三头肌伸展 3组 x 10-12次'] },
							{ day: '周六', focus: '腿部 (后链)', exercises: ['杠铃硬拉 4组 x 6-8次', '罗马尼亚硬拉 4组 x 8-10次', '腿弯举 4组 x 12-15次', '小腿提踵 4组 x 15-20次'] }
						]
					}
				},
				// 减脂一周计划
				1: {
					初级: {
						3: [
							{ day: '周一', focus: 'HIIT入门', exercises: ['开合跳 30秒/休息30秒 x 8轮', '高抬腿 30秒/休息30秒 x 6轮', '深蹲 30秒/休息30秒 x 6轮'] },
							{ day: '周三', focus: '力量循环', exercises: ['徒手深蹲 15次', '俯卧撑 10次', '平板支撑 30秒', '登山者 20次', '重复3轮'] },
							{ day: '周五', focus: '有氧恢复', exercises: ['快走 20-30分钟', '拉伸 10分钟', '深呼吸练习 5分钟'] }
						],
						4: [
							{ day: '周一', focus: 'HIIT训练', exercises: ['开合跳 45秒/休息15秒 x 8轮', '波比跳 30秒/休息30秒 x 6轮'] },
							{ day: '周二', focus: '力量训练', exercises: ['徒手深蹲 3组 x 15次', '俯卧撑 3组 x 10次', '平板支撑 3组 x 45秒'] },
							{ day: '周四', focus: '有氧训练', exercises: ['快走 25分钟', '登山者 3组 x 30秒', '拉伸 10分钟'] },
							{ day: '周五', focus: '核心训练', exercises: ['卷腹 3组 x 20次', '俄罗斯转体 3组 x 20次', '死虫式 3组 x 15次'] }
						],
						5: [
							{ day: '周一', focus: 'HIIT训练', exercises: ['开合跳 45秒/休息15秒 x 8轮', '波比跳 30秒/休息30秒 x 6轮', '高抬腿 30秒/休息30秒 x 6轮'] },
							{ day: '周二', focus: '上肢力量', exercises: ['俯卧撑 3组 x 10次', '墙面俯卧撑 3组 x 15次', '三头肌撑体 3组 x 8次'] },
							{ day: '周三', focus: '有氧训练', exercises: ['快走 30分钟', '台阶踏步 10分钟', '拉伸 10分钟'] },
							{ day: '周五', focus: '下肢训练', exercises: ['徒手深蹲 3组 x 15次', '弓步蹲 3组 x 10次', '小腿提踵 3组 x 20次'] },
							{ day: '周六', focus: '核心训练', exercises: ['卷腹 3组 x 20次', '俄罗斯转体 3组 x 20次', '平板支撑 3组 x 45秒', '死虫式 3组 x 15次'] }
						],
						6: [
							{ day: '周一', focus: 'HIIT训练', exercises: ['开合跳 45秒/休息15秒 x 8轮', '波比跳 30秒/休息30秒 x 6轮', '高抬腿 30秒/休息30秒 x 6轮'] },
							{ day: '周二', focus: '上肢力量', exercises: ['俯卧撑 3组 x 10次', '墙面俯卧撑 3组 x 15次', '三头肌撑体 3组 x 8次'] },
							{ day: '周三', focus: '有氧训练', exercises: ['快走 30分钟', '台阶踏步 10分钟', '拉伸 10分钟'] },
							{ day: '周四', focus: '轻度循环', exercises: ['轻度全身循环训练 20分钟', '柔韧性训练 15分钟', '深呼吸放松 5分钟'] },
							{ day: '周五', focus: '下肢训练', exercises: ['徒手深蹲 3组 x 15次', '弓步蹲 3组 x 10次', '小腿提踵 3组 x 20次'] },
							{ day: '周六', focus: '核心训练', exercises: ['卷腹 3组 x 20次', '俄罗斯转体 3组 x 20次', '平板支撑 3组 x 45秒', '死虫式 3组 x 15次'] }
						]
					},
					中级: {
						3: [
							{ day: '周一', focus: '高强度HIIT', exercises: ['波比跳 45秒/休息15秒 x 10轮', '高抬腿跑 45秒/休息15秒 x 8轮'] },
							{ day: '周三', focus: '力量代谢', exercises: ['深蹲跳 4组 x 12次', '俯卧撑 4组 x 15次', '登山者 4组 x 40秒'] },
							{ day: '周五', focus: '有氧间歇', exercises: ['跑步间歇 30分钟', '核心训练 15分钟', '拉伸 10分钟'] }
						],
						4: [
							{ day: '周一', focus: '全身HIIT', exercises: ['波比跳 45秒/15秒休息 x 12轮', '深蹲跳 45秒/15秒休息 x 10轮'] },
							{ day: '周二', focus: '上肢力量', exercises: ['俯卧撑 4组 x 15次', '钻石俯卧撑 3组 x 8次', '倒立撑墙 3组 x 30秒'] },
							{ day: '周四', focus: '下肢爆发', exercises: ['深蹲跳 4组 x 15次', '单腿跳 3组 x 10次', '箭步蹲跳 3组 x 12次'] },
							{ day: '周六', focus: '有氧耐力', exercises: ['中等强度跑步 35分钟', '核心稳定 10分钟', '柔韧性训练 10分钟'] }
						],
						5: [
							{ day: '周一', focus: '全身HIIT', exercises: ['波比跳 45秒/15秒休息 x 12轮', '深蹲跳 45秒/15秒休息 x 10轮', '登山者 45秒/15秒休息 x 8轮'] },
							{ day: '周二', focus: '上肢力量', exercises: ['俯卧撑 4组 x 15次', '钻石俯卧撑 3组 x 8次', '倒立撑墙 3组 x 30秒', '三头肌撑体 3组 x 10次'] },
							{ day: '周三', focus: '核心训练', exercises: ['平板支撑 4组 x 60秒', '俄罗斯转体 4组 x 25次', '卷腹 4组 x 20次', '死虫式 3组 x 15次'] },
							{ day: '周五', focus: '下肢爆发', exercises: ['深蹲跳 4组 x 15次', '单腿跳 3组 x 10次', '箭步蹲跳 3组 x 12次', '蛙跳 3组 x 8次'] },
							{ day: '周六', focus: '有氧耐力', exercises: ['中等强度跑步 40分钟', '核心稳定 15分钟', '柔韧性训练 15分钟'] }
						],
						6: [
							{ day: '周一', focus: '全身HIIT', exercises: ['波比跳 45秒/15秒休息 x 12轮', '深蹲跳 45秒/15秒休息 x 10轮', '登山者 45秒/15秒休息 x 8轮'] },
							{ day: '周二', focus: '上肢力量', exercises: ['俯卧撑 4组 x 15次', '钻石俯卧撑 3组 x 8次', '倒立撑墙 3组 x 30秒', '三头肌撑体 3组 x 10次'] },
							{ day: '周三', focus: '核心训练', exercises: ['平板支撑 4组 x 60秒', '俄罗斯转体 4组 x 25次', '卷腹 4组 x 20次', '死虫式 3组 x 15次'] },
							{ day: '周四', focus: '间歇有氧', exercises: ['高强度间歇跑 30分钟', '变速跑训练', '恢复拉伸 10分钟'] },
							{ day: '周五', focus: '下肢爆发', exercises: ['深蹲跳 4组 x 15次', '单腿跳 3组 x 10次', '箭步蹲跳 3组 x 12次', '蛙跳 3组 x 8次'] },
							{ day: '周六', focus: '有氧耐力', exercises: ['中等强度跑步 45分钟', '核心稳定 15分钟', '柔韧性训练 15分钟'] }
						]
					},
					高级: {
						3: [
							{ day: '周一', focus: '高强度HIIT', exercises: ['波比跳 45秒/休息15秒 x 15轮', '单腿波比 45秒/休息15秒 x 8轮', '跳箱 45秒/休息15秒 x 10轮'] },
							{ day: '周三', focus: '力量代谢', exercises: ['深蹲跳 5组 x 15次', '俯卧撑 5组 x 20次', '登山者 5组 x 50秒', '战绳 4组 x 30秒'] },
							{ day: '周五', focus: '有氧间歇', exercises: ['高强度跑步间歇 40分钟', '核心爆发训练 20分钟', '拉伸 15分钟'] }
						],
						4: [
							{ day: '周一', focus: '极限HIIT', exercises: ['波比跳 45秒/休息15秒 x 15轮', '单腿波比 45秒/休息15秒 x 10轮', '跳箱 45秒/休息15秒 x 12轮'] },
							{ day: '周二', focus: '上肢爆发', exercises: ['爆发式俯卧撑 5组 x 12次', '钻石俯卧撑 4组 x 15次', '倒立撑 4组 x 8次', '引体向上 4组 x 12次'] },
							{ day: '周四', focus: '下肢爆发', exercises: ['深蹲跳 5组 x 20次', '单腿跳 4组 x 15次', '箭步蹲跳 4组 x 16次', '蛙跳 4组 x 12次'] },
							{ day: '周六', focus: '耐力挑战', exercises: ['高强度跑步 45分钟', '核心稳定挑战 20分钟', '柔韧性恢复 15分钟'] }
						],
						5: [
							{ day: '周一', focus: '极限HIIT', exercises: ['波比跳 45秒/休息15秒 x 15轮', '单腿波比 45秒/休息15秒 x 10轮', '跳箱 45秒/休息15秒 x 12轮', '战绳 45秒/休息15秒 x 8轮'] },
							{ day: '周二', focus: '上肢爆发', exercises: ['爆发式俯卧撑 5组 x 12次', '钻石俯卧撑 4组 x 15次', '倒立撑 4组 x 8次', '引体向上 4组 x 12次'] },
							{ day: '周三', focus: '代谢循环', exercises: ['全身爆发循环 50分钟', '高强度代谢训练', '间歇恢复训练'] },
							{ day: '周五', focus: '下肢爆发', exercises: ['深蹲跳 5组 x 20次', '单腿跳 4组 x 15次', '箭步蹲跳 4组 x 16次', '蛙跳 4组 x 12次'] },
							{ day: '周六', focus: '耐力挑战', exercises: ['高强度跑步 50分钟', '核心稳定挑战 25分钟', '柔韧性恢复 15分钟'] }
						],
						6: [
							{ day: '周一', focus: '极限HIIT', exercises: ['波比跳 45秒/休息15秒 x 15轮', '单腿波比 45秒/休息15秒 x 10轮', '跳箱 45秒/休息15秒 x 12轮', '战绳 45秒/休息15秒 x 8轮'] },
							{ day: '周二', focus: '上肢爆发', exercises: ['爆发式俯卧撑 5组 x 12次', '钻石俯卧撑 4组 x 15次', '倒立撑 4组 x 8次', '引体向上 4组 x 12次'] },
							{ day: '周三', focus: '代谢循环', exercises: ['全身爆发循环 50分钟', '高强度代谢训练', '间歇恢复训练'] },
							{ day: '周四', focus: '竞技训练', exercises: ['竞技级间歇训练 40分钟', '爆发力专项训练 20分钟', '恢复拉伸 10分钟'] },
							{ day: '周五', focus: '下肢爆发', exercises: ['深蹲跳 5组 x 20次', '单腿跳 4组 x 15次', '箭步蹲跳 4组 x 16次', '蛙跳 4组 x 12次'] },
							{ day: '周六', focus: '耐力挑战', exercises: ['高强度跑步 55分钟', '核心稳定挑战 25分钟', '柔韧性恢复 20分钟'] }
						]
					}
				},
				// 力量提升一周计划
				2: {
					初级: {
						3: [
							{ day: '周一', focus: '基础力量A', exercises: ['杠铃深蹲 4组 x 8-10次', '杠铃卧推 4组 x 8-10次', '辅助练习 2组'] },
							{ day: '周三', focus: '基础力量B', exercises: ['硬拉 3组 x 6-8次', '杠铃肩推 4组 x 8-10次', '辅助练习 2组'] },
							{ day: '周五', focus: '基础力量C', exercises: ['杠铃深蹲 4组 x 8-10次', '杠铃划船 4组 x 8-10次', '辅助练习 2组'] }
						],
						4: [
							{ day: '周一', focus: '胸肩推', exercises: ['杠铃卧推 4组 x 8次', '哑铃肩推 3组 x 10次', '三头肌下压 3组 x 12次'] },
							{ day: '周二', focus: '腿部力量', exercises: ['杠铃深蹲 4组 x 8次', '腿举 3组 x 12次', '小腿提踵 3组 x 15次'] },
							{ day: '周四', focus: '拉力训练', exercises: ['硬拉 4组 x 6次', '杠铃划船 3组 x 8次', '引体向上 3组 x 最大次数'] },
							{ day: '周六', focus: '全身力量', exercises: ['深蹲 3组 x 8次', '卧推 3组 x 8次', '划船 3组 x 8次', '核心训练 15分钟'] }
						]
					},
					中级: {
						3: [
							{ day: '周一', focus: '重量训练A', exercises: ['杠铃深蹲 5组 x 5次', '杠铃卧推 5组 x 5次', '辅助练习 3组'] },
							{ day: '周三', focus: '重量训练B', exercises: ['硬拉 4组 x 3-5次', '杠铃肩推 4组 x 6次', '引体向上 4组 x 8次'] },
							{ day: '周五', focus: '重量训练C', exercises: ['前蹲 4组 x 6次', '倾斜卧推 4组 x 6次', '杠铃划船 4组 x 6次'] }
						],
						4: [
							{ day: '周一', focus: '上肢推力', exercises: ['杠铃卧推 5组 x 5次', '肩推 4组 x 6次', '窄距卧推 3组 x 8次', '三头肌训练 3组'] },
							{ day: '周二', focus: '下肢力量', exercises: ['杠铃深蹲 5组 x 5次', '前蹲 3组 x 8次', '罗马尼亚硬拉 3组 x 8次'] },
							{ day: '周四', focus: '上肢拉力', exercises: ['硬拉 4组 x 5次', '引体向上 4组 x 8次', '杠铃划船 4组 x 6次', '二头肌训练 3组'] },
							{ day: '周六', focus: '辅助训练', exercises: ['倾斜卧推 4组 x 8次', '保加利亚深蹲 3组 x 10次', '核心力量训练 20分钟'] }
						],
						5: [
							{ day: '周一', focus: '上肢推力', exercises: ['杠铃卧推 5组 x 5次', '肩推 4组 x 6次', '窄距卧推 3组 x 8次', '三头肌训练 3组'] },
							{ day: '周二', focus: '下肢力量', exercises: ['杠铃深蹲 5组 x 5次', '前蹲 3组 x 8次', '罗马尼亚硬拉 3组 x 8次', '腿部辅助 2组'] },
							{ day: '周三', focus: '上肢拉力', exercises: ['硬拉 4组 x 5次', '引体向上 4组 x 8次', '杠铃划船 4组 x 6次', '二头肌训练 3组'] },
							{ day: '周五', focus: '动力举专项', exercises: ['杠铃深蹲 6组 x 3次', '杠铃卧推 6组 x 3次', '硬拉 5组 x 3次'] },
							{ day: '周六', focus: '辅助训练', exercises: ['倾斜卧推 4组 x 8次', '保加利亚深蹲 3组 x 10次', '核心力量训练 20分钟'] }
						],
						6: [
							{ day: '周一', focus: '深蹲专项', exercises: ['杠铃深蹲 6组 x 3-5次', '前蹲 4组 x 6次', '保加利亚深蹲 3组 x 8次', '核心稳定 15分钟'] },
							{ day: '周二', focus: '卧推专项', exercises: ['杠铃卧推 6组 x 3-5次', '倾斜卧推 4组 x 6次', '窄距卧推 3组 x 8次', '三头肌专项 3组'] },
							{ day: '周三', focus: '硬拉专项', exercises: ['硬拉 5组 x 3-5次', '罗马尼亚硬拉 4组 x 6次', '杠铃划船 4组 x 6次', '后链强化 3组'] },
							{ day: '周四', focus: '肩推专项', exercises: ['杠铃肩推 5组 x 5次', '哑铃肩推 4组 x 8次', '侧平举 3组 x 12次', '后束训练 3组'] },
							{ day: '周五', focus: '动力训练', exercises: ['爆发力深蹲 5组 x 3次', '速度卧推 5组 x 3次', '动态拉伸 15分钟'] },
							{ day: '周六', focus: '辅助恢复', exercises: ['轻重量辅助练习', '柔韧性训练 20分钟', '恢复性有氧 15分钟'] }
						],
						高级: {
							3: [
								{ day: '周一', focus: '最大力量A', exercises: ['杠铃深蹲 6组 x 2-3次', '杠铃卧推 6组 x 2-3次', '辅助练习 3组'] },
								{ day: '周三', focus: '最大力量B', exercises: ['硬拉 5组 x 1-3次', '杠铃肩推 5组 x 3-5次', '引体向上 5组 x 8次'] },
								{ day: '周五', focus: '最大力量C', exercises: ['前蹲 5组 x 3-5次', '倾斜卧推 5组 x 3-5次', '杠铃划船 5组 x 5次'] }
							],
							4: [
								{ day: '周一', focus: '深蹲主导', exercises: ['杠铃深蹲 7组 x 1-3次', '前蹲 4组 x 5次', '保加利亚深蹲 3组 x 8次', '核心稳定 15分钟'] },
								{ day: '周二', focus: '卧推主导', exercises: ['杠铃卧推 7组 x 1-3次', '倾斜卧推 4组 x 5次', '窄距卧推 3组 x 8次', '三头肌专项 3组'] },
								{ day: '周四', focus: '硬拉主导', exercises: ['硬拉 6组 x 1-3次', '罗马尼亚硬拉 4组 x 5次', '杠铃划船 4组 x 5次', '后链强化 3组'] },
								{ day: '周六', focus: '速度力量', exercises: ['速度深蹲 6组 x 3次', '速度卧推 6组 x 3次', '爆发力训练 20分钟'] }
							],
							5: [
								{ day: '周一', focus: '深蹲主导', exercises: ['杠铃深蹲 7组 x 1-3次', '前蹲 4组 x 5次', '保加利亚深蹲 3组 x 8次', '核心稳定 15分钟'] },
								{ day: '周二', focus: '卧推主导', exercises: ['杠铃卧推 7组 x 1-3次', '倾斜卧推 4组 x 5次', '窄距卧推 3组 x 8次', '三头肌专项 3组'] },
								{ day: '周三', focus: '硬拉主导', exercises: ['硬拉 6组 x 1-3次', '罗马尼亚硬拉 4组 x 5次', '杠铃划船 4组 x 5次', '后链强化 3组'] },
								{ day: '周五', focus: '肩推主导', exercises: ['杠铃肩推 6组 x 3-5次', '哑铃肩推 4组 x 6次', '倒立撑 3组 x 5次', '肩部稳定 3组'] },
								{ day: '周六', focus: '速度力量', exercises: ['速度深蹲 6组 x 3次', '速度卧推 6组 x 3次', '爆发力训练 25分钟'] }
							],
							6: [
								{ day: '周一', focus: '深蹲主导', exercises: ['杠铃深蹲 7组 x 1-3次', '前蹲 4组 x 5次', '保加利亚深蹲 3组 x 8次', '核心稳定 15分钟'] },
								{ day: '周二', focus: '卧推主导', exercises: ['杠铃卧推 7组 x 1-3次', '倾斜卧推 4组 x 5次', '窄距卧推 3组 x 8次', '三头肌专项 3组'] },
								{ day: '周三', focus: '硬拉主导', exercises: ['硬拉 6组 x 1-3次', '罗马尼亚硬拉 4组 x 5次', '杠铃划船 4组 x 5次', '后链强化 3组'] },
								{ day: '周四', focus: '肩推主导', exercises: ['杠铃肩推 6组 x 3-5次', '哑铃肩推 4组 x 6次', '倒立撑 3组 x 5次', '肩部稳定 3组'] },
								{ day: '周五', focus: '专项力量', exercises: ['专项技术训练', '弱点强化训练', '竞技力量训练 30分钟'] },
								{ day: '周六', focus: '速度力量', exercises: ['速度深蹲 6组 x 3次', '速度卧推 6组 x 3次', '爆发力训练 25分钟', '恢复训练 15分钟'] }
							]
						}
					}
				},
				// 耐力训练一周计划
				3: {
					初级: {
						3: [
							{ day: '周一', focus: '有氧基础', exercises: ['快走 20-30分钟', '核心训练 10分钟', '拉伸 10分钟'] },
							{ day: '周三', focus: '力量耐力', exercises: ['深蹲 15次 x 3组', '俯卧撑 10次 x 3组', '平板支撑 30秒 x 3组', '组间休息45秒'] },
							{ day: '周五', focus: '混合训练', exercises: ['慢跑 15分钟', '功能性训练 15分钟', '柔韧性训练 10分钟'] }
						],
						4: [
							{ day: '周一', focus: '有氧基础', exercises: ['快走/慢跑 25分钟', '动态拉伸 10分钟'] },
							{ day: '周二', focus: '力量耐力', exercises: ['循环训练：深蹲、俯卧撑、平板支撑各45秒', '休息15秒', '重复6轮'] },
							{ day: '周四', focus: '间歇训练', exercises: ['跑步间歇：快跑1分钟/慢跑2分钟 x 8轮', '拉伸 10分钟'] },
							{ day: '周六', focus: '综合训练', exercises: ['长时间有氧 30分钟', '核心稳定训练 15分钟', '柔韧性训练 15分钟'] }
						]
					},
					中级: {
						3: [
							{ day: '周一', focus: '有氧间歇', exercises: ['跑步间歇 30分钟', '核心训练 15分钟', '动态恢复 10分钟'] },
							{ day: '周三', focus: '肌肉耐力', exercises: ['循环训练 40分钟', '功能性动作模式', '稳定性训练'] },
							{ day: '周五', focus: '混合耐力', exercises: ['长距离有氧 40分钟', '力量耐力训练 20分钟', '恢复训练 10分钟'] }
						],
						4: [
							{ day: '周一', focus: '心肺耐力', exercises: ['连续跑步 35分钟', '变速跑间歇 10分钟', '拉伸 10分钟'] },
							{ day: '周二', focus: '力量耐力', exercises: ['全身循环训练 45分钟', '高次数重量训练', '核心稳定 15分钟'] },
							{ day: '周四', focus: '运动耐力', exercises: ['间歇训练 30分钟', '爆发力训练 15分钟', '恢复训练 10分钟'] },
							{ day: '周六', focus: '综合耐力', exercises: ['长时间混合训练 50分钟', '柔韧性和恢复训练 20分钟'] }
						],
						5: [
							{ day: '周一', focus: '心肺耐力', exercises: ['连续跑步 40分钟', '变速跑间歇 15分钟', '拉伸 10分钟'] },
							{ day: '周二', focus: '力量耐力', exercises: ['全身循环训练 50分钟', '高次数重量训练', '核心稳定 15分钟'] },
							{ day: '周三', focus: '混合耐力', exercises: ['游泳训练 30分钟', '自行车训练 20分钟', '恢复拉伸 10分钟'] },
							{ day: '周五', focus: '运动耐力', exercises: ['间歇训练 35分钟', '爆发力训练 15分钟', '恢复训练 10分钟'] },
							{ day: '周六', focus: '综合耐力', exercises: ['长时间混合训练 60分钟', '柔韧性和恢复训练 20分钟'] }
						],
						6: [
							{ day: '周一', focus: '心肺耐力', exercises: ['连续跑步 45分钟', '变速跑间歇 15分钟', '拉伸 10分钟'] },
							{ day: '周二', focus: '力量耐力', exercises: ['全身循环训练 50分钟', '高次数重量训练', '核心稳定 15分钟'] },
							{ day: '周三', focus: '水中训练', exercises: ['游泳耐力训练 40分钟', '水中阻力训练 15分钟', '恢复放松 10分钟'] },
							{ day: '周四', focus: '自行车耐力', exercises: ['长距离骑行 60分钟', '爬坡训练 15分钟', '腿部恢复 10分钟'] },
							{ day: '周五', focus: '运动耐力', exercises: ['间歇训练 35分钟', '爆发力训练 15分钟', '恢复训练 10分钟'] },
							{ day: '周六', focus: '综合耐力', exercises: ['长时间混合训练 70分钟', '柔韧性和恢复训练 25分钟'] }
						],
						高级: {
							3: [
								{ day: '周一', focus: '极限耐力', exercises: ['长距离跑步 60分钟', '核心耐力训练 20分钟', '恢复训练 15分钟'] },
								{ day: '周三', focus: '功能耐力', exercises: ['混合功能训练 60分钟', '高强度循环训练', '专项耐力训练'] },
								{ day: '周五', focus: '竞技耐力', exercises: ['竞技级耐力训练 70分钟', '专项技能训练 20分钟', '恢复训练 15分钟'] }
							],
							4: [
								{ day: '周一', focus: '有氧极限', exercises: ['极限有氧训练 70分钟', '心率控制训练', '恢复拉伸 15分钟'] },
								{ day: '周二', focus: '力量耐力', exercises: ['高强度力量耐力 60分钟', '功能性训练', '核心稳定 20分钟'] },
								{ day: '周四', focus: '速度耐力', exercises: ['速度耐力训练 50分钟', '间歇冲刺训练', '恢复训练 15分钟'] },
								{ day: '周六', focus: '综合挑战', exercises: ['综合耐力挑战 80分钟', '多项目混合训练', '深度恢复 20分钟'] }
							],
							5: [
								{ day: '周一', focus: '有氧极限', exercises: ['极限有氧训练 75分钟', '心率控制训练', '恢复拉伸 15分钟'] },
								{ day: '周二', focus: '力量耐力', exercises: ['高强度力量耐力 60分钟', '功能性训练', '核心稳定 20分钟'] },
								{ day: '周三', focus: '专项耐力', exercises: ['专项耐力训练 50分钟', '技能训练 20分钟', '柔韧性训练 15分钟'] },
								{ day: '周五', focus: '速度耐力', exercises: ['速度耐力训练 55分钟', '间歇冲刺训练', '恢复训练 15分钟'] },
								{ day: '周六', focus: '综合挑战', exercises: ['综合耐力挑战 90分钟', '多项目混合训练', '深度恢复 25分钟'] }
							],
							6: [
								{ day: '周一', focus: '有氧极限', exercises: ['极限有氧训练 75分钟', '心率控制训练', '恢复拉伸 15分钟'] },
								{ day: '周二', focus: '力量耐力', exercises: ['高强度力量耐力 60分钟', '功能性训练', '核心稳定 20分钟'] },
								{ day: '周三', focus: '水中极限', exercises: ['极限游泳训练 60分钟', '水中耐力挑战', '恢复游泳 15分钟'] },
								{ day: '周四', focus: '自行车极限', exercises: ['极限骑行训练 90分钟', '爬坡耐力挑战', '腿部恢复 15分钟'] },
								{ day: '周五', focus: '速度耐力', exercises: ['速度耐力训练 55分钟', '间歇冲刺训练', '恢复训练 15分钟'] },
								{ day: '周六', focus: '综合挑战', exercises: ['综合耐力挑战 100分钟', '多项目混合训练', '深度恢复 30分钟'] }
							]
						}
					}
				}
			};
			
			// 获取对应的计划
			const goalPlans = weeklyPlans[goal] || weeklyPlans[0];
			const levelName = ['初级', '中级', '高级'][level];
			const levelPlans = goalPlans[levelName] || goalPlans['初级'];
			const dayCount = schedule.length;
			
			// 根据训练天数选择合适的计划
			let selectedPlan = levelPlans[dayCount] || levelPlans[3] || levelPlans[Object.keys(levelPlans)[0]];
			
			// 调整天数对应
			if (selectedPlan && selectedPlan.length !== schedule.length) {
				selectedPlan = selectedPlan.slice(0, schedule.length);
				selectedPlan.forEach((day, index) => {
					if (schedule[index]) {
						day.day = schedule[index];
					}
				});
			}
			
			// 转换计划数据为对象格式
			const convertedPlan = this.convertPlanData(selectedPlan || []);
			return convertedPlan;
		},
		
		generateMuscleGainPlan(schedule, level) {
			const exercises = {
				初级: {
					chest: ['俯卧撑 3组 x 8-12次', '哑铃卧推 3组 x 10-12次', '哑铃飞鸟 3组 x 12-15次'],
					back: ['辅助引体向上 3组 x 5-8次', '哑铃划船 3组 x 10-12次', '坐姿划船 3组 x 12-15次'],
					legs: ['徒手深蹲 3组 x 15-20次', '哑铃深蹲 3组 x 12-15次', '腿举 3组 x 15-20次'],
					shoulders: ['哑铃肩推 3组 x 10-12次', '侧平举 3组 x 12-15次', '前平举 3组 x 12-15次'],
					arms: ['哑铃弯举 3组 x 12-15次', '三头肌下压 3组 x 12-15次']
				},
				中级: {
					chest: ['杠铃卧推 4组 x 8-10次', '上斜哑铃卧推 3组 x 10-12次', '双杠臂屈伸 3组 x 8-12次'],
					back: ['引体向上 4组 x 6-10次', '杠铃划船 4组 x 8-10次', '高位下拉 3组 x 10-12次'],
					legs: ['杠铃深蹲 4组 x 8-10次', '罗马尼亚硬拉 4组 x 8-10次', '保加利亚深蹲 3组 x 10-12次'],
					shoulders: ['杠铃肩推 4组 x 8-10次', '阿诺德推举 3组 x 10-12次', '面拉 3组 x 12-15次'],
					arms: ['杠铃弯举 4组 x 8-10次', '窄距卧推 4组 x 8-10次']
				},
				高级: {
					chest: ['杠铃卧推 5组 x 6-8次', '上斜杠铃卧推 4组 x 8-10次', '下斜哑铃卧推 4组 x 10-12次'],
					back: ['加重引体向上 5组 x 5-8次', 'T杠划船 4组 x 6-8次', '单臂哑铃划船 4组 x 8-10次'],
					legs: ['杠铃深蹲 5组 x 6-8次', '前蹲 4组 x 8-10次', '杠铃硬拉 4组 x 6-8次'],
					shoulders: ['杠铃肩推 5组 x 6-8次', '哑铃肩推 4组 x 8-10次', '倒立撑 3组 x 5-8次'],
					arms: ['杠铃弯举 5组 x 6-8次', '近距离卧推 5组 x 6-8次']
				}
			};
			
			const levelName = ['初级', '中级', '高级'][level];
			const ex = exercises[levelName];
			
			let plan = [];
			if (schedule.length === 3) {
				plan = [
					{ day: schedule[0], focus: '胸肌 & 三头肌', exercises: [...ex.chest, ...ex.arms.slice(1, 2)] },
					{ day: schedule[1], focus: '背部 & 二头肌', exercises: [...ex.back, ...ex.arms.slice(0, 1)] },
					{ day: schedule[2], focus: '腿部 & 肩部', exercises: [...ex.legs, ...ex.shoulders.slice(0, 2)] }
				];
			} else if (schedule.length === 4) {
				plan = [
					{ day: schedule[0], focus: '胸肌', exercises: ex.chest },
					{ day: schedule[1], focus: '背部', exercises: ex.back },
					{ day: schedule[2], focus: '腿部', exercises: ex.legs },
					{ day: schedule[3], focus: '肩部 & 手臂', exercises: [...ex.shoulders, ...ex.arms] }
				];
			} else if (schedule.length === 5) {
				plan = [
					{ day: schedule[0], focus: '胸肌', exercises: ex.chest },
					{ day: schedule[1], focus: '背部', exercises: ex.back },
					{ day: schedule[2], focus: '腿部', exercises: ex.legs },
					{ day: schedule[3], focus: '肩部', exercises: ex.shoulders },
					{ day: schedule[4], focus: '手臂', exercises: ex.arms }
				];
			} else {
				plan = [
					{ day: schedule[0], focus: '胸肌', exercises: ex.chest },
					{ day: schedule[1], focus: '背部', exercises: ex.back },
					{ day: schedule[2], focus: '腿部 (股四头肌)', exercises: ex.legs.slice(0, 2) },
					{ day: schedule[3], focus: '肩部', exercises: ex.shoulders },
					{ day: schedule[4], focus: '手臂', exercises: ex.arms },
					{ day: schedule[5], focus: '腿部 (后链)', exercises: [ex.legs[1], '臀桥 3组 x 15-20次', '小腿提踵 4组 x 15-20次'] }
				];
			}
			
			// 转换计划数据为对象格式
			return this.convertPlanData(plan);
		},
		
		generateFatLossPlan(schedule, level) {
			const workouts = {
				初级: {
					hiit: ['开合跳 30秒/休息30秒', '高抬腿 30秒/休息30秒', '深蹲 30秒/休息30秒', '俯卧撑 30秒/休息30秒'],
					strength: ['徒手深蹲 3组 x 15次', '俯卧撑 3组 x 8-12次', '平板支撑 3组 x 30-45秒'],
					cardio: ['快走 20-30分钟', '椭圆机 15-20分钟', '自行车 20-25分钟']
				},
				中级: {
					hiit: ['波比跳 40秒/休息20秒', '登山者 40秒/休息20秒', '深蹲跳 40秒/休息20秒', '俯卧撑 40秒/休息20秒'],
					strength: ['杠铃深蹲 4组 x 12-15次', '杠铃卧推 4组 x 12-15次', '划船 4组 x 12-15次'],
					cardio: ['跑步 25-35分钟', '椭圆机 20-30分钟', '划船机 15-25分钟']
				},
				高级: {
					hiit: ['波比跳 45秒/休息15秒', '单腿波比 45秒/休息15秒', '跳箱 45秒/休息15秒', '战绳 45秒/休息15秒'],
					strength: ['杠铃深蹲 5组 x 15-20次', '杠铃卧推 5组 x 15-20次', '硬拉 5组 x 12-15次'],
					cardio: ['跑步 35-45分钟', '游泳 30-40分钟', '划船机 25-35分钟']
				}
			};
			
			const levelName = ['初级', '中级', '高级'][level];
			const ex = workouts[levelName];
			
			const plan = [];
			for (let i = 0; i < schedule.length; i++) {
				if (i % 3 === 0) {
					plan.push({ day: schedule[i], focus: 'HIIT训练', exercises: [...ex.hiit, '共3-4轮，轮间休息90秒'] });
				} else if (i % 3 === 1) {
					plan.push({ day: schedule[i], focus: '力量循环', exercises: [...ex.strength, '组间休息45-60秒'] });
				} else {
					plan.push({ day: schedule[i], focus: '有氧训练', exercises: [...ex.cardio.slice(0, 1), '拉伸 10-15分钟'] });
				}
			}
			
			// 转换计划数据为对象格式
			return this.convertPlanData(plan || []);
		},
		
		generateStrengthPlan(schedule, level) {
			const exercises = {
				初级: {
					squat: '杠铃深蹲 4组 x 8-10次',
					bench: '杠铃卧推 4组 x 8-10次',
					deadlift: '硬拉 3组 x 6-8次',
					press: '杠铃肩推 4组 x 8-10次',
					row: '杠铃划船 4组 x 8-10次'
				},
				中级: {
					squat: '杠铃深蹲 5组 x 5-6次',
					bench: '杠铃卧推 5组 x 5-6次',
					deadlift: '硬拉 4组 x 5次',
					press: '杠铃肩推 5组 x 5-6次',
					row: '杠铃划船 5组 x 5-6次'
				},
				高级: {
					squat: '杠铃深蹲 6组 x 3-5次',
					bench: '杠铃卧推 6组 x 3-5次',
					deadlift: '硬拉 5组 x 3-5次',
					press: '杠铃肩推 6组 x 3-5次',
					row: '杠铃划船 6组 x 3-5次'
				}
			};
			
			const levelName = ['初级', '中级', '高级'][level];
			const ex = exercises[levelName];
			
			if (schedule.length === 3) {
				const plan = [
					{ day: schedule[0], focus: '深蹲日', exercises: [ex.squat, ex.bench, '辅助练习 2-3组'] },
					{ day: schedule[1], focus: '卧推日', exercises: [ex.bench, ex.row, '辅助练习 2-3组'] },
					{ day: schedule[2], focus: '硬拉日', exercises: [ex.deadlift, ex.press, '辅助练习 2-3组'] }
				];
				return this.convertPlanData(plan);
			} else {
				const plan = [];
				const mainLifts = [ex.squat, ex.bench, ex.deadlift, ex.press, ex.row];
				const focuses = ['深蹲日', '卧推日', '硬拉日', '肩推日', '划船日'];
				
				for (let i = 0; i < schedule.length; i++) {
					const liftIndex = i % mainLifts.length;
					plan.push({
						day: schedule[i],
						focus: focuses[liftIndex],
						exercises: [mainLifts[liftIndex], '辅助练习 2-3组', '激活练习 2组']
					});
				}
				
				return this.convertPlanData(plan);
			}
		},
		
		generateEndurancePlan(schedule, level) {
			const workouts = {
				初级: {
					cardio: ['快走 20-30分钟', '慢跑 15-20分钟', '自行车 20-30分钟'],
					circuit: ['徒手深蹲 15次', '俯卧撑 8-10次', '平板支撑 30秒', '高抬腿 20次'],
					recovery: ['瑜伽 30分钟', '拉伸 20分钟', '散步 30分钟']
				},
				中级: {
					cardio: ['跑步 30-40分钟', '游泳 25-35分钟', '自行车 40-50分钟'],
					circuit: ['深蹲 20次', '俯卧撑 15次', '平板支撑 60秒', '登山者 30秒'],
					recovery: ['瑜伽 45分钟', '泡沫轴放松 20分钟', '慢跑 20分钟']
				},
				高级: {
					cardio: ['跑步 45-60分钟', '游泳 40-50分钟', '自行车 60-90分钟'],
					circuit: ['深蹲跳 25次', '俯卧撑 20次', '平板支撑 90秒', '波比跳 15次'],
					recovery: ['瑜伽 60分钟', '按摩放松 30分钟', '轻松游泳 30分钟']
				}
			};
			
			const levelName = ['初级', '中级', '高级'][level];
			const ex = workouts[levelName];
			
			const plan = [];
			for (let i = 0; i < schedule.length; i++) {
				if (i % 3 === 0) {
					plan.push({ day: schedule[i], focus: '有氧耐力', exercises: [...ex.cardio.slice(0, 1), '心率控制在60-70%最大心率'] });
				} else if (i % 3 === 1) {
					plan.push({ day: schedule[i], focus: '循环耐力', exercises: [...ex.circuit, '循环3-4轮，轮间休息60秒'] });
				} else {
					plan.push({ day: schedule[i], focus: '恢复训练', exercises: [...ex.recovery.slice(0, 1), '低强度，注重恢复'] });
				}
			}
			
			// 转换计划数据为对象格式
			return this.convertPlanData(plan || []);
		},		async savePlan() {
			if (!this.previewPlan || this.previewPlan.length === 0) {
				uni.showToast({
					title: '请先生成计划',
					icon: 'none'
				});
				return;
			}
			
			// 创建新的计划对象
			const isWeeklyPlan = this.planTypeIndex === 0;
			const planDuration = isWeeklyPlan ? '1周' : this.planWeeks[this.weeksIndex];
			const planDescription = isWeeklyPlan 
				? `一周${this.goals[this.goalIndex]}训练计划，每周训练${this.trainingDays[this.daysIndex]}，适合${this.levels[this.levelIndex]}训练者。`
				: `${planDuration}的${this.goals[this.goalIndex]}训练计划，每周训练${this.trainingDays[this.daysIndex]}，适合${this.levels[this.levelIndex]}训练者。`;
			
			const newPlan = {
				id: Date.now(),
				title: `${this.goals[this.goalIndex]}计划`,
				description: planDescription,
				goal: this.goals[this.goalIndex],
				level: this.levels[this.levelIndex],
				planType: this.planTypes[this.planTypeIndex],
				duration: planDuration,
				trainingDays: this.trainingDays[this.daysIndex],
				status: '未开始',
				statusClass: 'warning',
				progress: isWeeklyPlan ? '0周/共1周' : `0周/共${planDuration.replace('周', '')}周`,
				actionText: '开始计划',
				createdDate: new Date().toISOString().split('T')[0],
				exercises: [...this.previewPlan]
			};
			
			try {
				// 保存到本地存储
				const savedPlans = uni.getStorageSync('myPlans') || [];
				savedPlans.unshift(newPlan);
				uni.setStorageSync('myPlans', savedPlans);
				
				// 尝试同步到云端
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo && userInfo.userId) {
					try {
						await cloudDataService.savePlanToCloud(newPlan);
						console.log('计划已同步至云端');
					} catch (error) {
						console.error('云端同步失败:', error);
						// 云端同步失败不影响本地保存
					}
				}
				
				// 更新显示的计划列表
				this.loadMyPlans();
				
				// 重置预览状态
				this.showPreview = false;
				this.previewPlan = [];
				
				uni.showToast({
					title: '计划已保存到我的计划',
					icon: 'success',
					duration: 2000
				});
			} catch (error) {
				console.error('保存计划失败:', error);
				uni.showToast({
					title: '保存失败，请重试',
					icon: 'none'
				});
			}
		},
		viewPlanDetails(plan) {
			// 显示计划详情
			let detailText = `计划名称：${plan.title}\n`;
			detailText += `计划目标：${plan.goal || '未设置'}\n`;
			detailText += `训练水平：${plan.level || '未设置'}\n`;
			detailText += `训练周期：${plan.duration || '未设置'}\n`;
			detailText += `训练频率：${plan.trainingDays || '未设置'}\n`;
			detailText += `当前状态：${plan.status}\n`;
			detailText += `进度：${plan.progress}\n\n`;
			
			if (plan.exercises && plan.exercises.length > 0) {
				detailText += `训练安排：\n`;
				plan.exercises.forEach((day, index) => {
					detailText += `\n${day.day} - ${day.focus}:\n`;
					day.exercises.forEach(exercise => {
						detailText += `• ${exercise}\n`;
					});
				});
			}
			
			uni.showModal({
				title: '计划详情',
				content: detailText,
				showCancel: true,
				cancelText: '关闭',
				confirmText: plan.status === '未开始' ? '开始计划' : '查看进度',
				success: (res) => {
					if (res.confirm) {
						if (plan.status === '未开始') {
							this.startPlan(plan);
						} else {
							uni.showToast({
								title: '查看进度功能开发中',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		startPlan(plan) {
			// 开始计划
			const savedPlans = uni.getStorageSync('myPlans') || [];
			const planIndex = savedPlans.findIndex(p => p.id === plan.id);
			
			if (planIndex !== -1) {
				savedPlans[planIndex].status = '进行中';
				savedPlans[planIndex].statusClass = 'primary';
				savedPlans[planIndex].actionText = '查看详情';
				savedPlans[planIndex].startDate = new Date().toISOString().split('T')[0];
				
				uni.setStorageSync('myPlans', savedPlans);
				this.loadMyPlans();
				
				uni.showToast({
					title: '计划已开始！',
					icon: 'success'
				});
			}
		},
		loadMyPlans() {
			// 从本地存储加载我的计划
			const savedPlans = uni.getStorageSync('myPlans') || [];
			
			// 如果没有保存的计划，使用默认的示例计划
			if (savedPlans.length === 0) {
				this.myPlans = [
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
					}
				];
			} else {
				this.myPlans = savedPlans;
			}
		},
				// 删除计划
		deletePlan(plan, index) {
			uni.showModal({
				title: '确认删除',
				content: `确定要删除计划"${plan.title}"吗？此操作不可撤销。`,
				confirmText: '删除',
				confirmColor: '#ff4757',
				success: (res) => {
					if (res.confirm) {
						// 从数组中移除计划
						this.myPlans.splice(index, 1);
						
						// 更新本地存储
						uni.setStorageSync('myPlans', this.myPlans);
						
						uni.showToast({
							title: '计划已删除',
							icon: 'success'
						});
					}
				}
			});
		},
		
		// 云同步相关方法
		async syncData() {
			if (this.syncStatus.syncing) {
				return;
			}
			
			this.syncStatus.syncing = true;
			this.syncStatus.icon = 'sync-syncing';
			this.syncStatus.text = '同步中...';
			
			try {
				// 检查用户登录状态
				const userInfo = uni.getStorageSync('userInfo');
				if (!userInfo || !userInfo.userId) {
					uni.showModal({
						title: '需要登录',
						content: '云同步功能需要登录账户，是否前往登录？',
						success: (res) => {
							if (res.confirm) {
								uni.reLaunch({
									url: '/pages/login/login'
								});
							}
						}
					});
					this.updateSyncStatus();
					return;
				}
				
				// 获取本地数据
				const localPlans = uni.getStorageSync('myPlans') || [];
				
				// 上传到云端
				if (localPlans.length > 0) {
					await cloudDataService.syncPlansToCloud(localPlans);
				}
				
				// 从云端获取数据
				const cloudPlans = await cloudDataService.getPlansFromCloud();
				
				// 合并数据
				const mergedPlans = this.mergePlansData(localPlans, cloudPlans);
				
				// 保存合并后的数据
				uni.setStorageSync('myPlans', mergedPlans);
				this.myPlans = mergedPlans;
				
				this.syncStatus.icon = 'sync-connected';
				this.syncStatus.text = '同步完成';
				
				uni.showToast({
					title: '数据同步成功',
					icon: 'success'
				});
				
				// 3秒后恢复正常状态
				setTimeout(() => {
					this.updateSyncStatus();
				}, 3000);
				
			} catch (error) {
				console.error('数据同步失败:', error);
				this.syncStatus.icon = 'sync-error';
				this.syncStatus.text = '同步失败';
				
				uni.showToast({
					title: '同步失败，请稍后重试',
					icon: 'none'
				});
				
				// 3秒后恢复状态
				setTimeout(() => {
					this.updateSyncStatus();
				}, 3000);
			} finally {
				this.syncStatus.syncing = false;
			}
		},
		
		// 更新同步状态
		updateSyncStatus() {
			const userInfo = uni.getStorageSync('userInfo');
			if (userInfo && userInfo.userId) {
				this.syncStatus.icon = 'sync-connected';
				this.syncStatus.text = '已连接';
			} else {
				this.syncStatus.icon = 'sync-disconnected';
				this.syncStatus.text = '未登录';
			}
		},
		
		// 合并计划数据
		mergePlansData(localPlans, cloudPlans) {
			const merged = [...localPlans];
			const localIds = new Set(localPlans.map(plan => plan.id));
			
			// 添加云端独有的数据
			cloudPlans.forEach(cloudPlan => {
				if (!localIds.has(cloudPlan.id)) {
					merged.push(cloudPlan);
				}
			});
			
			// 按创建时间排序
			return merged.sort((a, b) => {
				const timeA = new Date(a.createdDate || 0).getTime();
				const timeB = new Date(b.createdDate || 0).getTime();
				return timeB - timeA;
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

.nav-actions {
	display: flex;
	align-items: center;
	min-width: 120rpx; /* 确保右侧有足够的占位空间 */
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

.preview-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.preview-title {
	font-size: 30rpx;
	font-weight: bold;
}

.close-preview {
	width: 50rpx;
	height: 50rpx;
	border-radius: 50%;
	background-color: #ff4757;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.9);
		background-color: #ff3838;
	}
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

.exercise-info {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.exercise-name {
	font-size: 26rpx;
	color: var(--text-color-light);
}

.exercise-details {
	display: flex;
	gap: 12rpx;
	margin-left: 20rpx;
}

.detail-item {
	font-size: 22rpx;
	color: var(--primary-color);
	background-color: rgba(59, 130, 246, 0.1);
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
}

// 组数控制器样式
.sets-selector {
	display: flex;
	align-items: center;
	gap: 15rpx;
	justify-content: center;
}

.sets-btn {
	width: 60rpx;
	height: 60rpx;
	border: 2rpx solid var(--primary-color);
	background-color: #fff;
	color: var(--primary-color);
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: bold;
}

.sets-btn:disabled {
	opacity: 0.3;
	border-color: #ccc;
	color: #ccc;
}

.sets-btn.decrease,
.sets-btn.increase {
	&:active:not(:disabled) {
		background-color: var(--primary-color);
		color: #fff;
	}
}

.sets-input {
	width: 120rpx;
	height: 60rpx;
	text-align: center;
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	font-size: 28rpx;
}

.sets-unit {
	font-size: 28rpx;
	color: var(--text-color);
}

// 只读输入框样式
.form-input[readonly] {
	background-color: #f8f9fa;
	color: var(--text-color-light);
	cursor: not-allowed;
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

.plan-actions-vertical {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 10rpx;
}

.delete-action {
	font-size: 24rpx;
	color: #ff4757;
	text-decoration: underline;
	
	&:active {
		color: #ff3838;
		opacity: 0.7;
	}
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
	
	.content-container {
		width: 90%;
		padding: 20rpx;
	}
}

/* 弹窗样式 */
.modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
}

/* 确保uni.showModal显示在最上层 */
uni-modal, .uni-modal, uni-dialog, .uni-dialog {
	z-index: 999999 !important;
}

/* 更细致的弹窗层级控制 */
page {
	--modal-z-index: 10000;
}

/* 针对uni-app的各种原生弹窗组件 */
.uni-modal__bd, .uni-modal__ft, .uni-modal__hd {
	z-index: 999999 !important;
}

/* 适配不同平台的弹窗选择器 */
.uni-mask {
	z-index: 999998 !important;
}

/* H5平台的弹窗 */
#uni-modal, [class*="uni-modal"] {
	z-index: 999999 !important;
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
	border-bottom: 2rpx solid var(--border-color);
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

.modal-close {
	font-size: 40rpx;
	color: var(--text-color-light);
	cursor: pointer;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 美化的关闭按钮 */
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
	
	&:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 6rpx 16rpx rgba(238, 90, 82, 0.4);
	}
	
	&:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(238, 90, 82, 0.3);
	}
}

/* 只读输入框的增强样式 */
.readonly-input {
	background-color: #f8f9fa !important;
	color: #6c757d !important;
	cursor: not-allowed !important;
	border-color: #e9ecef !important;
	user-select: none;
	pointer-events: none;
	
	&::placeholder {
		color: #adb5bd !important;
	}
}

.modal-body {
	padding: 30rpx;
	overflow-y: auto;
	flex: 1;
	background-color: #fff;
}

.modal-footer {
	padding: 20rpx 30rpx;
	border-top: 2rpx solid var(--border-color);
	display: flex;
	justify-content: flex-end;
	flex-shrink: 0;
	background-color: #fff;
}

.modal-footer .btn {
	margin-left: 20rpx;
}

.btn-secondary {
	background-color: #e0e0e0;
	color: var(--text-color);
}

.textarea {
	width: 100%;
	height: 200rpx;
	padding: 20rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	box-sizing: border-box;
}

.new-plan-preview {
	margin-top: 20rpx;
	padding: 20rpx;
	background-color: #f8fafc;
	border-radius: 8rpx;
	border: 2rpx solid var(--border-color);
	max-height: 300rpx;
	overflow-y: auto;
}

/* 弹窗内的表单样式 */
.modal-body .form-item {
	margin-bottom: 24rpx;
}

.modal-body .form-label {
	font-size: 28rpx;
	color: var(--text-color);
	font-weight: 500;
	margin-bottom: 10rpx;
	display: block;
}

.modal-body .input {
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	padding: 0 20rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	background-color: #fff;
	box-sizing: border-box;
}

.custom-select {
	width: 100%;
	height: 80rpx;
	padding: 0 20rpx;
	border: 2rpx solid var(--border-color);
	border-radius: 8rpx;
	background-color: #fff;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	transition: all 0.3s ease;
}

.custom-select:active {
	background-color: #f5f5f5;
	border-color: var(--primary-color);
}

.custom-select text:first-child {
	flex: 1;
	line-height: 76rpx;
}

.picker-arrow {
	color: var(--text-color-light);
	font-size: 20rpx;
	margin-left: 10rpx;
	transition: transform 0.3s ease;
}

.select-options {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background-color: #fff;
	border: 2rpx solid var(--border-color);
	border-top: none;
	border-radius: 0 0 8rpx 8rpx;
	box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
	z-index: 1000;
	max-height: 300rpx;
	overflow-y: auto;
}

.select-option {
	padding: 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
	transition: background-color 0.3s ease;
	
	&:last-child {
		border-bottom: none;
	}
	
	&:active,
	&.active {
		background-color: var(--primary-color);
		color: #fff;
	}
	
	&:hover {
		background-color: #f8f9fa;
	}
}

/* 确保表单项有相对定位以支持绝对定位的选择器 */
.modal-body .form-item {
	position: relative;
	margin-bottom: 24rpx;
}

.modal-body .btn-sm {
	margin-top: 15rpx;
}

/* 自定义计划样式 */
.create-plan-modal {
	width: 90%;
	max-width: 900rpx;
	height: 80vh;
	min-height: 600rpx;
	overflow-y: auto;
}

.week-control {
	margin-top: 20rpx;
}

.week-selector {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 15rpx;
	background: #f8f9fa;
	padding: 15rpx;
	border-radius: 16rpx;
	border: 2rpx solid #e9ecef;
}

.week-btn {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	border: none;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.week-btn.decrease {
	background: linear-gradient(135deg, #ff6b6b, #ee5a52);
	color: white;
}

.week-btn.increase {
	background: linear-gradient(135deg, #51cf66, #40c057);
	color: white;
}

.week-btn:hover {
	transform: scale(1.05);
	box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.15);
}

.week-btn:disabled {
	background: #e9ecef !important;
	color: #adb5bd !important;
	transform: none !important;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05) !important;
	cursor: not-allowed;
}

.btn-icon {
	font-size: 28rpx;
	font-weight: bold;
}

.week-input {
	width: 120rpx;
	height: 72rpx;
	text-align: center;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	background: white;
	border: 2rpx solid #dee2e6;
	border-radius: 12rpx;
	box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s;
}

.week-input:focus {
	border-color: var(--primary-color);
	box-shadow: 0 0 0 4rpx rgba(59, 130, 246, 0.1);
	outline: none;
}

.week-unit {
	font-size: 28rpx;
	font-weight: 500;
	color: #666;
	min-width: 40rpx;
}

/* 移动端优化 */
@media screen and (max-width: 768px) {
	.week-selector {
		gap: 10rpx;
		padding: 12rpx;
	}
	
	.week-btn {
		width: 64rpx;
		height: 64rpx;
		font-size: 28rpx;
	}
	
	.btn-icon {
		font-size: 24rpx;
	}
	
	.week-input {
		width: 100rpx;
		height: 64rpx;
		font-size: 28rpx;
	}
	
	.week-unit {
		font-size: 24rpx;
	}
}

.week-selection-container {
	min-height: 120rpx;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
}

.week-tabs {
	display: flex;
	gap: 16rpx;
	flex-wrap: wrap;
}

.week-tab {
	padding: 16rpx 24rpx;
	background: #f8f9fa;
	border-radius: 20rpx;
	font-size: 28rpx;
	color: #666;
	border: 2rpx solid transparent;
	transition: all 0.3s;
}

.week-tab.active {
	background: var(--primary-color);
	color: white;
	border-color: var(--primary-color);
}

.week-schedule {
	margin: 40rpx 0;
}

.schedule-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 30rpx;
	display: block;
}

.days-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.day-card {
	background: white;
	border-radius: 12rpx;
	padding: 24rpx;
	border: 2rpx solid #e9ecef;
	transition: all 0.3s;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.day-card:hover {
	border-color: var(--primary-color);
	transform: translateY(-4rpx);
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.day-card.has-plan {
	border-color: var(--primary-color);
}

.day-card.rest-day {
	border-color: #28a745;
}

.day-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 12rpx;
}

.day-status {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 12rpx;
}

.day-status.empty {
	color: #999;
}

.day-preview {
	margin-top: 12rpx;
	padding-top: 12rpx;
	border-top: 1rpx solid #f0f0f0;
}

.exercise-preview {
	font-size: 22rpx;
	color: #666;
	margin-bottom: 6rpx;
}

.more-exercises {
	font-size: 20rpx;
	color: #999;
}

/* 同步状态样式 */
.sync-status {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 16rpx;
	background-color: rgba(255, 255, 255, 0.1);
	border-radius: 20rpx;
	transition: all 0.3s ease;
	cursor: pointer;
}

.sync-status:hover {
	background-color: rgba(255, 255, 255, 0.2);
	transform: translateY(-2rpx);
}

.sync-icon {
	font-size: 24rpx;
	transition: all 0.3s ease;
}

.sync-icon.sync-connected {
	color: #2ecc71;
}

.sync-icon.sync-disconnected {
	color: #95a5a6;
}

.sync-icon.sync-syncing {
	color: #f39c12;
	animation: spin 1s linear infinite;
}

.sync-icon.sync-error {
	color: #e74c3c;
}

.sync-text {
	font-size: 24rpx;
	color: #333;
	font-weight: 500;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

/* 表单样式 */
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
	border-color: var(--primary-color);
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
	border-color: var(--primary-color);
	box-shadow: 0 0 0 6rpx rgba(59, 130, 246, 0.1);
	outline: none;
	background-color: #fcfcfd;
}

.form-textarea::placeholder {
	color: #9ca3af;
	font-size: 26rpx;
}

/* 动作选择样式 */
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

/* 训练动作卡片样式 */
.exercise-list {
	margin-top: 20rpx;
}

.exercise-item {
	margin-bottom: 20rpx;
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

/* 其他样式改进 */
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
	border-color: var(--primary-color);
	box-shadow: 0 0 0 4rpx rgba(59, 130, 246, 0.1);
	outline: none;
	background-color: white;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #374151;
}

.empty-state {
	text-align: center;
	padding: 40rpx 20rpx;
	color: #9ca3af;
	font-size: 26rpx;
	background: #f9fafb;
	border-radius: 12rpx;
	border: 2rpx dashed #d1d5db;
}

/* 响应式优化 */
@media screen and (max-width: 768px) {
	.form-input, .form-textarea {
		font-size: 30rpx;
		padding: 0 20rpx;
	}
	
	.form-textarea {
		padding: 18rpx 20rpx;
		min-height: 140rpx;
	}
	
	.exercise-option {
		font-size: 28rpx;
		padding: 14rpx 18rpx;
		min-height: 64rpx;
	}
	
	.category-name {
		font-size: 30rpx;
	}
	
	.exercise-card {
		padding: 20rpx;
	}
	
	.exercise-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 12rpx;
	}
	
	.exercise-name-tag {
		max-width: 100%;
		font-size: 28rpx;
	}
	
	.exercise-actions {
		align-self: flex-end;
	}
	
	.detail-tag {
		font-size: 24rpx;
		padding: 8rpx 14rpx;
	}
}
</style>