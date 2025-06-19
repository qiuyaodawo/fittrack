/**
 * 训练计划数据配置
 * 包含不同目标、水平和训练天数的计划模板
 */

// 训练目标枚举
export const WORKOUT_GOALS = {
  MUSCLE_GAIN: 0,
  FAT_LOSS: 1,
  STRENGTH: 2,
  ENDURANCE: 3
};

// 训练水平枚举
export const TRAINING_LEVELS = {
  BEGINNER: '初级',
  INTERMEDIATE: '中级',
  ADVANCED: '高级'
};

// 训练天数配置
export const TRAINING_DAYS = {
  THREE_DAYS: 3,
  FOUR_DAYS: 4,
  FIVE_DAYS: 5,
  SIX_DAYS: 6
};

// 动作库配置
export const EXERCISE_LIBRARY = {
  胸肌: ['杠铃卧推', '哑铃卧推', '上斜卧推', '下斜卧推', '哑铃飞鸟', '俯卧撑', '双杠臂屈伸'],
  背部: ['引体向上', '杠铃划船', '哑铃划船', '高位下拉', '坐姿划船', 'T杠划船', '面拉'],
  腿部: ['杠铃深蹲', '前蹲', '哑铃深蹲', '腿举', '保加利亚深蹲', '罗马尼亚硬拉', '硬拉'],
  肩部: ['杠铃肩推', '哑铃肩推', '侧平举', '前平举', '阿诺德推举', '倒立撑'],
  手臂: ['杠铃弯举', '哑铃弯举', '锤式弯举', '窄距卧推', '三头肌下压', '臂屈伸'],
  核心: ['平板支撑', '卷腹', '俄罗斯转体', '登山者', '死虫', '鸟狗式']
};

// 增肌训练计划模板
export const MUSCLE_GAIN_PLANS = {
  [TRAINING_LEVELS.BEGINNER]: {
    [TRAINING_DAYS.THREE_DAYS]: [
      {
        day: '周一',
        focus: '上肢综合',
        exercises: [
          { name: '俯卧撑', sets: 3, reps: 10, rest: 90 },
          { name: '哑铃弯举', sets: 3, reps: 12, rest: 90 },
          { name: '臂屈伸', sets: 3, reps: 8, rest: 90 },
          { name: '侧平举', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周三',
        focus: '下肢综合',
        exercises: [
          { name: '杠铃深蹲', sets: 3, reps: 15, rest: 90 },
          { name: '保加利亚深蹲', sets: 3, reps: 10, rest: 90 },
          { name: '哑铃深蹲', sets: 3, reps: 18, rest: 90 },
          { name: '罗马尼亚硬拉', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周五',
        focus: '核心全身',
        exercises: [
          { name: '平板支撑', sets: 3, reps: 30, rest: 90 },
          { name: '卷腹', sets: 3, reps: 15, rest: 90 },
          { name: '俯卧撑', sets: 2, reps: 8, rest: 90 },
          { name: '杠铃深蹲', sets: 2, reps: 12, rest: 90 }
        ]
      }
    ],
    [TRAINING_DAYS.FOUR_DAYS]: [
      {
        day: '周一',
        focus: '胸肌',
        exercises: [
          { name: '俯卧撑', sets: 3, reps: 10, rest: 90 },
          { name: '哑铃卧推', sets: 3, reps: 12, rest: 90 },
          { name: '哑铃飞鸟', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周二',
        focus: '背部',
        exercises: [
          { name: '引体向上', sets: 3, reps: 6, rest: 90 },
          { name: '哑铃划船', sets: 3, reps: 12, rest: 90 },
          { name: '坐姿划船', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周四',
        focus: '腿部',
        exercises: [
          { name: '杠铃深蹲', sets: 3, reps: 18, rest: 90 },
          { name: '哑铃深蹲', sets: 3, reps: 12, rest: 90 },
          { name: '腿举', sets: 3, reps: 18, rest: 90 }
        ]
      },
      {
        day: '周五',
        focus: '肩部手臂',
        exercises: [
          { name: '哑铃肩推', sets: 3, reps: 12, rest: 90 },
          { name: '侧平举', sets: 3, reps: 12, rest: 90 },
          { name: '哑铃弯举', sets: 3, reps: 12, rest: 90 },
          { name: '三头肌下压', sets: 3, reps: 12, rest: 90 }
        ]
      }
    ]
  },
  [TRAINING_LEVELS.INTERMEDIATE]: {
    [TRAINING_DAYS.THREE_DAYS]: [
      {
        day: '周一',
        focus: '推力主导',
        exercises: [
          { name: '杠铃卧推', sets: 5, reps: 8, rest: 120 },
          { name: '杠铃肩推', sets: 4, reps: 8, rest: 120 },
          { name: '上斜卧推', sets: 4, reps: 10, rest: 90 },
          { name: '三头肌下压', sets: 4, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周三',
        focus: '拉力主导',
        exercises: [
          { name: '硬拉', sets: 4, reps: 6, rest: 180 },
          { name: '引体向上', sets: 4, reps: 8, rest: 120 },
          { name: '杠铃划船', sets: 4, reps: 8, rest: 120 },
          { name: '杠铃弯举', sets: 4, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周五',
        focus: '下肢主导',
        exercises: [
          { name: '杠铃深蹲', sets: 5, reps: 8, rest: 180 },
          { name: '前蹲', sets: 3, reps: 8, rest: 120 },
          { name: '罗马尼亚硬拉', sets: 4, reps: 8, rest: 120 },
          { name: '腿举', sets: 3, reps: 12, rest: 90 }
        ]
      }
    ]
  }
};

// 减脂训练计划模板
export const FAT_LOSS_PLANS = {
  [TRAINING_LEVELS.BEGINNER]: {
    [TRAINING_DAYS.THREE_DAYS]: [
      {
        day: '周一',
        focus: 'HIIT入门',
        exercises: [
          { name: '开合跳', sets: 8, reps: 30, rest: 30, type: 'hiit' },
          { name: '高抬腿', sets: 6, reps: 30, rest: 30, type: 'hiit' },
          { name: '深蹲', sets: 6, reps: 30, rest: 30, type: 'hiit' }
        ]
      },
      {
        day: '周三',
        focus: '力量循环',
        exercises: [
          { name: '徒手深蹲', sets: 3, reps: 15, rest: 45 },
          { name: '俯卧撑', sets: 3, reps: 10, rest: 45 },
          { name: '平板支撑', sets: 3, reps: 30, rest: 45 },
          { name: '登山者', sets: 3, reps: 20, rest: 45 }
        ]
      },
      {
        day: '周五',
        focus: '有氧恢复',
        exercises: [
          { name: '快走', sets: 1, reps: 1800, rest: 0, type: 'cardio' },
          { name: '拉伸', sets: 1, reps: 600, rest: 0, type: 'stretch' },
          { name: '深呼吸练习', sets: 1, reps: 300, rest: 0, type: 'breathing' }
        ]
      }
    ]
  }
};

// 力量训练计划模板
export const STRENGTH_PLANS = {
  [TRAINING_LEVELS.INTERMEDIATE]: {
    [TRAINING_DAYS.THREE_DAYS]: [
      {
        day: '周一',
        focus: '深蹲日',
        exercises: [
          { name: '杠铃深蹲', sets: 5, reps: 5, rest: 300 },
          { name: '前蹲', sets: 3, reps: 8, rest: 180 },
          { name: '保加利亚深蹲', sets: 3, reps: 10, rest: 120 },
          { name: '腿举', sets: 3, reps: 15, rest: 90 }
        ]
      },
      {
        day: '周三',
        focus: '卧推日',
        exercises: [
          { name: '杠铃卧推', sets: 5, reps: 5, rest: 300 },
          { name: '上斜卧推', sets: 3, reps: 8, rest: 180 },
          { name: '哑铃飞鸟', sets: 3, reps: 12, rest: 120 },
          { name: '三头肌下压', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周五',
        focus: '硬拉日',
        exercises: [
          { name: '硬拉', sets: 5, reps: 5, rest: 300 },
          { name: '杠铃划船', sets: 3, reps: 8, rest: 180 },
          { name: '引体向上', sets: 3, reps: 8, rest: 120 },
          { name: '杠铃弯举', sets: 3, reps: 10, rest: 90 }
        ]
      }
    ]
  }
};

// 耐力训练计划模板
export const ENDURANCE_PLANS = {
  [TRAINING_LEVELS.BEGINNER]: {
    [TRAINING_DAYS.THREE_DAYS]: [
      {
        day: '周一',
        focus: '有氧基础',
        exercises: [
          { name: '快走', sets: 1, reps: 1800, rest: 0, type: 'cardio' },
          { name: '核心训练', sets: 1, reps: 600, rest: 0, type: 'core' },
          { name: '拉伸', sets: 1, reps: 600, rest: 0, type: 'stretch' }
        ]
      },
      {
        day: '周三',
        focus: '力量耐力',
        exercises: [
          { name: '深蹲', sets: 3, reps: 15, rest: 45 },
          { name: '俯卧撑', sets: 3, reps: 10, rest: 45 },
          { name: '平板支撑', sets: 3, reps: 30, rest: 45 }
        ]
      },
      {
        day: '周五',
        focus: '混合训练',
        exercises: [
          { name: '慢跑', sets: 1, reps: 900, rest: 0, type: 'cardio' },
          { name: '功能性训练', sets: 1, reps: 900, rest: 0, type: 'functional' },
          { name: '柔韧性训练', sets: 1, reps: 600, rest: 0, type: 'flexibility' }
        ]
      }
    ]
  }
};

/**
 * 获取训练计划
 * @param {number} goal - 训练目标
 * @param {string} level - 训练水平
 * @param {number} days - 训练天数
 * @returns {Array} 训练计划数组
 */
export function getWorkoutPlan(goal, level, days) {
  const planMap = {
    [WORKOUT_GOALS.MUSCLE_GAIN]: MUSCLE_GAIN_PLANS,
    [WORKOUT_GOALS.FAT_LOSS]: FAT_LOSS_PLANS,
    [WORKOUT_GOALS.STRENGTH]: STRENGTH_PLANS,
    [WORKOUT_GOALS.ENDURANCE]: ENDURANCE_PLANS
  };

  const goalPlans = planMap[goal];
  if (!goalPlans || !goalPlans[level] || !goalPlans[level][days]) {
    return [];
  }

  return goalPlans[level][days];
}

/**
 * 格式化动作显示名称
 * @param {Object} exercise - 动作对象
 * @returns {string} 格式化后的显示名称
 */
export function formatExerciseDisplay(exercise) {
  if (typeof exercise === 'string') {
    return exercise;
  }

  if (!exercise || !exercise.name) {
    return '';
  }

  let displayName = exercise.name;

  // 添加组数信息
  if (exercise.sets && exercise.sets > 0) {
    displayName += ` ${exercise.sets}组`;
  }

  // 添加次数信息
  if (exercise.reps && exercise.reps > 0) {
    if (exercise.type === 'hiit') {
      displayName += ` × ${exercise.reps}秒`;
    } else if (exercise.type === 'cardio' || exercise.type === 'stretch') {
      displayName += ` ${Math.floor(exercise.reps / 60)}分钟`;
    } else {
      displayName += ` × ${exercise.reps}次`;
    }
  }

  // 添加休息时间信息
  if (exercise.rest && exercise.rest > 0) {
    displayName += ` 休息${exercise.rest}秒`;
  }

  return displayName;
}

/**
 * 验证训练计划数据
 * @param {Object} plan - 计划对象
 * @returns {boolean} 是否有效
 */
export function validatePlan(plan) {
  if (!plan || !plan.title || !plan.title.trim()) {
    return false;
  }

  if (plan.weekPlans) {
    // 自定义计划验证
    return Object.keys(plan.weekPlans).length > 0;
  }

  if (plan.exercises) {
    // 系统生成计划验证
    return plan.exercises.length > 0;
  }

  return false;
}
