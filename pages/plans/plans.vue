<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item" @tap="handleNavigation('index')">首页</view>
				<view class="nav-item" @tap="handleNavigation('history')">记录</view>
				<view class="nav-item" @tap="handleNavigation('progress')">进度追踪</view>
				<view class="nav-item active">健身计划</view>
				<view class="nav-item" @tap="handleNavigation('workouts')">训练数据库</view>
			</view>
			<view class="nav-actions">
				<!-- 同步状态指示器 -->
				<view class="sync-status" @tap="handleSync" v-if="showSyncStatus">
					<text class="sync-icon" :class="syncStatus.icon">●</text>
					<text class="sync-text">{{ syncStatus.text }}</text>
				</view>
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
								<view class="picker-value">{{ planTypes[planTypeIndex] }}</view>
							</picker>
						</view>

						<view class="form-item">
							<text class="form-label">训练目标</text>
							<picker :value="goalIndex" :range="goals" @change="onGoalChange">
								<view class="picker-value">{{ goals[goalIndex] }}</view>
							</picker>
						</view>

						<view class="form-item">
							<text class="form-label">每周训练天数</text>
							<picker :value="daysIndex" :range="trainingDays" @change="onDaysChange">
								<view class="picker-value">{{ trainingDays[daysIndex] }}</view>
							</picker>
						</view>

						<view class="form-item">
							<text class="form-label">训练水平</text>
							<picker :value="levelIndex" :range="levels" @change="onLevelChange">
								<view class="picker-value">{{ levels[levelIndex] }}</view>
							</picker>
						</view>

						<view class="form-item" v-if="planTypeIndex === 1">
							<text class="form-label">计划周数</text>
							<picker :value="weeksIndex" :range="planWeeks" @change="onWeeksChange">
								<view class="picker-value">{{ planWeeks[weeksIndex] }}</view>
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
								<text class="day-title">{{ day.day }}: {{ day.focus }}</text>

								<view class="exercise-list-interactive">
									<view class="exercise-item-interactive" v-for="(exercise, idx) in day.exercises"
										:key="idx" @tap="editExerciseInPreview(index, idx, exercise)">
										<view class="exercise-info">
											<text class="exercise-name">• {{ getExerciseDisplayName(exercise) }}</text>
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
								<text class="plan-title">{{ plan.title }}</text>
								<view class="badge" :class="'badge-' + plan.statusClass">{{ plan.status }}</view>
							</view>
							<text class="plan-desc">{{ plan.description }}</text>
							<view class="flex-row justify-between align-center">
								<text class="plan-progress">{{ plan.progress }}</text>
								<view class="plan-actions-vertical">
									<text class="text-primary plan-action" @tap.stop="handlePlanCardAction(plan)">{{
										plan.actionText }}</text>
									<text class="delete-action" @tap.stop="deletePlan(plan, index)">删除计划</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 计划详情弹窗 -->
		<view class="modal" v-if="showPlanDetailModal" @tap.self="closePlanDetailModal">
			<view class="modal-content plan-detail-modal">
				<view class="modal-header">
					<text class="modal-title">计划详情</text>
					<view class="close-btn" @tap="closePlanDetailModal">×</view>
				</view>

				<view class="modal-body plan-detail-body">
					<view class="detail-section">
						<text class="detail-title">基本信息</text>
						<view class="detail-item">
							<text class="detail-label">计划名称：</text>
							<text class="detail-value">{{ currentPlanDetail.title }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">计划目标：</text>
							<text class="detail-value">{{ currentPlanDetail.goal || '未设置' }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">训练水平：</text>
							<text class="detail-value">{{ currentPlanDetail.level || '未设置' }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">训练周期：</text>
							<text class="detail-value">{{ currentPlanDetail.duration || '未设置' }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">训练频率：</text>
							<text class="detail-value">{{ currentPlanDetail.trainingDays || '未设置' }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">当前状态：</text>
							<text class="detail-value" :class="'status-' + currentPlanDetail.statusClass">{{
								currentPlanDetail.status }}</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">进度：</text>
							<text class="detail-value">{{ currentPlanDetail.progress }}</text>
						</view>
					</view>

					<!-- 系统生成的计划显示 -->
					<view class="detail-section"
						v-if="currentPlanDetail.exercises && currentPlanDetail.exercises.length > 0">
						<text class="detail-title">训练安排</text>
						<view class="training-schedule">
							<view class="day-schedule" v-for="(day, index) in currentPlanDetail.exercises" :key="index">
								<view class="day-header">
									<text class="day-name">{{ day.day }}</text>
									<text class="day-focus">{{ day.focus }}</text>
								</view>
								<view class="exercise-list">
									<view class="exercise-item" v-for="(exercise, exIndex) in day.exercises"
										:key="exIndex">
										<text class="exercise-text">• {{ getExerciseDisplayName(exercise) }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 自定义计划显示 -->
					<view class="detail-section" v-if="currentPlanDetail.customPlan && currentPlanDetail.weekPlans">
						<view class="detail-header">
							<text class="detail-title">训练安排</text>
							<!-- 周切换按钮 -->
							<view class="week-switcher" v-if="Object.keys(currentPlanDetail.weekPlans).length > 1">
								<view class="week-tabs">
									<view class="week-tab"
										v-for="weekNum in Object.keys(currentPlanDetail.weekPlans).sort((a, b) => parseInt(a) - parseInt(b))"
										:key="weekNum" :class="{ 'active': currentViewWeek === parseInt(weekNum) }"
										@tap="switchViewWeek(parseInt(weekNum))">
										第{{ weekNum }}周
									</view>
								</view>
							</view>
						</view>
						<view class="training-schedule">
							<view class="week-section">
								<text class="week-title">第{{ currentViewWeek }}周</text>
								<view class="day-schedule" v-for="(dayTraining, dayName) in getCurrentWeekPlan()"
									:key="dayName">
									<view class="day-header">
										<text class="day-name">{{ dayName }}</text>
										<text class="day-focus" v-if="dayTraining.restDay">休息日</text>
										<text class="day-focus"
											v-else-if="dayTraining.exercises && dayTraining.exercises.length > 0">{{
												dayTraining.exercises.length }}个动作</text>
									</view>
									<view class="exercise-list"
										v-if="!dayTraining.restDay && dayTraining.exercises && dayTraining.exercises.length > 0">
										<view class="exercise-item" v-for="(exercise, exIndex) in dayTraining.exercises"
											:key="exIndex">
											<text class="exercise-text">• {{ getExerciseDisplayName(exercise) }}</text>
										</view>
									</view>
									<view class="rest-day-note" v-if="dayTraining.restDay">
										<text class="rest-text">今日休息</text>
									</view>
									<view class="day-notes" v-if="dayTraining.notes">
										<text class="notes-text">备注：{{ dayTraining.notes }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="modal-footer">
					<button class="btn btn-outline" @tap="closePlanDetailModal">关闭</button>
					<button class="btn btn-primary" @tap="handlePlanAction" v-if="currentPlanDetail.status">
						{{ currentPlanDetail.status === '未开始' ? '开始计划' : '查看进度' }}
					</button>
				</view>
			</view>
		</view>

		<!-- 动作编辑弹窗 -->
		<view class="modal" v-if="showExerciseEditModal" @tap.self="closeExerciseEditModal">
			<view class="modal-content exercise-edit-modal">
				<view class="modal-header">
					<text class="modal-title">{{ isAddingExercise ? '添加动作' : '编辑动作' }}</text>
					<view class="close-btn" @tap="closeExerciseEditModal">×</view>
				</view>

				<view class="modal-body">
					<view class="form-group">
						<text class="form-label">动作名称</text>
						<input v-model="editingExercise.name" placeholder="请输入动作名称" class="form-input" />
					</view>

					<!-- 组数设置 -->
					<view class="form-group">
						<text class="form-label">组数</text>
						<view class="sets-selector">
							<button class="sets-btn decrease" @tap="decreaseEditSets"
								:disabled="editingExercise.sets <= 1">
								<text class="btn-icon">−</text>
							</button>
							<input type="number" class="sets-input" v-model="editingExercise.sets"
								@input="validateEditSetsInput" @blur="validateEditSetsInput" placeholder="组数" min="1"
								max="99" />
							<text class="sets-unit">组</text>
							<button class="sets-btn increase" @tap="increaseEditSets"
								:disabled="editingExercise.sets >= 99">
								<text class="btn-icon">+</text>
							</button>
						</view>
					</view>

					<!-- 次数设置 -->
					<view class="form-group">
						<text class="form-label">次数</text>
						<view class="sets-selector">
							<button class="sets-btn decrease" @tap="decreaseEditReps"
								:disabled="editingExercise.reps <= 1">
								<text class="btn-icon">−</text>
							</button>
							<input type="number" class="sets-input" v-model="editingExercise.reps"
								@input="validateEditRepsInput" @blur="validateEditRepsInput" placeholder="次数" min="1"
								max="99" />
							<text class="sets-unit">次</text>
							<button class="sets-btn increase" @tap="increaseEditReps"
								:disabled="editingExercise.reps >= 99">
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
						{{ isAddingExercise ? '添加' : '保存' }}
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
								<button class="week-btn decrease" @tap="changeWeeks(-1)"
									:disabled="customPlan.weeks <= 1">
									<text class="btn-icon">−</text>
								</button>
								<input type="number" class="week-input" v-model="weeksInputValue"
									@input="handleWeeksInput" @blur="validateWeeksInput" placeholder="周数" min="1"
									max="99" />
								<text class="week-unit">周</text>
								<button class="week-btn increase" @tap="changeWeeks(1)"
									:disabled="customPlan.weeks >= 99">
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
								<view class="week-tab" v-for="week in customPlan.weeks" :key="week"
									:class="{ 'active': customPlan.currentWeek === week }" @tap="switchWeek(week)">
									第{{ week }}周
								</view>
							</view>
						</view>
					</view>

					<!-- 一周七天的训练安排 -->
					<view class="form-group">
						<text class="form-label">训练安排 (第{{ customPlan.currentWeek }}周)</text>
						<view class="days-grid">
							<view class="day-card" v-for="(day, index) in weekDays" :key="index"
								@tap="editDay(day, customPlan.currentWeek)"
								:class="{ 'has-plan': getDayPlan(customPlan.currentWeek, day), 'rest-day': getDayPlan(customPlan.currentWeek, day) && getDayPlan(customPlan.currentWeek, day).restDay }">

								<text class="day-name">{{ day }}</text>
								<view class="day-status" v-if="getDayPlan(customPlan.currentWeek, day)">
									<text class="status-text">
										{{ getDayPlan(customPlan.currentWeek, day).restDay ? '休息' :
											getDayPlan(customPlan.currentWeek, day).exercises.length + '个动作' }}
									</text>
								</view>
								<view class="day-status empty" v-else>
									<text class="status-text">未设置</text>
								</view>

								<!-- 不显示具体动作名称，只在状态中显示动作数量 -->
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
					<text class="modal-title">{{ currentEditDay }} - 第{{ currentEditWeek }}周</text>
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
								<view class="exercise-item" v-for="(exercise, index) in dayTraining.exercises"
									:key="index">
									<view class="exercise-card">
										<view class="exercise-header">
											<text class="exercise-name">{{ exercise.name }}</text>
											<view class="exercise-actions">
												<button class="action-btn edit-btn"
													@tap="editExercise(index)">编辑</button>
												<button class="action-btn delete-btn"
													@tap="removeExercise(index)">删除</button>
											</view>
										</view>
										<view class="exercise-info">
											<text class="info-text">{{ exercise.sets }}组 × {{ exercise.reps }}次</text>
											<text class="info-text" v-if="exercise.weight">{{ exercise.weight
											}}kg</text>
											<text class="info-text" v-if="exercise.rest">休息{{ exercise.rest }}s</text>
										</view>
										<view class="exercise-notes" v-if="exercise.notes">
											<text class="notes-text">{{ exercise.notes }}</text>
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
							<textarea v-model="dayTraining.notes" placeholder="添加训练备注..."
								class="notes-input"></textarea>
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
					<text class="modal-title">{{ selectedExercise !== null ? '编辑动作' : '添加动作' }}</text>
					<view class="close-btn" @tap="closeExerciseSelector">×</view>
				</view>

				<view class="modal-body">
					<!-- 动作选择 -->
					<view class="form-group">
						<text class="form-label">动作名称</text>
						<input v-model="exerciseDetails.name" placeholder="请输入任意动作名称（可自定义）" class="form-input" />
						<text class="form-hint">💡 您可以输入任何动作名称，不限于下方的选项</text>
					</view>

					<view class="form-group">
						<text class="form-label">快速选择常用动作（可选）</text>
						<view class="exercise-categories">
							<view class="category" v-for="(exercises, category) in exerciseLibrary" :key="category">
								<text class="category-name">{{ category }}</text>
								<view class="exercise-options">
									<view class="exercise-option" v-for="exercise in exercises" :key="exercise"
										:class="{ 'selected': exerciseDetails.name === exercise }"
										@tap="selectExerciseName(exercise)">
										{{ exercise }}
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 动作详情设置 -->
					<view v-if="exerciseDetails && exerciseDetails.name">
						<view class="form-group">
							<text class="form-label">组数</text>
							<input :value="exerciseDetails.sets" @input="handleSetsInput" class="form-input"
								placeholder="3" type="number" />
						</view>

						<view class="form-group">
							<text class="form-label">次数/时间 (次/秒)</text>
							<input :value="exerciseDetails.reps" @input="handleRepsInput" placeholder="12"
								class="form-input" type="number" />
						</view>

						<view class="form-group">
							<text class="form-label">重量 (kg)</text>
							<input :value="exerciseDetails.weight" @input="handleWeightInput" placeholder="可选"
								class="form-input" type="number" />
						</view>

						<view class="form-group">
							<text class="form-label">组间休息 (s)</text>
							<input :value="exerciseDetails.rest" @input="handleRestInput" placeholder="90"
								class="form-input" type="number" />
						</view>

						<view class="form-group">
							<text class="form-label">备注</text>
							<textarea v-model="exerciseDetails.notes" placeholder="动作要点或注意事项"
								class="form-textarea"></textarea>
						</view>
					</view>
				</view>

				<view class="modal-footer">
					<button class="btn btn-outline" @tap="closeExerciseSelector">取消</button>
					<button class="btn btn-primary" @tap="saveExercise" :disabled="!exerciseDetails.name">
						{{ selectedExercise !== null ? '更新' : '添加' }}
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import localDataService from '@/utils/localDataService.js';
import planManager from '@/utils/planManager.js';
import {
	WORKOUT_GOALS,
	TRAINING_LEVELS,
	TRAINING_DAYS,
	EXERCISE_LIBRARY,
	getWorkoutPlan,
	formatExerciseDisplay
} from '@/utils/workoutPlans.js';
import {
	showLoading,
	hideLoading,
	showSuccess,
	showError,
	showConfirm,
	debounce,
	validateRange,
	formatNumberInput,
	navigateTo as navTo,
	handleError,
	withLoading
} from '@/utils/uiHelpers.js';

export default {
	data() {
		return {
			// 基础配置
			loading: false,

			// 训练目标相关
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

			// 计划预览相关
			showPreview: false,
			previewPlan: [],

			// 动作编辑相关
			showExerciseEditModal: false,
			editingExercise: {
				name: '',
				sets: 1,
				reps: 1,
				rest: 90
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
				weekPlans: {}
			},
			weeksInputValue: 1,

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
			// 云同步状态
			syncStatus: {
				icon: 'sync-connected',
				text: '已连接',
				syncing: false
			},
			showSyncStatus: true,

			// 动作库引用
			exerciseLibrary: EXERCISE_LIBRARY,

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
			],

			// 计划详情弹窗相关
			showPlanDetailModal: false,
			currentPlanDetail: {},
			currentViewWeek: 1 // 当前查看的周数
		}
	},
	onShow() {
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
		onGoalChange(e) {
			this.goalIndex = parseInt(e.detail.value);
			this.previewPlan = []; // 清空预览
			this.showPreview = false;
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

			// 使用用户输入的动作名称（允许自定义动作名称）
			let finalName = this.editingExercise.name.trim();

			// 保存自定义动作到全局动作库
			this.saveCustomExercise(finalName);

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
					name: exerciseStr.name || exerciseStr.toString(),
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

		// 保存自定义动作到全局动作库
		saveCustomExercise(exerciseName) {
			if (!exerciseName || !exerciseName.trim()) {
				return;
			}

			const name = exerciseName.trim();

			// 检查是否已经在预设动作库中
			const isPresetExercise = Object.values(this.exerciseLibrary).some(exercises =>
				exercises.includes(name)
			);

			if (isPresetExercise) {
				return; // 如果是预设动作，不需要保存到自定义动作库
			}

			// 获取用户存储键
			const userInfo = uni.getStorageSync('userInfo');
			const customExercisesKey = userInfo && userInfo.id ? `customExercises_${userInfo.id}` : 'customExercises';

			// 获取现有的自定义动作
			let customExercises = uni.getStorageSync(customExercisesKey) || [];

			// 检查是否已存在
			if (!customExercises.includes(name)) {
				customExercises.push(name);
				uni.setStorageSync(customExercisesKey, customExercises);
				console.log('保存自定义动作:', name);
			}
		},

		// 保存动作
		saveExercise() {
			if (!this.exerciseDetails.name || !this.exerciseDetails.name.trim()) {
				uni.showToast({
					title: '请输入动作名称',
					icon: 'none'
				});
				return;
			}

			// 保存自定义动作到全局动作库
			this.saveCustomExercise(this.exerciseDetails.name.trim());

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

				// 尝试同步到服务器
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo && userInfo.userId && localDataService.isLoggedIn) {
					try {
						await localDataService.syncPlans();
						console.log('计划已同步至服务器');
					} catch (error) {
						console.error('服务器同步失败:', error);
						// 服务器同步失败不影响本地保存
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
				progress: `0周/共${this.customPlan.weeks}周`,
				actionText: '开始计划',
				createdDate: new Date().toISOString().split('T')[0],
				exercises: this.newPlan.customSchedule // 保存详细的训练计划
			};

			// 保存到本地存储
			const myPlansKey = this.getUserStorageKey('myPlans');
			const savedPlans = uni.getStorageSync(myPlansKey) || [];
			savedPlans.unshift(newPlanObj);
			uni.setStorageSync(myPlansKey, savedPlans);

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
			console.log('生成计划参数：', {
				goal: this.goals[this.goalIndex],
				days: this.trainingDays[this.daysIndex],
				level: this.levels[this.levelIndex],
				planType: this.planTypes[this.planTypeIndex]
			});

			uni.showLoading({
				title: '生成中...'
			});

			setTimeout(() => {
				uni.hideLoading();

				// 根据训练天数、训练水平生成计划
				this.previewPlan = this.createPlanByParameters();
				this.showPreview = true;

				console.log('生成的计划：', this.previewPlan);
			}, 1500);
		},

		createPlanByParameters() {
			const goal = this.goalIndex; // 从选择器获取目标
			const days = this.daysIndex; // 0:3天, 1:4天, 2:5天, 3:6天
			const level = this.levelIndex; // 0:初级, 1:中级, 2:高级
			const planType = this.planTypeIndex; // 0:一周计划, 1:长期计划

			console.log('创建计划参数检查：', { goal, days, level, planType });

			// 根据训练天数确定训练日程
			const schedules = [
				['周一', '周三', '周五'], // 3天
				['周一', '周二', '周四', '周五'], // 4天
				['周一', '周二', '周三', '周五', '周六'], // 5天
				['周一', '周二', '周三', '周四', '周五', '周六'] // 6天
			];

			const currentSchedule = schedules[days];

			// 所有类型的计划都基于周计划模板生成
			const plan = this.generateWeeklyPlan(currentSchedule, goal, level);

			return plan;
		},

		// 生成一周计划
		generateWeeklyPlan(schedule, goal, level) {
			// 使用新的工具函数获取训练计划
			const goalIndex = goal;
			const levelName = this.levels[level] || '初级';
			const trainingDays = schedule.length;

			const planData = getWorkoutPlan(goalIndex, levelName, trainingDays);

			if (planData && planData.length > 0) {
				return planData;
			}

			// 如果没有找到对应计划，返回基础计划
			return this.generateBasicPlan(schedule, goal, level);
		},

		// 生成基础计划（备用方案）
		generateBasicPlan(schedule, goal, level) {
			const basicExercises = {
				0: [ // 增肌
					{ name: '俯卧撑', sets: 3, reps: 10, rest: 90 },
					{ name: '深蹲', sets: 3, reps: 15, rest: 90 },
					{ name: '平板支撑', sets: 3, reps: 30, rest: 90 }
				],
				1: [ // 减脂
					{ name: '开合跳', sets: 3, reps: 30, rest: 30 },
					{ name: '高抬腿', sets: 3, reps: 30, rest: 30 },
					{ name: '深蹲', sets: 3, reps: 20, rest: 45 }
				],
				2: [ // 力量
					{ name: '俯卧撑', sets: 5, reps: 8, rest: 120 },
					{ name: '深蹲', sets: 5, reps: 8, rest: 120 },
					{ name: '平板支撑', sets: 3, reps: 45, rest: 90 }
				],
				3: [ // 耐力
					{ name: '快走', sets: 1, reps: 1800, rest: 0 },
					{ name: '深蹲', sets: 3, reps: 15, rest: 45 },
					{ name: '拉伸', sets: 1, reps: 600, rest: 0 }
				]
			};

			const exercises = basicExercises[goal] || basicExercises[0];

			return schedule.map((day, index) => ({
				day,
				focus: `训练${index + 1}`,
				exercises: exercises
			}));
		},

		// 获取详细的训练计划数据
		getDetailedPlanData() {
			return {
				// 增肌一周计划
				0: {
					"初级": {
						"3": [
							{ day: '周一', focus: '全身基础', exercises: ['俯卧撑 3组 x 8-12次', '深蹲 3组 x 12-15次', '平板支撑 3组 x 30-45秒'] },
							{ day: '周三', focus: '上肢训练', exercises: ['墙面俯卧撑 3组 x 10-15次', '哑铃弯举 3组 x 10-12次', '三头肌撑体 3组 x 8-10次'] },
							{ day: '周五', focus: '下肢训练', exercises: ['徒手深蹲 3组 x 15-20次', '弓步蹲 3组 x 10-12次', '小腿提踵 3组 x 15-20次'] }
						],
						"4": [
							{ day: '周一', focus: '胸肩', exercises: ['俯卧撑 3组 x 10次', '肩部绕环 3组 x 15次', '平板支撑 3组 x 30秒'] },
							{ day: '周二', focus: '背部', exercises: ['反向飞鸟 3组 x 12次', '超人式 3组 x 10次', '猫式伸展 3组 x 15次'] },
							{ day: '周四', focus: '腿部', exercises: ['深蹲 3组 x 15次', '弓步蹲 3组 x 10次', '单腿提踵 3组 x 12次'] },
							{ day: '周六', focus: '核心', exercises: ['卷腹 3组 x 15次', '平板支撑 3组 x 30秒', '俄罗斯转体 3组 x 20次'] }
						],
						"5": [
							{ day: '周一', focus: '胸部', exercises: ['杠铃卧推 4组 x 8-10次', '上斜卧推 4组 x 10-12次', '哑铃飞鸟 3组 x 12-15次'] },
							{ day: '周二', focus: '背部', exercises: ['引体向上 4组 x 8-10次', '杠铃划船 4组 x 8-10次', '坐姿划船 3组 x 10-12次', '高位下拉 3组 x 12次'] },
							{ day: '周三', focus: '腿部', exercises: ['杠铃深蹲 4组 x 8-10次', '罗马尼亚硬拉 4组 x 8-10次', '腿举 3组 x 12-15次', '保加利亚深蹲 3组 x 12次'] },
							{ day: '周五', focus: '肩部', exercises: ['哑铃肩推 4组 x 8-10次', '侧平举 4组 x 12-15次', '阿诺德推举 3组 x 15次', '前平举 3组 x 12次'] },
							{ day: '周六', focus: '手臂', exercises: ['哑铃弯举 4组 x 10-12次', '窄距卧推 4组 x 8-10次', '锤式弯举 3组 x 12次', '三头肌下压 3组 x 12次'] }
						],
						"6": [
							{ day: '周一', focus: '胸部', exercises: ['杠铃卧推 4组 x 8-10次', '上斜卧推 4组 x 10-12次', '哑铃飞鸟 3组 x 12-15次', '双杠臂屈伸 3组 x 8-12次'] },
							{ day: '周二', focus: '背部', exercises: ['引体向上 4组 x 8-10次', '杠铃划船 4组 x 8-10次', '坐姿划船 3组 x 10-12次', '高位下拉 3组 x 12次'] },
							{ day: '周三', focus: '腿部 (股四头肌)', exercises: ['杠铃深蹲 4组 x 8-10次', '腿举 4组 x 12-15次', '保加利亚深蹲 3组 x 10-12次', '前蹲 3组 x 12-15次'] },
							{ day: '周四', focus: '肩部', exercises: ['杠铃肩推 4组 x 8-10次', '侧平举 4组 x 12-15次', '阿诺德推举 3组 x 15次', '前平举 3组 x 12次'] },
							{ day: '周五', focus: '手臂', exercises: ['哑铃弯举 4组 x 10-12次', '窄距卧推 4组 x 8-10次', '锤式弯举 3组 x 12次', '三头肌下压 3组 x 12次'] },
							{ day: '周六', focus: '腿部 (后链)', exercises: ['罗马尼亚硬拉 4组 x 8-10次', '硬拉 4组 x 12-15次', '保加利亚深蹲 3组 x 15-20次', '哑铃深蹲 4组 x 15-20次'] }
						]
					},
					"中级": {
						"3": [
							{ day: '周一', focus: '推力主导', exercises: ['杠铃卧推 5组 x 6-8次', '杠铃肩推 4组 x 8次', '上斜卧推 4组 x 8-10次', '三头肌下压 4组 x 10次'] },
							{ day: '周三', focus: '拉力主导', exercises: ['硬拉 4组 x 6次', '引体向上 4组 x 8次', '杠铃划船 4组 x 8次', '杠铃弯举 4组 x 10次'] },
							{ day: '周五', focus: '下肢主导', exercises: ['杠铃深蹲 5组 x 6-8次', '前蹲 3组 x 8次', '罗马尼亚硬拉 4组 x 8次', '腿举 3组 x 12次'] }
						],
						"4": [
							{ day: '周一', focus: '胸肩三头', exercises: ['杠铃卧推 4组 x 8次', '上斜卧推 3组 x 10-12次', '杠铃肩推 4组 x 8-10次', '三头肌下压 3组 x 12-15次'] },
							{ day: '周二', focus: '背二头', exercises: ['引体向上 4组 x 8-10次', '杠铃划船 4组 x 8-10次', '哑铃划船 3组 x 10-12次', '杠铃弯举 4组 x 10-12次'] },
							{ day: '周四', focus: '腿部训练', exercises: ['杠铃深蹲 4组 x 8-10次', '罗马尼亚硬拉 4组 x 8-10次', '腿举 3组 x 12-15次', '哑铃深蹲 4组 x 15-20次'] },
							{ day: '周六', focus: '手臂专项', exercises: ['窄距卧推 4组 x 8-10次', '哑铃弯举 4组 x 10-12次', '锤式弯举 3组 x 12次', '臂屈伸 3组 x 12次'] }
						],
						"5": [
							{ day: '周一', focus: '胸部', exercises: ['杠铃卧推 4组 x 8-10次', '上斜卧推 4组 x 10-12次', '哑铃飞鸟 3组 x 12-15次'] },
							{ day: '周二', focus: '背部', exercises: ['引体向上 4组 x 8-10次', '杠铃划船 4组 x 8-10次', '坐姿划船 3组 x 10-12次', '高位下拉 3组 x 12次'] },
							{ day: '周三', focus: '腿部', exercises: ['杠铃深蹲 4组 x 8-10次', '罗马尼亚硬拉 4组 x 8-10次', '腿举 3组 x 12-15次', '保加利亚深蹲 3组 x 12次'] },
							{ day: '周五', focus: '肩部', exercises: ['哑铃肩推 4组 x 8-10次', '侧平举 4组 x 12-15次', '阿诺德推举 3组 x 15次', '前平举 3组 x 12次'] },
							{ day: '周六', focus: '手臂', exercises: ['哑铃弯举 4组 x 10-12次', '窄距卧推 4组 x 8-10次', '锤式弯举 3组 x 12次', '三头肌下压 3组 x 12次'] }
						],
						"6": [
							{ day: '周一', focus: '胸部', exercises: ['杠铃卧推 4组 x 8-10次', '上斜卧推 4组 x 10-12次', '哑铃飞鸟 3组 x 12-15次', '双杠臂屈伸 3组 x 8-12次'] },
							{ day: '周二', focus: '背部', exercises: ['引体向上 4组 x 8-10次', '杠铃划船 4组 x 8-10次', '坐姿划船 3组 x 10-12次', '高位下拉 3组 x 12次'] },
							{ day: '周三', focus: '腿部 (股四头肌)', exercises: ['杠铃深蹲 4组 x 8-10次', '腿举 4组 x 12-15次', '保加利亚深蹲 3组 x 10-12次', '前蹲 3组 x 12-15次'] },
							{ day: '周四', focus: '肩部', exercises: ['杠铃肩推 4组 x 8-10次', '侧平举 4组 x 12-15次', '阿诺德推举 3组 x 15次', '前平举 3组 x 12次'] },
							{ day: '周五', focus: '手臂', exercises: ['哑铃弯举 4组 x 10-12次', '窄距卧推 4组 x 8-10次', '锤式弯举 3组 x 12次', '三头肌下压 3组 x 12次'] },
							{ day: '周六', focus: '腿部 (后链)', exercises: ['罗马尼亚硬拉 4组 x 8-10次', '硬拉 4组 x 12-15次', '保加利亚深蹲 3组 x 15-20次', '哑铃深蹲 4组 x 15-20次'] }
						]
					}
				},
				// 减脂一周计划
				1: {
					"初级": {
						"3": [
							{ day: '周一', focus: 'HIIT入门', exercises: ['开合跳 30秒/休息30秒 x 8轮', '高抬腿 30秒/休息30秒 x 6轮', '深蹲 30秒/休息30秒 x 6轮'] },
							{ day: '周三', focus: '力量循环', exercises: ['徒手深蹲 15次', '俯卧撑 10次', '平板支撑 30秒', '登山者 20次', '重复3轮'] },
							{ day: '周五', focus: '有氧恢复', exercises: ['快走 20-30分钟', '拉伸 10分钟', '深呼吸练习 5分钟'] }
						],
						"4": [
							{ day: '周一', focus: 'HIIT训练', exercises: ['开合跳 45秒/休息15秒 x 8轮', '波比跳 30秒/休息30秒 x 6轮'] },
							{ day: '周二', focus: '力量训练', exercises: ['徒手深蹲 3组 x 15次', '俯卧撑 3组 x 10次', '平板支撑 3组 x 45秒'] },
							{ day: '周四', focus: '有氧训练', exercises: ['快走 25分钟', '登山者 3组 x 30秒', '拉伸 10分钟'] },
							{ day: '周五', focus: '核心训练', exercises: ['卷腹 3组 x 20次', '俄罗斯转体 3组 x 20次', '死虫式 3组 x 15次'] }
						],
						"5": [
							{ day: '周一', focus: 'HIIT训练', exercises: ['开合跳 45秒/休息15秒 x 8轮', '波比跳 30秒/休息30秒 x 6轮', '高抬腿 30秒/休息30秒 x 6轮'] },
							{ day: '周二', focus: '上肢力量', exercises: ['俯卧撑 3组 x 10次', '墙面俯卧撑 3组 x 15次', '三头肌撑体 3组 x 8次'] },
							{ day: '周三', focus: '有氧训练', exercises: ['快走 30分钟', '台阶踏步 10分钟', '拉伸 10分钟'] },
							{ day: '周五', focus: '下肢训练', exercises: ['徒手深蹲 3组 x 15次', '弓步蹲 3组 x 10次', '小腿提踵 3组 x 20次'] },
							{ day: '周六', focus: '核心训练', exercises: ['卷腹 3组 x 20次', '俄罗斯转体 3组 x 20次', '平板支撑 3组 x 45秒', '死虫式 3组 x 15次'] }
						],
						"6": [
							{ day: '周一', focus: 'HIIT训练', exercises: ['开合跳 45秒/休息15秒 x 8轮', '波比跳 30秒/休息30秒 x 6轮', '高抬腿 30秒/休息30秒 x 6轮'] },
							{ day: '周二', focus: '上肢力量', exercises: ['俯卧撑 3组 x 10次', '墙面俯卧撑 3组 x 15次', '三头肌撑体 3组 x 8次'] },
							{ day: '周三', focus: '有氧训练', exercises: ['快走 30分钟', '台阶踏步 10分钟', '拉伸 10分钟'] },
							{ day: '周四', focus: '轻度循环', exercises: ['轻度全身循环训练 20分钟', '柔韧性训练 15分钟', '深呼吸放松 5分钟'] },
							{ day: '周五', focus: '下肢训练', exercises: ['徒手深蹲 3组 x 15次', '弓步蹲 3组 x 10次', '小腿提踵 3组 x 20次'] },
							{ day: '周六', focus: '核心训练', exercises: ['卷腹 3组 x 20次', '俄罗斯转体 3组 x 20次', '平板支撑 3组 x 45秒', '死虫式 3组 x 15次'] }
						]
					},
					"中级": {
						"3": [
							{ day: '周一', focus: '高强度HIIT', exercises: ['波比跳 45秒/休息15秒 x 10轮', '高抬腿跑 45秒/休息15秒 x 8轮'] },
							{ day: '周三', focus: '力量代谢', exercises: ['深蹲跳 4组 x 12次', '俯卧撑 4组 x 15次', '登山者 4组 x 40秒'] },
							{ day: '周五', focus: '有氧间歇', exercises: ['跑步间歇 30分钟', '核心训练 15分钟', '拉伸 10分钟'] }
						],
						"4": [
							{ day: '周一', focus: '全身HIIT', exercises: ['波比跳 45秒/15秒休息 x 12轮', '深蹲跳 45秒/15秒休息 x 10轮'] },
							{ day: '周二', focus: '上肢力量', exercises: ['俯卧撑 4组 x 15次', '钻石俯卧撑 3组 x 8次', '倒立撑墙 3组 x 30秒'] },
							{ day: '周四', focus: '下肢爆发', exercises: ['深蹲跳 4组 x 15次', '单腿跳 3组 x 10次', '箭步蹲跳 3组 x 12次'] },
							{ day: '周六', focus: '有氧耐力', exercises: ['中等强度跑步 35分钟', '核心稳定 10分钟', '柔韧性训练 10分钟'] }
						],
						"5": [
							{ day: '周一', focus: '全身HIIT', exercises: ['波比跳 45秒/15秒休息 x 12轮', '深蹲跳 45秒/15秒休息 x 10轮', '登山者 45秒/15秒休息 x 8轮'] },
							{ day: '周二', focus: '上肢力量', exercises: ['俯卧撑 4组 x 15次', '钻石俯卧撑 3组 x 8次', '倒立撑墙 3组 x 30秒', '三头肌撑体 3组 x 10次'] },
							{ day: '周三', focus: '核心训练', exercises: ['平板支撑 4组 x 60秒', '俄罗斯转体 4组 x 25次', '卷腹 4组 x 20次', '死虫式 3组 x 15次'] },
							{ day: '周五', focus: '下肢爆发', exercises: ['深蹲跳 4组 x 15次', '单腿跳 3组 x 10次', '箭步蹲跳 3组 x 12次', '蛙跳 3组 x 8次'] },
							{ day: '周六', focus: '有氧耐力', exercises: ['中等强度跑步 40分钟', '核心稳定 15分钟', '柔韧性训练 15分钟'] }
						],
						"6": [
							{ day: '周一', focus: '全身HIIT', exercises: ['波比跳 45秒/15秒休息 x 12轮', '深蹲跳 45秒/15秒休息 x 10轮', '登山者 45秒/15秒休息 x 8轮'] },
							{ day: '周二', focus: '上肢力量', exercises: ['俯卧撑 4组 x 15次', '钻石俯卧撑 3组 x 8次', '倒立撑墙 3组 x 30秒', '三头肌撑体 3组 x 10次'] },
							{ day: '周三', focus: '核心训练', exercises: ['平板支撑 4组 x 60秒', '俄罗斯转体 4组 x 25次', '卷腹 4组 x 20次', '死虫式 3组 x 15次'] },
							{ day: '周四', focus: '竞技训练', exercises: ['竞技级间歇训练 40分钟', '爆发力专项训练 20分钟', '恢复拉伸 10分钟'] },
							{ day: '周五', focus: '下肢爆发', exercises: ['深蹲跳 4组 x 15次', '单腿跳 3组 x 10次', '箭步蹲跳 3组 x 12次', '蛙跳 3组 x 8次'] },
							{ day: '周六', focus: '有氧耐力', exercises: ['中等强度跑步 45分钟', '核心稳定 15分钟', '柔韧性训练 15分钟'] }
						]
					}
				},
				// 耐力训练一周计划
				3: {
					"初级": {
						"3": [
							{ day: '周一', focus: '有氧基础', exercises: ['快走 20-30分钟', '核心训练 10分钟', '拉伸 10分钟'] },
							{ day: '周三', focus: '力量耐力', exercises: ['深蹲 15次 x 3组', '俯卧撑 10次 x 3组', '平板支撑 30秒 x 3组', '组间休息45秒'] },
							{ day: '周五', focus: '混合训练', exercises: ['慢跑 15分钟', '功能性训练 15分钟', '柔韧性训练 10分钟'] }
						],
						"4": [
							{ day: '周一', focus: '有氧基础', exercises: ['快走/慢跑 25分钟', '动态拉伸 10分钟'] },
							{ day: '周二', focus: '力量耐力', exercises: ['循环训练：深蹲、俯卧撑、平板支撑各45秒', '休息15秒', '重复6轮'] },
							{ day: '周四', focus: '间歇训练', exercises: ['跑步间歇：快跑1分钟/慢跑2分钟 x 8轮', '拉伸 10分钟'] },
							{ day: '周六', focus: '综合训练', exercises: ['长时间有氧 30分钟', '核心稳定训练 15分钟', '柔韧性训练 15分钟'] }
						]
					},
					"中级": {
						"3": [
							{ day: '周一', focus: '有氧间歇', exercises: ['跑步间歇 30分钟', '核心训练 15分钟', '动态恢复 10分钟'] },
							{ day: '周三', focus: '肌肉耐力', exercises: ['循环训练 40分钟', '功能性动作模式', '稳定性训练'] },
							{ day: '周五', focus: '混合耐力', exercises: ['长距离有氧 40分钟', '力量耐力训练 20分钟', '恢复训练 10分钟'] }
						],
						"4": [
							{ day: '周一', focus: '心肺耐力', exercises: ['连续跑步 35分钟', '变速跑间歇 10分钟', '拉伸 10分钟'] },
							{ day: '周二', focus: '力量耐力', exercises: ['全身循环训练 45分钟', '高次数重量训练', '核心稳定 15分钟'] },
							{ day: '周四', focus: '运动耐力', exercises: ['间歇训练 30分钟', '爆发力训练 15分钟', '恢复训练 10分钟'] },
							{ day: '周六', focus: '综合耐力', exercises: ['长时间混合训练 50分钟', '柔韧性和恢复训练 20分钟'] }
						],
						"5": [
							{ day: '周一', focus: '心肺耐力', exercises: ['连续跑步 40分钟', '变速跑间歇 15分钟', '拉伸 10分钟'] },
							{ day: '周二', focus: '力量耐力', exercises: ['全身循环训练 50分钟', '高次数重量训练', '核心稳定 15分钟'] },
							{ day: '周三', focus: '混合耐力', exercises: ['游泳训练 30分钟', '自行车训练 20分钟', '恢复拉伸 10分钟'] },
							{ day: '周五', focus: '运动耐力', exercises: ['间歇训练 35分钟', '爆发力训练 15分钟', '恢复训练 10分钟'] },
							{ day: '周六', focus: '综合耐力', exercises: ['长时间混合训练 60分钟', '柔韧性和恢复训练 20分钟'] }
						],
						"6": [
							{ day: '周一', focus: '心肺耐力', exercises: ['连续跑步 45分钟', '变速跑间歇 15分钟', '拉伸 10分钟'] },
							{ day: '周二', focus: '力量耐力', exercises: ['全身循环训练 50分钟', '高次数重量训练', '核心稳定 15分钟'] },
							{ day: '周三', focus: '水中训练', exercises: ['游泳耐力训练 40分钟', '水中阻力训练 15分钟', '恢复游泳 10分钟'] },
							{ day: '周四', focus: '自行车耐力', exercises: ['长距离骑行 60分钟', '爬坡训练 15分钟', '腿部恢复 10分钟'] },
							{ day: '周五', focus: '运动耐力', exercises: ['间歇训练 35分钟', '爆发力训练 15分钟', '恢复训练 10分钟'] },
							{ day: '周六', focus: '综合耐力', exercises: ['长时间混合训练 70分钟', '柔韧性和恢复训练 25分钟'] }
						],
						"高级": {
							"3": [
								{ day: '周一', focus: '极限耐力', exercises: ['长距离跑步 60分钟', '核心耐力训练 20分钟', '恢复训练 15分钟'] },
								{ day: '周三', focus: '功能耐力', exercises: ['混合功能训练 60分钟', '高强度循环训练', '专项耐力训练'] },
								{ day: '周五', focus: '竞技耐力', exercises: ['竞技级耐力训练 70分钟', '专项技能训练 20分钟', '恢复训练 15分钟'] }
							],
							"4": [
								{ day: '周一', focus: '有氧极限', exercises: ['极限有氧训练 70分钟', '心率控制训练', '恢复拉伸 15分钟'] },
								{ day: '周二', focus: '力量耐力', exercises: ['高强度力量耐力 60分钟', '功能性训练', '核心稳定 20分钟'] },
								{ day: '周四', focus: '速度耐力', exercises: ['速度耐力训练 50分钟', '间歇冲刺训练', '恢复训练 15分钟'] },
								{ day: '周六', focus: '综合挑战', exercises: ['综合耐力挑战 80分钟', '多项目混合训练', '深度恢复 20分钟'] }
							],
							"5": [
								{ day: '周一', focus: '有氧极限', exercises: ['极限有氧训练 75分钟', '心率控制训练', '恢复拉伸 15分钟'] },
								{ day: '周二', focus: '力量耐力', exercises: ['高强度力量耐力 60分钟', '功能性训练', '核心稳定 20分钟'] },
								{ day: '周三', focus: '专项耐力', exercises: ['专项耐力训练 50分钟', '技能训练 20分钟', '柔韧性训练 15分钟'] },
								{ day: '周五', focus: '速度耐力', exercises: ['速度耐力训练 55分钟', '间歇冲刺训练', '恢复训练 15分钟'] },
								{ day: '周六', focus: '综合挑战', exercises: ['综合耐力挑战 90分钟', '多项目混合训练', '深度恢复 25分钟'] }
							],
							"6": [
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
		},

		// 开始计划方法
		startPlan(plan) {
			const myPlansKey = this.getUserStorageKey('myPlans');
			const savedPlans = uni.getStorageSync(myPlansKey) || [];

			// 如果没有进行中的计划，或者是同一个计划，直接开始
			const planIndex = savedPlans.findIndex(p => p.id === plan.id);

			if (planIndex !== -1) {
				savedPlans[planIndex].status = '进行中';
				savedPlans[planIndex].statusClass = 'primary';
				savedPlans[planIndex].actionText = '查看详情';
				savedPlans[planIndex].startDate = new Date().toISOString().split('T')[0];

				uni.setStorageSync(myPlansKey, savedPlans);
				this.loadMyPlans();

				// 同步计划到首页的本周训练计划
				this.syncPlanToWeeklySchedule(savedPlans[planIndex]);

				uni.showToast({
					title: '计划已开始！',
					icon: 'success'
				});
			}
		},

		// 切换计划方法
		switchPlan(currentPlan, newPlan) {
			const myPlansKey = this.getUserStorageKey('myPlans');
			const savedPlans = uni.getStorageSync(myPlansKey) || [];

			// 停止当前计划
			const currentPlanIndex = savedPlans.findIndex(p => p.id === currentPlan.id);
			if (currentPlanIndex !== -1) {
				savedPlans[currentPlanIndex].status = '已暂停';
				savedPlans[currentPlanIndex].statusClass = 'paused';
				savedPlans[currentPlanIndex].actionText = '继续计划';
				savedPlans[currentPlanIndex].pausedDate = new Date().toISOString().split('T')[0];
			}

			// 开始新计划
			const newPlanIndex = savedPlans.findIndex(p => p.id === newPlan.id);
			if (newPlanIndex !== -1) {
				savedPlans[newPlanIndex].status = '进行中';
				savedPlans[newPlanIndex].statusClass = 'primary';
				savedPlans[newPlanIndex].actionText = '查看详情';
				savedPlans[newPlanIndex].startDate = new Date().toISOString().split('T')[0];
			}

			// 保存更改
			uni.setStorageSync(myPlansKey, savedPlans);
			this.loadMyPlans();

			// 同步新计划到首页的本周训练计划
			this.syncPlanToWeeklySchedule(savedPlans[newPlanIndex]);

			uni.showToast({
				title: `已切换到"${newPlan.title}"`,
				icon: 'success',
				duration: 2000
			});
		},

		// 获取用户存储键
		getUserStorageKey(key) {
			const userInfo = uni.getStorageSync('userInfo');
			return userInfo && userInfo.id ? `${key}_${userInfo.id}` : key;
		},

		// 同步计划到首页的本周训练计划
		syncPlanToWeeklySchedule(plan) {
			// 获取用户信息
			const dailyPlansKey = this.getUserStorageKey('dailyPlans');

			// 清除现有的每日计划（如果需要的话）
			uni.removeStorageSync(dailyPlansKey);

			let dailyPlans = [];

			// 计算本周的日期范围
			const now = new Date();
			const currentDay = now.getDay();
			const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
			const mondayDate = new Date(now.getTime() + mondayOffset * 24 * 60 * 60 * 1000);

			// 如果计划有weekPlans结构（自定义计划）
			if (plan.weekPlans && plan.weekPlans[1]) {
				const weekPlan = plan.weekPlans[1]; // 使用第一周的计划
				const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

				dayNames.forEach((dayName, index) => {
					const date = new Date(mondayDate.getTime() + index * 24 * 60 * 60 * 1000);
					const fullDateStr = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');

					const dayTraining = weekPlan[dayName];
					if (dayTraining) {
						const dayPlan = {
							date: fullDateStr,
							dayName: dayName,
							restDay: dayTraining.restDay || false,
							exercises: dayTraining.exercises || [],
							notes: dayTraining.notes || ''
						};
						dailyPlans.push(dayPlan);
					}
				});
			}
			// 如果计划有exercises结构（系统生成的计划）
			else if (plan.exercises && plan.exercises.length > 0) {
				// 按训练天分配计划
				plan.exercises.forEach((dayPlan) => {
					if (dayPlan && dayPlan.day && dayPlan.exercises) {
						const dayName = dayPlan.day;
						// 查找对应的日期
						const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
						const targetDayIndex = dayNames.indexOf(dayName);

						if (targetDayIndex !== -1) {
							const date = new Date(mondayDate.getTime() + targetDayIndex * 24 * 60 * 60 * 1000);
							const fullDateStr = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');

							// 转换动作数据
							const exercises = dayPlan.exercises.map(exercise => {
								// 如果exercise是字符串，转换为对象
								if (typeof exercise === 'string') {
									return this.convertExerciseToObject(exercise);
								} else if (typeof exercise === 'object' && exercise.name) {
									return {
										name: exercise.name,
										sets: exercise.sets || 3,
										reps: exercise.reps || 12,
										weight: exercise.weight || '',
										rest: exercise.rest || 90,
										notes: exercise.notes || ''
									};
								}
								return exercise;
							});

							const syncDayPlan = {
								date: fullDateStr,
								dayName: dayName,
								restDay: false,
								exercises: exercises,
								notes: dayPlan.focus || ''
							};
							dailyPlans.push(syncDayPlan);
						}
					}
				});
			}

			// 保存到本地存储
			if (dailyPlans.length > 0) {
				uni.setStorageSync(dailyPlansKey, dailyPlans);
				console.log('计划已同步到本周训练计划，共同步', dailyPlans.length, '天');
			} else {
				console.log('没有找到可同步的计划数据');
			}
		},

		loadMyPlans() {
			// 从本地存储加载我的计划
			const myPlansKey = this.getUserStorageKey('myPlans');
			console.log('loadMyPlans - 存储键：', myPlansKey);
			const savedPlans = uni.getStorageSync(myPlansKey) || [];
			console.log('loadMyPlans - 从存储加载的计划：', savedPlans);

			// 直接使用从存储加载的计划，如果没有则为空数组
			this.myPlans = savedPlans;
			console.log('loadMyPlans - 设置我的计划为：', this.myPlans);
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
						const myPlansKey = this.getUserStorageKey('myPlans');
						uni.setStorageSync(myPlansKey, this.myPlans);

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
				const myPlansKey = this.getUserStorageKey('myPlans');
				const localPlans = uni.getStorageSync(myPlansKey) || [];

				// 同步到服务器
				if (localPlans.length > 0) {
					await localDataService.syncPlans();
				}

				// 从服务器获取数据
				const serverResult = await localDataService.getAllDataFromCloud();
				const serverPlans = serverResult.success ? (serverResult.data.plans || []) : [];

				// 合并数据
				const mergedPlans = this.mergePlansData(localPlans, serverPlans);

				// 保存合并后的数据
				uni.setStorageSync(myPlansKey, mergedPlans);
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
	min-width: 120rpx;
	/* 确保右侧有足够的占位空间 */
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

.badge-paused {
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
uni-modal,
.uni-modal,
uni-dialog,
.uni-dialog {
	z-index: 999999 !important;
}

/* 更细致的弹窗层级控制 */
page {
	--modal-z-index: 10000;
}

/* 针对uni-app的各种原生弹窗组件 */
.uni-modal__bd,
.uni-modal__ft,
.uni-modal__hd {
	z-index: 999999 !important;
}

/* 适配不同平台的弹窗选择器 */
.uni-mask {
	z-index: 999998 !important;
}

/* H5平台的弹窗 */
#uni-modal,
[class*="uni-modal"] {
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
	flex-wrap: wrap;
	gap: 12rpx;
	background-color: #f8fafc;
	padding: 8rpx;
	border-radius: 12rpx;
}

.week-tab {
	flex: 1;
	min-width: 120rpx;
	padding: 12rpx 20rpx;
	text-align: center;
	font-size: 26rpx;
	color: #6b7280;
	background-color: #fff;
	border-radius: 8rpx;
	border: 2rpx solid transparent;
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.week-tab:hover {
	background-color: #f0f9ff;
	color: #3b82f6;
}

.week-tab.active {
	background-color: var(--primary-color);
	color: #fff;
	border-color: var(--primary-color);
	box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
	transform: translateY(-1rpx);
}

.week-section {
	margin-bottom: 30rpx;
}

.week-title {
	font-size: 32rpx;
	font-weight: bold;
	color: var(--primary-color);
	margin-bottom: 15rpx;
	display: block;
	background-color: #e0f2fe;
	padding: 12rpx 16rpx;
	border-radius: 8rpx;
	border-left: 4rpx solid var(--primary-color);
}

.rest-day-note {
	text-align: center;
	padding: 16rpx;
	background-color: #f0f9ff;
	border-radius: 8rpx;
	margin-top: 8rpx;
}

.rest-text {
	font-size: 26rpx;
	color: #6b7280;
	font-style: italic;
}

.day-notes {
	margin-top: 12rpx;
	padding: 12rpx;
	background-color: #fffbeb;
	border-radius: 6rpx;
	border-left: 3rpx solid #f59e0b;
}

.notes-text {
	font-size: 24rpx;
	color: #92400e;
	line-height: 1.5;
}
</style>