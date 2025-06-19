/**
 * 训练计划管理工具类
 * 负责计划的创建、保存、加载和同步
 */

import { validatePlan } from './workoutPlans.js';

// 计划状态常量
export const PLAN_STATUS = {
  NOT_STARTED: '未开始',
  IN_PROGRESS: '进行中',
  PAUSED: '已暂停',
  COMPLETED: '已完成'
};

// 计划状态样式类
export const PLAN_STATUS_CLASS = {
  [PLAN_STATUS.NOT_STARTED]: 'warning',
  [PLAN_STATUS.IN_PROGRESS]: 'primary',
  [PLAN_STATUS.PAUSED]: 'paused',
  [PLAN_STATUS.COMPLETED]: 'success'
};

/**
 * 计划管理器类
 */
export class PlanManager {
  constructor() {
    this.storageKey = 'myPlans';
  }

  /**
   * 获取用户特定的存储键
   * @param {string} baseKey - 基础键名
   * @returns {string} 用户特定的键名
   */
  getUserStorageKey(baseKey = this.storageKey) {
    const userInfo = uni.getStorageSync('userInfo');
    return userInfo && userInfo.id ? `${baseKey}_${userInfo.id}` : baseKey;
  }

  /**
   * 加载用户的所有计划
   * @returns {Array} 计划列表
   */
  loadPlans() {
    try {
      const key = this.getUserStorageKey();
      const plans = uni.getStorageSync(key) || [];
      return this.sortPlansByDate(plans);
    } catch (error) {
      console.error('加载计划失败:', error);
      return [];
    }
  }

  /**
   * 保存计划到本地存储
   * @param {Object} plan - 计划对象
   * @returns {boolean} 是否保存成功
   */
  savePlan(plan) {
    try {
      if (!validatePlan(plan)) {
        throw new Error('计划数据无效');
      }

      const plans = this.loadPlans();
      
      // 检查是否是更新现有计划
      const existingIndex = plans.findIndex(p => p.id === plan.id);
      
      if (existingIndex !== -1) {
        plans[existingIndex] = { ...plans[existingIndex], ...plan };
      } else {
        // 新计划，添加默认属性
        const newPlan = {
          id: plan.id || Date.now(),
          createdDate: new Date().toISOString().split('T')[0],
          status: PLAN_STATUS.NOT_STARTED,
          statusClass: PLAN_STATUS_CLASS[PLAN_STATUS.NOT_STARTED],
          actionText: '开始计划',
          ...plan
        };
        plans.unshift(newPlan);
      }

      const key = this.getUserStorageKey();
      uni.setStorageSync(key, plans);
      return true;
    } catch (error) {
      console.error('保存计划失败:', error);
      return false;
    }
  }

  /**
   * 删除计划
   * @param {number} planId - 计划ID
   * @returns {boolean} 是否删除成功
   */
  deletePlan(planId) {
    try {
      const plans = this.loadPlans();
      const filteredPlans = plans.filter(plan => plan.id !== planId);
      
      const key = this.getUserStorageKey();
      uni.setStorageSync(key, filteredPlans);
      return true;
    } catch (error) {
      console.error('删除计划失败:', error);
      return false;
    }
  }

  /**
   * 更新计划状态
   * @param {number} planId - 计划ID
   * @param {string} status - 新状态
   * @returns {boolean} 是否更新成功
   */
  updatePlanStatus(planId, status) {
    try {
      const plans = this.loadPlans();
      const planIndex = plans.findIndex(p => p.id === planId);
      
      if (planIndex === -1) {
        throw new Error('计划不存在');
      }

      plans[planIndex].status = status;
      plans[planIndex].statusClass = PLAN_STATUS_CLASS[status];
      
      // 更新操作文本
      switch (status) {
        case PLAN_STATUS.NOT_STARTED:
          plans[planIndex].actionText = '开始计划';
          break;
        case PLAN_STATUS.IN_PROGRESS:
          plans[planIndex].actionText = '查看详情';
          plans[planIndex].startDate = new Date().toISOString().split('T')[0];
          break;
        case PLAN_STATUS.PAUSED:
          plans[planIndex].actionText = '继续计划';
          plans[planIndex].pausedDate = new Date().toISOString().split('T')[0];
          break;
        case PLAN_STATUS.COMPLETED:
          plans[planIndex].actionText = '查看详情';
          plans[planIndex].completedDate = new Date().toISOString().split('T')[0];
          break;
      }

      const key = this.getUserStorageKey();
      uni.setStorageSync(key, plans);
      return true;
    } catch (error) {
      console.error('更新计划状态失败:', error);
      return false;
    }
  }

  /**
   * 获取当前进行中的计划
   * @returns {Object|null} 进行中的计划
   */
  getCurrentPlan() {
    const plans = this.loadPlans();
    return plans.find(plan => plan.status === PLAN_STATUS.IN_PROGRESS) || null;
  }

  /**
   * 开始计划
   * @param {number} planId - 计划ID
   * @returns {boolean} 是否开始成功
   */
  startPlan(planId) {
    try {
      // 检查是否有其他进行中的计划
      const currentPlan = this.getCurrentPlan();
      if (currentPlan && currentPlan.id !== planId) {
        // 暂停当前计划
        this.updatePlanStatus(currentPlan.id, PLAN_STATUS.PAUSED);
      }

      // 开始新计划
      return this.updatePlanStatus(planId, PLAN_STATUS.IN_PROGRESS);
    } catch (error) {
      console.error('开始计划失败:', error);
      return false;
    }
  }

  /**
   * 按日期排序计划
   * @param {Array} plans - 计划数组
   * @returns {Array} 排序后的计划数组
   */
  sortPlansByDate(plans) {
    return plans.sort((a, b) => {
      const timeA = new Date(a.createdDate || 0).getTime();
      const timeB = new Date(b.createdDate || 0).getTime();
      return timeB - timeA;
    });
  }

  /**
   * 生成计划进度文本
   * @param {Object} plan - 计划对象
   * @returns {string} 进度文本
   */
  generateProgressText(plan) {
    if (!plan.duration) {
      return '进度未知';
    }

    const totalWeeks = parseInt(plan.duration.replace('周', '')) || 0;
    let currentWeek = 0;

    if (plan.status === PLAN_STATUS.IN_PROGRESS && plan.startDate) {
      const startDate = new Date(plan.startDate);
      const now = new Date();
      const diffTime = Math.abs(now - startDate);
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      currentWeek = Math.min(diffWeeks, totalWeeks);
    } else if (plan.status === PLAN_STATUS.COMPLETED) {
      currentWeek = totalWeeks;
    }

    return `${currentWeek}周/共${totalWeeks}周`;
  }

  /**
   * 创建系统生成的计划
   * @param {Object} params - 计划参数
   * @returns {Object} 生成的计划对象
   */
  createSystemPlan(params) {
    const { title, goal, level, duration, trainingDays, exercises } = params;
    
    return {
      id: Date.now(),
      title: title || `${goal}计划`,
      description: `这是一个${duration}的${goal}计划，每周训练${trainingDays}，适合${level}训练者。`,
      goal,
      level,
      duration,
      trainingDays,
      status: PLAN_STATUS.NOT_STARTED,
      statusClass: PLAN_STATUS_CLASS[PLAN_STATUS.NOT_STARTED],
      progress: `0周/共${duration.replace('周', '')}周`,
      actionText: '开始计划',
      createdDate: new Date().toISOString().split('T')[0],
      exercises: exercises || []
    };
  }

  /**
   * 创建自定义计划
   * @param {Object} params - 计划参数
   * @returns {Object} 生成的计划对象
   */
  createCustomPlan(params) {
    const { title, weeks, weekPlans } = params;
    
    return {
      id: Date.now(),
      title,
      description: `自定义${weeks}周训练计划`,
      planType: '自定义计划',
      duration: `${weeks}周`,
      status: PLAN_STATUS.NOT_STARTED,
      statusClass: PLAN_STATUS_CLASS[PLAN_STATUS.NOT_STARTED],
      progress: `0周/共${weeks}周`,
      actionText: '开始计划',
      createdDate: new Date().toISOString().split('T')[0],
      customPlan: true,
      weekPlans,
      totalWeeks: weeks
    };
  }

  /**
   * 同步计划到首页的本周训练计划
   * @param {Object} plan - 要同步的计划
   * @returns {boolean} 是否同步成功
   */
  syncPlanToWeeklySchedule(plan) {
    try {
      const dailyPlansKey = this.getUserStorageKey('dailyPlans');
      
      // 清除现有的每日计划
      uni.removeStorageSync(dailyPlansKey);
      
      let dailyPlans = [];
      
      // 计算本周的日期范围
      const now = new Date();
      const currentDay = now.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const mondayDate = new Date(now.getTime() + mondayOffset * 24 * 60 * 60 * 1000);
      
      if (plan.weekPlans && plan.weekPlans[1]) {
        // 自定义计划
        dailyPlans = this.syncCustomPlan(plan, mondayDate);
      } else if (plan.exercises && plan.exercises.length > 0) {
        // 系统生成计划
        dailyPlans = this.syncSystemPlan(plan, mondayDate);
      }
      
      // 保存到本地存储
      if (dailyPlans.length > 0) {
        uni.setStorageSync(dailyPlansKey, dailyPlans);
        console.log('计划已同步到本周训练计划，共同步', dailyPlans.length, '天');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('同步计划失败:', error);
      return false;
    }
  }

  /**
   * 同步自定义计划
   * @param {Object} plan - 计划对象
   * @param {Date} mondayDate - 本周一的日期
   * @returns {Array} 每日计划数组
   */
  syncCustomPlan(plan, mondayDate) {
    const dailyPlans = [];
    const weekPlan = plan.weekPlans[1]; // 使用第一周的计划
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    dayNames.forEach((dayName, index) => {
      const date = new Date(mondayDate.getTime() + index * 24 * 60 * 60 * 1000);
      const fullDateStr = this.formatDate(date);
      
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
    
    return dailyPlans;
  }

  /**
   * 同步系统生成计划
   * @param {Object} plan - 计划对象
   * @param {Date} mondayDate - 本周一的日期
   * @returns {Array} 每日计划数组
   */
  syncSystemPlan(plan, mondayDate) {
    const dailyPlans = [];
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    plan.exercises.forEach((dayPlan) => {
      if (dayPlan && dayPlan.day && dayPlan.exercises) {
        const dayName = dayPlan.day;
        const targetDayIndex = dayNames.indexOf(dayName);
        
        if (targetDayIndex !== -1) {
          const date = new Date(mondayDate.getTime() + targetDayIndex * 24 * 60 * 60 * 1000);
          const fullDateStr = this.formatDate(date);
          
          const syncDayPlan = {
            date: fullDateStr,
            dayName: dayName,
            restDay: false,
            exercises: dayPlan.exercises,
            notes: dayPlan.focus || ''
          };
          dailyPlans.push(syncDayPlan);
        }
      }
    });
    
    return dailyPlans;
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date) {
    return date.getFullYear() + '-' + 
           (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
           date.getDate().toString().padStart(2, '0');
  }
}

// 导出单例实例
export default new PlanManager();
