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
    ],
    [TRAINING_DAYS.FOUR_DAYS]: [
      {
        day: '周一',
        focus: '胸肩三头',
        exercises: [
          { name: '杠铃卧推', sets: 4, reps: 8, rest: 120 },
          { name: '上斜卧推', sets: 3, reps: 10, rest: 90 },
          { name: '杠铃肩推', sets: 4, reps: 8, rest: 120 },
          { name: '三头肌下压', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周二',
        focus: '背二头',
        exercises: [
          { name: '引体向上', sets: 4, reps: 8, rest: 120 },
          { name: '杠铃划船', sets: 4, reps: 8, rest: 120 },
          { name: '哑铃划船', sets: 3, reps: 10, rest: 90 },
          { name: '杠铃弯举', sets: 4, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周四',
        focus: '腿部训练',
        exercises: [
          { name: '杠铃深蹲', sets: 4, reps: 8, rest: 180 },
          { name: '罗马尼亚硬拉', sets: 4, reps: 8, rest: 120 },
          { name: '腿举', sets: 3, reps: 12, rest: 90 },
          { name: '保加利亚深蹲', sets: 3, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周六',
        focus: '手臂专项',
        exercises: [
          { name: '窄距卧推', sets: 4, reps: 8, rest: 120 },
          { name: '哑铃弯举', sets: 4, reps: 10, rest: 90 },
          { name: '锤式弯举', sets: 3, reps: 12, rest: 90 },
          { name: '臂屈伸', sets: 3, reps: 12, rest: 90 }
        ]
      }
    ],
    [TRAINING_DAYS.FIVE_DAYS]: [
      {
        day: '周一',
        focus: '胸部',
        exercises: [
          { name: '杠铃卧推', sets: 4, reps: 8, rest: 120 },
          { name: '上斜卧推', sets: 4, reps: 10, rest: 90 },
          { name: '哑铃飞鸟', sets: 3, reps: 12, rest: 90 },
          { name: '双杠臂屈伸', sets: 3, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周二',
        focus: '背部',
        exercises: [
          { name: '引体向上', sets: 4, reps: 8, rest: 120 },
          { name: '杠铃划船', sets: 4, reps: 8, rest: 120 },
          { name: '坐姿划船', sets: 3, reps: 10, rest: 90 },
          { name: '高位下拉', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周三',
        focus: '腿部',
        exercises: [
          { name: '杠铃深蹲', sets: 4, reps: 8, rest: 180 },
          { name: '罗马尼亚硬拉', sets: 4, reps: 8, rest: 120 },
          { name: '腿举', sets: 3, reps: 12, rest: 90 },
          { name: '保加利亚深蹲', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周五',
        focus: '肩部',
        exercises: [
          { name: '哑铃肩推', sets: 4, reps: 8, rest: 120 },
          { name: '侧平举', sets: 4, reps: 12, rest: 90 },
          { name: '阿诺德推举', sets: 3, reps: 15, rest: 90 },
          { name: '前平举', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周六',
        focus: '手臂',
        exercises: [
          { name: '哑铃弯举', sets: 4, reps: 10, rest: 90 },
          { name: '窄距卧推', sets: 4, reps: 8, rest: 120 },
          { name: '锤式弯举', sets: 3, reps: 12, rest: 90 },
          { name: '三头肌下压', sets: 3, reps: 12, rest: 90 }
        ]
      }
    ],
    [TRAINING_DAYS.SIX_DAYS]: [
      {
        day: '周一',
        focus: '胸部',
        exercises: [
          { name: '杠铃卧推', sets: 4, reps: 8, rest: 120 },
          { name: '上斜卧推', sets: 4, reps: 10, rest: 90 },
          { name: '哑铃飞鸟', sets: 3, reps: 12, rest: 90 },
          { name: '双杠臂屈伸', sets: 3, reps: 8, rest: 90 }
        ]
      },
      {
        day: '周二',
        focus: '背部',
        exercises: [
          { name: '引体向上', sets: 4, reps: 8, rest: 120 },
          { name: '杠铃划船', sets: 4, reps: 8, rest: 120 },
          { name: '坐姿划船', sets: 3, reps: 10, rest: 90 },
          { name: '高位下拉', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周三',
        focus: '腿部(股四头肌)',
        exercises: [
          { name: '杠铃深蹲', sets: 4, reps: 8, rest: 180 },
          { name: '腿举', sets: 4, reps: 12, rest: 90 },
          { name: '保加利亚深蹲', sets: 3, reps: 10, rest: 90 },
          { name: '前蹲', sets: 3, reps: 12, rest: 120 }
        ]
      },
      {
        day: '周四',
        focus: '肩部',
        exercises: [
          { name: '杠铃肩推', sets: 4, reps: 8, rest: 120 },
          { name: '侧平举', sets: 4, reps: 12, rest: 90 },
          { name: '阿诺德推举', sets: 3, reps: 15, rest: 90 },
          { name: '前平举', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周五',
        focus: '手臂',
        exercises: [
          { name: '哑铃弯举', sets: 4, reps: 10, rest: 90 },
          { name: '窄距卧推', sets: 4, reps: 8, rest: 120 },
          { name: '锤式弯举', sets: 3, reps: 12, rest: 90 },
          { name: '三头肌下压', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周六',
        focus: '腿部(后链)',
        exercises: [
          { name: '罗马尼亚硬拉', sets: 4, reps: 8, rest: 120 },
          { name: '硬拉', sets: 4, reps: 12, rest: 180 },
          { name: '保加利亚深蹲', sets: 3, reps: 15, rest: 90 },
          { name: '哑铃深蹲', sets: 4, reps: 15, rest: 90 }
        ]
      }
    ]
  },
  [TRAINING_LEVELS.ADVANCED]: {
    [TRAINING_DAYS.THREE_DAYS]: [
      {
        day: '周一',
        focus: '推力主导',
        exercises: [
          { name: '杠铃卧推', sets: 5, reps: 6, rest: 180 },
          { name: '杠铃肩推', sets: 4, reps: 8, rest: 150 },
          { name: '上斜卧推', sets: 4, reps: 8, rest: 120 },
          { name: '三头肌下压', sets: 4, reps: 10, rest: 90 },
          { name: '双杠臂屈伸', sets: 3, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周三',
        focus: '拉力主导',
        exercises: [
          { name: '硬拉', sets: 5, reps: 5, rest: 240 },
          { name: '引体向上', sets: 4, reps: 8, rest: 150 },
          { name: '杠铃划船', sets: 4, reps: 8, rest: 120 },
          { name: '杠铃弯举', sets: 4, reps: 10, rest: 90 },
          { name: '面拉', sets: 3, reps: 15, rest: 90 }
        ]
      },
      {
        day: '周五',
        focus: '下肢主导',
        exercises: [
          { name: '杠铃深蹲', sets: 5, reps: 6, rest: 240 },
          { name: '前蹲', sets: 4, reps: 8, rest: 180 },
          { name: '罗马尼亚硬拉', sets: 4, reps: 8, rest: 150 },
          { name: '腿举', sets: 3, reps: 12, rest: 120 },
          { name: '保加利亚深蹲', sets: 3, reps: 12, rest: 90 }
        ]
      }
    ],
    [TRAINING_DAYS.FOUR_DAYS]: [
      {
        day: '周一',
        focus: '胸肩三头',
        exercises: [
          { name: '杠铃卧推', sets: 5, reps: 6, rest: 180 },
          { name: '上斜卧推', sets: 4, reps: 8, rest: 120 },
          { name: '杠铃肩推', sets: 4, reps: 8, rest: 150 },
          { name: '三头肌下压', sets: 4, reps: 12, rest: 90 },
          { name: '双杠臂屈伸', sets: 3, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周二',
        focus: '背二头',
        exercises: [
          { name: '引体向上', sets: 5, reps: 8, rest: 150 },
          { name: '杠铃划船', sets: 4, reps: 8, rest: 120 },
          { name: '哑铃划船', sets: 3, reps: 10, rest: 90 },
          { name: '杠铃弯举', sets: 4, reps: 10, rest: 90 },
          { name: '锤式弯举', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周四',
        focus: '腿部训练',
        exercises: [
          { name: '杠铃深蹲', sets: 5, reps: 6, rest: 240 },
          { name: '罗马尼亚硬拉', sets: 4, reps: 8, rest: 150 },
          { name: '腿举', sets: 3, reps: 12, rest: 120 },
          { name: '保加利亚深蹲', sets: 3, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周六',
        focus: '手臂专项',
        exercises: [
          { name: '窄距卧推', sets: 4, reps: 8, rest: 120 },
          { name: '哑铃弯举', sets: 4, reps: 10, rest: 90 },
          { name: '锤式弯举', sets: 3, reps: 12, rest: 90 },
          { name: '臂屈伸', sets: 3, reps: 12, rest: 90 },
          { name: '阿诺德推举', sets: 3, reps: 12, rest: 90 }
        ]
      }
    ],
    [TRAINING_DAYS.FIVE_DAYS]: [
      {
        day: '周一',
        focus: '胸部',
        exercises: [
          { name: '杠铃卧推', sets: 5, reps: 6, rest: 180 },
          { name: '上斜卧推', sets: 4, reps: 8, rest: 120 },
          { name: '哑铃飞鸟', sets: 3, reps: 12, rest: 90 },
          { name: '双杠臂屈伸', sets: 3, reps: 10, rest: 90 },
          { name: '下斜卧推', sets: 3, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周二',
        focus: '背部',
        exercises: [
          { name: '引体向上', sets: 5, reps: 8, rest: 150 },
          { name: '杠铃划船', sets: 4, reps: 8, rest: 120 },
          { name: '坐姿划船', sets: 3, reps: 10, rest: 90 },
          { name: '高位下拉', sets: 3, reps: 12, rest: 90 },
          { name: 'T杠划船', sets: 3, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周三',
        focus: '腿部',
        exercises: [
          { name: '杠铃深蹲', sets: 5, reps: 6, rest: 240 },
          { name: '罗马尼亚硬拉', sets: 4, reps: 8, rest: 150 },
          { name: '腿举', sets: 4, reps: 12, rest: 120 },
          { name: '保加利亚深蹲', sets: 3, reps: 12, rest: 90 },
          { name: '前蹲', sets: 3, reps: 10, rest: 120 }
        ]
      },
      {
        day: '周五',
        focus: '肩部',
        exercises: [
          { name: '杠铃肩推', sets: 4, reps: 8, rest: 150 },
          { name: '哑铃肩推', sets: 4, reps: 10, rest: 120 },
          { name: '侧平举', sets: 4, reps: 12, rest: 90 },
          { name: '阿诺德推举', sets: 3, reps: 15, rest: 90 },
          { name: '前平举', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周六',
        focus: '手臂',
        exercises: [
          { name: '哑铃弯举', sets: 4, reps: 10, rest: 90 },
          { name: '窄距卧推', sets: 4, reps: 8, rest: 120 },
          { name: '锤式弯举', sets: 3, reps: 12, rest: 90 },
          { name: '三头肌下压', sets: 3, reps: 12, rest: 90 },
          { name: '臂屈伸', sets: 3, reps: 10, rest: 90 }
        ]
      }
    ],
    [TRAINING_DAYS.SIX_DAYS]: [
      {
        day: '周一',
        focus: '胸部',
        exercises: [
          { name: '杠铃卧推', sets: 5, reps: 6, rest: 180 },
          { name: '上斜卧推', sets: 4, reps: 8, rest: 120 },
          { name: '哑铃飞鸟', sets: 3, reps: 12, rest: 90 },
          { name: '双杠臂屈伸', sets: 3, reps: 8, rest: 90 },
          { name: '下斜卧推', sets: 3, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周二',
        focus: '背部',
        exercises: [
          { name: '引体向上', sets: 5, reps: 6, rest: 180 },
          { name: '杠铃划船', sets: 4, reps: 8, rest: 120 },
          { name: '坐姿划船', sets: 3, reps: 10, rest: 90 },
          { name: '高位下拉', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周三',
        focus: '腿部(股四头肌)',
        exercises: [
          { name: '杠铃深蹲', sets: 5, reps: 6, rest: 240 },
          { name: '腿举', sets: 4, reps: 12, rest: 90 },
          { name: '保加利亚深蹲', sets: 3, reps: 10, rest: 90 },
          { name: '前蹲', sets: 3, reps: 8, rest: 120 },
          { name: '腿屈伸', sets: 3, reps: 15, rest: 90 }
        ]
      },
      {
        day: '周四',
        focus: '肩部',
        exercises: [
          { name: '杠铃肩推', sets: 4, reps: 8, rest: 150 },
          { name: '哑铃肩推', sets: 4, reps: 10, rest: 120 },
          { name: '侧平举', sets: 4, reps: 12, rest: 90 },
          { name: '阿诺德推举', sets: 3, reps: 15, rest: 90 },
          { name: '前平举', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周五',
        focus: '手臂',
        exercises: [
          { name: '哑铃弯举', sets: 4, reps: 10, rest: 90 },
          { name: '窄距卧推', sets: 4, reps: 8, rest: 120 },
          { name: '锤式弯举', sets: 3, reps: 12, rest: 90 },
          { name: '三头肌下压', sets: 3, reps: 12, rest: 90 },
          { name: '臂屈伸', sets: 3, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周六',
        focus: '腿部(后链)',
        exercises: [
          { name: '罗马尼亚硬拉', sets: 4, reps: 8, rest: 150 },
          { name: '硬拉', sets: 4, reps: 6, rest: 240 },
          { name: '保加利亚深蹲', sets: 3, reps: 15, rest: 90 },
          { name: '哑铃深蹲', sets: 4, reps: 15, rest: 90 },
          { name: '腿弯举', sets: 3, reps: 15, rest: 90 }
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
  },
  [TRAINING_LEVELS.INTERMEDIATE]: {
    [TRAINING_DAYS.THREE_DAYS]: [
      {
        day: '周一',
        focus: '高强度HIIT',
        exercises: [
          { name: '波比跳', sets: 10, reps: 45, rest: 15, type: 'hiit' },
          { name: '高抬腿跑', sets: 8, reps: 45, rest: 15, type: 'hiit' },
          { name: '深蹲跳', sets: 8, reps: 30, rest: 30, type: 'hiit' }
        ]
      },
      {
        day: '周三',
        focus: '力量代谢',
        exercises: [
          { name: '深蹲跳', sets: 4, reps: 12, rest: 60 },
          { name: '俯卧撑', sets: 4, reps: 15, rest: 60 },
          { name: '登山者', sets: 4, reps: 40, rest: 60 },
          { name: '平板支撑', sets: 3, reps: 45, rest: 60 }
        ]
      },
      {
        day: '周五',
        focus: '有氧间歇',
        exercises: [
          { name: '跑步间歇', sets: 1, reps: 1800, rest: 0, type: 'cardio' },
          { name: '核心训练', sets: 1, reps: 900, rest: 0, type: 'core' },
          { name: '拉伸', sets: 1, reps: 600, rest: 0, type: 'stretch' }
        ]
      }
    ],
    [TRAINING_DAYS.FOUR_DAYS]: [
      {
        day: '周一',
        focus: 'HIIT训练',
        exercises: [
          { name: '波比跳', sets: 8, reps: 45, rest: 15, type: 'hiit' },
          { name: '开合跳', sets: 10, reps: 30, rest: 30, type: 'hiit' },
          { name: '高抬腿', sets: 8, reps: 45, rest: 15, type: 'hiit' }
        ]
      },
      {
        day: '周二',
        focus: '力量训练',
        exercises: [
          { name: '徒手深蹲', sets: 4, reps: 15, rest: 60 },
          { name: '俯卧撑', sets: 4, reps: 10, rest: 60 },
          { name: '平板支撑', sets: 3, reps: 45, rest: 60 }
        ]
      },
      {
        day: '周四',
        focus: '有氧训练',
        exercises: [
          { name: '快走', sets: 1, reps: 1500, rest: 0, type: 'cardio' },
          { name: '登山者', sets: 3, reps: 30, rest: 60 },
          { name: '拉伸', sets: 1, reps: 600, rest: 0, type: 'stretch' }
        ]
      },
      {
        day: '周六',
        focus: '核心训练',
        exercises: [
          { name: '卷腹', sets: 3, reps: 20, rest: 45 },
          { name: '俄罗斯转体', sets: 3, reps: 20, rest: 45 },
          { name: '平板支撑', sets: 3, reps: 45, rest: 60 },
          { name: '死虫式', sets: 3, reps: 15, rest: 45 }
        ]
      }
    ],
    [TRAINING_DAYS.FIVE_DAYS]: [
      {
        day: '周一',
        focus: 'HIIT训练',
        exercises: [
          { name: '开合跳', sets: 8, reps: 45, rest: 15, type: 'hiit' },
          { name: '波比跳', sets: 6, reps: 30, rest: 30, type: 'hiit' },
          { name: '高抬腿', sets: 6, reps: 30, rest: 30, type: 'hiit' }
        ]
      },
      {
        day: '周二',
        focus: '上肢力量',
        exercises: [
          { name: '俯卧撑', sets: 3, reps: 10, rest: 60 },
          { name: '墙面俯卧撑', sets: 3, reps: 15, rest: 60 },
          { name: '三头肌撑体', sets: 3, reps: 8, rest: 60 }
        ]
      },
      {
        day: '周三',
        focus: '有氧训练',
        exercises: [
          { name: '快走', sets: 1, reps: 1800, rest: 0, type: 'cardio' },
          { name: '台阶踏步', sets: 1, reps: 600, rest: 0, type: 'cardio' },
          { name: '拉伸', sets: 1, reps: 600, rest: 0, type: 'stretch' }
        ]
      },
      {
        day: '周五',
        focus: '下肢训练',
        exercises: [
          { name: '徒手深蹲', sets: 3, reps: 15, rest: 60 },
          { name: '弓步蹲', sets: 3, reps: 10, rest: 60 },
          { name: '小腿提踵', sets: 3, reps: 20, rest: 60 }
        ]
      },
      {
        day: '周六',
        focus: '核心训练',
        exercises: [
          { name: '卷腹', sets: 3, reps: 20, rest: 45 },
          { name: '俄罗斯转体', sets: 3, reps: 20, rest: 45 },
          { name: '平板支撑', sets: 3, reps: 45, rest: 60 },
          { name: '死虫式', sets: 3, reps: 15, rest: 45 }
        ]
      }
    ],
    [TRAINING_DAYS.SIX_DAYS]: [
      {
        day: '周一',
        focus: 'HIIT训练',
        exercises: [
          { name: '波比跳', sets: 6, reps: 30, rest: 30, type: 'hiit' },
          { name: '高抬腿', sets: 6, reps: 30, rest: 30, type: 'hiit' }
        ]
      },
      {
        day: '周二',
        focus: '力量训练',
        exercises: [
          { name: '徒手深蹲', sets: 3, reps: 15, rest: 60 },
          { name: '俯卧撑', sets: 3, reps: 10, rest: 60 },
          { name: '平板支撑', sets: 3, reps: 45, rest: 60 }
        ]
      },
      {
        day: '周三',
        focus: '有氧训练',
        exercises: [
          { name: '快走', sets: 1, reps: 1500, rest: 0, type: 'cardio' },
          { name: '登山者', sets: 3, reps: 30, rest: 60 },
          { name: '拉伸', rest: 0, type: 'stretch' }
        ]
      },
      {
        day: '周四',
        focus: '轻度循环',
        exercises: [
          { name: '轻度全身循环训练', sets: 1, reps: 1200, rest: 0, type: 'circuit' },
          { name: '柔韧性训练', sets: 1, reps: 900, rest: 0, type: 'flexibility' },
          { name: '深呼吸放松', sets: 1, reps: 300, rest: 0, type: 'breathing' }
        ]
      },
      {
        day: '周五',
        focus: '下肢训练',
        exercises: [
          { name: '徒手深蹲', sets: 3, reps: 15, rest: 60 },
          { name: '弓步蹲', sets: 3, reps: 10, rest: 60 },
          { name: '小腿提踵', sets: 3, reps: 20, rest: 60 }
        ]
      },
      {
        day: '周六',
        focus: '核心训练',
        exercises: [
          { name: '卷腹', sets: 3, reps: 20, rest: 45 },
          { name: '俄罗斯转体', sets: 3, reps: 20, rest: 45 },
          { name: '平板支撑', sets: 3, reps: 45, rest: 60 },
          { name: '死虫式', sets: 3, reps: 15, rest: 45 }
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
          { name: '慢跑', sets: 1, reps: 1800, rest: 0, type: 'cardio' },
          { name: '平板支撑', sets: 3, reps: 30, rest: 60 },
          { name: '深蹲', sets: 3, reps: 15, rest: 60 }
        ]
      },
      {
        day: '周三',
        focus: '力量耐力',
        exercises: [
          { name: '徒手深蹲', sets: 3, reps: 15, rest: 60 },
          { name: '俯卧撑', sets: 3, reps: 10, rest: 60 },
          { name: '平板支撑', sets: 3, reps: 30, rest: 60 },
          { name: '登山者', sets: 3, reps: 20, rest: 60 }
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
    ],
    [TRAINING_DAYS.FOUR_DAYS]: [
      {
        day: '周一',
        focus: '有氧提升',
        exercises: [
          { name: '间歇跑', sets: 1, reps: 1800, rest: 0, type: 'cardio' },
          { name: '核心训练', sets: 1, reps: 900, rest: 0, type: 'core' },
          { name: '动态恢复', sets: 1, reps: 600, rest: 0, type: 'recovery' }
        ]
      },
      {
        day: '周二',
        focus: '力量耐力',
        exercises: [
          { name: '全身循环训练', sets: 1, reps: 3000, rest: 0, type: 'circuit' },
          { name: '高次数重量训练', sets: 1, reps: 900, rest: 0, type: 'high-rep' },
          { name: '核心稳定', sets: 1, reps: 900, rest: 0, type: 'core' }
        ]
      },
      {
        day: '周四',
        focus: '有氧耐力',
        exercises: [
          { name: '长时间慢跑', sets: 1, reps: 3600, rest: 0, type: 'cardio' },
          { name: '力量耐力训练', sets: 1, reps: 1200, rest: 0, type: 'strength-endurance' },
          { name: '恢复训练', sets: 1, reps: 600, rest: 0, type: 'recovery' }
        ]
      },
      {
        day: '周六',
        focus: '综合耐力',
        exercises: [
          { name: '长时间混合训练', sets: 1, reps: 3000, rest: 0, type: 'mixed' },
          { name: '柔韧性和恢复训练', sets: 1, reps: 1200, rest: 0, type: 'flexibility' }
        ]
      }
    ],
    [TRAINING_DAYS.FIVE_DAYS]: [
      {
        day: '周一',
        focus: '心肺耐力',
        exercises: [
          { name: '连续跑步', sets: 1, reps: 2700, rest: 0, type: 'cardio' },
          { name: '变速跑间歇', sets: 1, reps: 900, rest: 0, type: 'interval' },
          { name: '拉伸', sets: 1, reps: 600, rest: 0, type: 'stretch' }
        ]
      },
      {
        day: '周二',
        focus: '力量耐力',
        exercises: [
          { name: '全身循环训练', sets: 1, reps: 3000, rest: 0, type: 'circuit' },
          { name: '高次数重量训练', sets: 1, reps: 900, rest: 0, type: 'high-rep' },
          { name: '核心稳定', sets: 1, reps: 900, rest: 0, type: 'core' }
        ]
      },
      {
        day: '周三',
        focus: '混合耐力',
        exercises: [
          { name: '游泳训练', sets: 1, reps: 1800, rest: 0, type: 'swimming' },
          { name: '自行车训练', sets: 1, reps: 1200, rest: 0, type: 'cycling' },
          { name: '恢复拉伸', sets: 1, reps: 600, rest: 0, type: 'stretch' }
        ]
      },
      {
        day: '周五',
        focus: '运动耐力',
        exercises: [
          { name: '间歇训练', sets: 1, reps: 2100, rest: 0, type: 'interval' },
          { name: '爆发力训练', sets: 1, reps: 900, rest: 0, type: 'explosive' },
          { name: '恢复训练', sets: 1, reps: 600, rest: 0, type: 'recovery' }
        ]
      },
      {
        day: '周六',
        focus: '综合耐力',
        exercises: [
          { name: '长时间混合训练', sets: 1, reps: 3600, rest: 0, type: 'mixed' },
          { name: '柔韧性和恢复训练', sets: 1, reps: 1200, rest: 0, type: 'flexibility' }
        ]
      }
    ],
    [TRAINING_DAYS.SIX_DAYS]: [
      {
        day: '周一',
        focus: '心肺耐力',
        exercises: [
          { name: '连续跑步', sets: 1, reps: 2700, rest: 0, type: 'cardio' },
          { name: '变速跑间歇', sets: 1, reps: 900, rest: 0, type: 'interval' },
          { name: '拉伸', sets: 1, reps: 600, rest: 0, type: 'stretch' }
        ]
      },
      {
        day: '周二',
        focus: '力量耐力',
        exercises: [
          { name: '全身循环训练', sets: 1, reps: 3000, rest: 0, type: 'circuit' },
          { name: '高次数重量训练', sets: 1, reps: 900, rest: 0, type: 'high-rep' },
          { name: '核心稳定', sets: 1, reps: 900, rest: 0, type: 'core' }
        ]
      },
      {
        day: '周三',
        focus: '水中训练',
        exercises: [
          { name: '游泳耐力训练', sets: 1, reps: 2400, rest: 0, type: 'swimming' },
          { name: '水中阻力训练', sets: 1, reps: 900, rest: 0, type: 'water-resistance' },
          { name: '恢复游泳', sets: 1, reps: 600, rest: 0, type: 'recovery-swim' }
        ]
      },
      {
        day: '周四',
        focus: '自行车耐力',
        exercises: [
          { name: '长距离骑行', sets: 1, reps: 3600, rest: 0, type: 'cycling' },
          { name: '爬坡训练', sets: 1, reps: 900, rest: 0, type: 'hill-climb' },
          { name: '腿部恢复', sets: 1, reps: 600, rest: 0, type: 'leg-recovery' }
        ]
      },
      {
        day: '周五',
        focus: '运动耐力',
        exercises: [
          { name: '间歇训练', sets: 1, reps: 2100, rest: 0, type: 'interval' },
          { name: '爆发力训练', sets: 1, reps: 900, rest: 0, type: 'explosive' },
          { name: '恢复训练', sets: 1, reps: 600, rest: 0, type: 'recovery' }
        ]
      },
      {
        day: '周六',
        focus: '综合耐力',
        exercises: [
          { name: '长时间混合训练', sets: 1, reps: 4200, rest: 0, type: 'mixed' },
          { name: '柔韧性和恢复训练', sets: 1, reps: 1500, rest: 0, type: 'flexibility' }
        ]
      }
    ]
  },
  [TRAINING_LEVELS.ADVANCED]: {
    [TRAINING_DAYS.THREE_DAYS]: [
      {
        day: '周一',
        focus: '极限耐力',
        exercises: [
          { name: '长距离跑步', sets: 1, reps: 3600, rest: 0, type: 'cardio' },
          { name: '核心耐力训练', sets: 1, reps: 1200, rest: 0, type: 'core-endurance' },
          { name: '恢复训练', sets: 1, reps: 900, rest: 0, type: 'recovery' }
        ]
      },
      {
        day: '周三',
        focus: '功能耐力',
        exercises: [
          { name: '混合功能训练', sets: 1, reps: 3600, rest: 0, type: 'functional' },
          { name: '高强度循环训练', sets: 1, reps: 1800, rest: 0, type: 'high-intensity-circuit' },
          { name: '专项耐力训练', sets: 1, reps: 1200, rest: 0, type: 'sport-specific' }
        ]
      },
      {
        day: '周五',
        focus: '竞技耐力',
        exercises: [
          { name: '竞技级耐力训练', sets: 1, reps: 4200, rest: 0, type: 'competitive' },
          { name: '专项技能训练', sets: 1, reps: 1200, rest: 0, type: 'skill' },
          { name: '恢复训练', sets: 1, reps: 900, rest: 0, type: 'recovery' }
        ]
      }
    ],
    [TRAINING_DAYS.FOUR_DAYS]: [
      {
        day: '周一',
        focus: '有氧极限',
        exercises: [
          { name: '极限有氧训练', sets: 1, reps: 4200, rest: 0, type: 'extreme-cardio' },
          { name: '心率控制训练', sets: 1, reps: 1200, rest: 0, type: 'heart-rate' },
          { name: '恢复拉伸', sets: 1, reps: 900, rest: 0, type: 'stretch' }
        ]
      },
      {
        day: '周二',
        focus: '力量耐力',
        exercises: [
          { name: '高强度力量耐力', sets: 1, reps: 3600, rest: 0, type: 'strength-endurance' },
          { name: '功能性训练', sets: 1, reps: 1200, rest: 0, type: 'functional' },
          { name: '核心稳定', sets: 1, reps: 1200, rest: 0, type: 'core' }
        ]
      },
      {
        day: '周四',
        focus: '速度耐力',
        exercises: [
          { name: '速度耐力训练', sets: 1, reps: 3000, rest: 0, type: 'speed-endurance' },
          { name: '间歇冲刺训练', sets: 1, reps: 1200, rest: 0, type: 'sprint-interval' },
          { name: '恢复训练', sets: 1, reps: 900, rest: 0, type: 'recovery' }
        ]
      },
      {
        day: '周六',
        focus: '综合挑战',
        exercises: [
          { name: '综合耐力挑战', sets: 1, reps: 4800, rest: 0, type: 'endurance-challenge' },
          { name: '多项目混合训练', sets: 1, reps: 1800, rest: 0, type: 'multi-sport' },
          { name: '深度恢复', sets: 1, reps: 1200, rest: 0, type: 'deep-recovery' }
        ]
      }
    ],
    [TRAINING_DAYS.FIVE_DAYS]: [
      {
        day: '周一',
        focus: '有氧极限',
        exercises: [
          { name: '极限有氧训练', sets: 1, reps: 4500, rest: 0, type: 'extreme-cardio' },
          { name: '心率控制训练', sets: 1, reps: 1200, rest: 0, type: 'heart-rate' },
          { name: '恢复拉伸', sets: 1, reps: 900, rest: 0, type: 'stretch' }
        ]
      },
      {
        day: '周二',
        focus: '力量耐力',
        exercises: [
          { name: '高强度力量耐力', sets: 1, reps: 3600, rest: 0, type: 'strength-endurance' },
          { name: '功能性训练', sets: 1, reps: 1200, rest: 0, type: 'functional' },
          { name: '核心稳定', sets: 1, reps: 1200, rest: 0, type: 'core' }
        ]
      },
      {
        day: '周三',
        focus: '专项耐力',
        exercises: [
          { name: '专项耐力训练', sets: 1, reps: 3000, rest: 0, type: 'sport-specific' },
          { name: '技能训练', sets: 1, reps: 1200, rest: 0, type: 'skill' },
          { name: '柔韧性训练', sets: 1, reps: 900, rest: 0, type: 'flexibility' }
        ]
      },
      {
        day: '周五',
        focus: '速度耐力',
        exercises: [
          { name: '速度耐力训练', sets: 1, reps: 3300, rest: 0, type: 'speed-endurance' },
          { name: '间歇冲刺训练', sets: 1, reps: 1200, rest: 0, type: 'sprint-interval' },
          { name: '恢复训练', sets: 1, reps: 900, rest: 0, type: 'recovery' }
        ]
      },
      {
        day: '周六',
        focus: '综合挑战',
        exercises: [
          { name: '综合耐力挑战', sets: 1, reps: 5400, rest: 0, type: 'endurance-challenge' },
          { name: '多项目混合训练', sets: 1, reps: 1800, rest: 0, type: 'multi-sport' },
          { name: '深度恢复', sets: 1, reps: 1200, rest: 0, type: 'deep-recovery' }
        ]
      }
    ],
    [TRAINING_DAYS.SIX_DAYS]: [
      {
        day: '周一',
        focus: '有氧极限',
        exercises: [
          { name: '极限有氧训练', sets: 1, reps: 4500, rest: 0, type: 'extreme-cardio' },
          { name: '心率控制训练', sets: 1, reps: 1200, rest: 0, type: 'heart-rate' },
          { name: '恢复拉伸', sets: 1, reps: 900, rest: 0, type: 'stretch' }
        ]
      },
      {
        day: '周二',
        focus: '力量耐力',
        exercises: [
          { name: '高强度力量耐力', sets: 1, reps: 3600, rest: 0, type: 'strength-endurance' },
          { name: '功能性训练', sets: 1, reps: 1200, rest: 0, type: 'functional' },
          { name: '核心稳定', sets: 1, reps: 1200, rest: 0, type: 'core' }
        ]
      },
      {
        day: '周三',
        focus: '水中极限',
        exercises: [
          { name: '极限游泳训练', sets: 1, reps: 3600, rest: 0, type: 'extreme-swimming' },
          { name: '水中耐力挑战', sets: 1, reps: 1500, rest: 0, type: 'water-endurance' },
          { name: '恢复游泳', sets: 1, reps: 900, rest: 0, type: 'recovery-swim' }
        ]
      },
      {
        day: '周四',
        focus: '自行车极限',
        exercises: [
          { name: '极限骑行训练', sets: 1, reps: 5400, rest: 0, type: 'extreme-cycling' },
          { name: '爬坡耐力挑战', sets: 1, reps: 1800, rest: 0, type: 'hill-endurance' },
          { name: '腿部恢复', sets: 1, reps: 900, rest: 0, type: 'leg-recovery' }
        ]
      },
      {
        day: '周五',
        focus: '速度耐力',
        exercises: [
          { name: '速度耐力训练', sets: 1, reps: 3300, rest: 0, type: 'speed-endurance' },
          { name: '间歇冲刺训练', sets: 1, reps: 1200, rest: 0, type: 'sprint-interval' },
          { name: '恢复训练', sets: 1, reps: 900, rest: 0, type: 'recovery' }
        ]
      },
      {
        day: '周六',
        focus: '综合挑战',
        exercises: [
          { name: '综合耐力挑战', sets: 1, reps: 6000, rest: 0, type: 'endurance-challenge' },
          { name: '多项目混合训练', sets: 1, reps: 2400, rest: 0, type: 'multi-sport' },
          { name: '深度恢复', sets: 1, reps: 1800, rest: 0, type: 'deep-recovery' }
        ]
      }
    ]
  }
};

// 力量训练计划模板
export const STRENGTH_PLANS = {
  [TRAINING_LEVELS.BEGINNER]: {
    [TRAINING_DAYS.THREE_DAYS]: [
      {
        day: '周一',
        focus: '基础力量',
        exercises: [
          { name: '杠铃深蹲', sets: 3, reps: 8, rest: 180 },
          { name: '俯卧撑', sets: 3, reps: 10, rest: 120 },
          { name: '哑铃划船', sets: 3, reps: 10, rest: 120 },
          { name: '平板支撑', sets: 3, reps: 30, rest: 90 }
        ]
      },
      {
        day: '周三',
        focus: '复合动作',
        exercises: [
          { name: '硬拉', sets: 3, reps: 6, rest: 240 },
          { name: '哑铃卧推', sets: 3, reps: 10, rest: 120 },
          { name: '引体向上', sets: 3, reps: 5, rest: 150 },
          { name: '杠铃弯举', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周五',
        focus: '功能性力量',
        exercises: [
          { name: '杠铃肩推', sets: 3, reps: 8, rest: 120 },
          { name: '保加利亚深蹲', sets: 3, reps: 8, rest: 90 },
          { name: '三头肌下压', sets: 3, reps: 12, rest: 90 },
          { name: '腿举', sets: 3, reps: 15, rest: 90 }
        ]
      }
    ]
  },
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
    ],
    [TRAINING_DAYS.FOUR_DAYS]: [
      {
        day: '周一',
        focus: '深蹲变式',
        exercises: [
          { name: '杠铃深蹲', sets: 5, reps: 5, rest: 300 },
          { name: '前蹲', sets: 4, reps: 6, rest: 240 },
          { name: '保加利亚深蹲', sets: 3, reps: 8, rest: 120 },
          { name: '腿举', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周二',
        focus: '卧推变式',
        exercises: [
          { name: '杠铃卧推', sets: 5, reps: 5, rest: 300 },
          { name: '上斜卧推', sets: 4, reps: 6, rest: 240 },
          { name: '哑铃飞鸟', sets: 3, reps: 10, rest: 120 },
          { name: '双杠臂屈伸', sets: 3, reps: 8, rest: 120 }
        ]
      },
      {
        day: '周四',
        focus: '硬拉变式',
        exercises: [
          { name: '硬拉', sets: 5, reps: 5, rest: 300 },
          { name: '罗马尼亚硬拉', sets: 4, reps: 6, rest: 240 },
          { name: '杠铃划船', sets: 3, reps: 8, rest: 150 },
          { name: '引体向上', sets: 3, reps: 8, rest: 150 }
        ]
      },
      {
        day: '周六',
        focus: '肩推变式',
        exercises: [
          { name: '杠铃肩推', sets: 5, reps: 5, rest: 300 },
          { name: '哑铃肩推', sets: 4, reps: 8, rest: 180 },
          { name: '侧平举', sets: 3, reps: 12, rest: 90 },
          { name: '三头肌下压', sets: 3, reps: 10, rest: 90 }
        ]
      }
    ],
    [TRAINING_DAYS.FIVE_DAYS]: [
      {
        day: '周一',
        focus: '深蹲专项',
        exercises: [
          { name: '杠铃深蹲', sets: 6, reps: 3, rest: 300 },
          { name: '前蹲', sets: 4, reps: 5, rest: 240 },
          { name: '保加利亚深蹲', sets: 3, reps: 8, rest: 120 },
          { name: '腿举', sets: 3, reps: 15, rest: 90 }
        ]
      },
      {
        day: '周二',
        focus: '卧推专项',
        exercises: [
          { name: '杠铃卧推', sets: 6, reps: 3, rest: 300 },
          { name: '上斜卧推', sets: 4, reps: 5, rest: 240 },
          { name: '哑铃飞鸟', sets: 3, reps: 10, rest: 120 },
          { name: '三头肌下压', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周三',
        focus: '硬拉专项',
        exercises: [
          { name: '硬拉', sets: 6, reps: 3, rest: 300 },
          { name: '罗马尼亚硬拉', sets: 4, reps: 5, rest: 240 },
          { name: '杠铃划船', sets: 3, reps: 8, rest: 150 },
          { name: '杠铃弯举', sets: 3, reps: 10, rest: 90 }
        ]
      },
      {
        day: '周五',
        focus: '肩推专项',
        exercises: [
          { name: '杠铃肩推', sets: 6, reps: 3, rest: 300 },
          { name: '哑铃肩推', sets: 4, reps: 6, rest: 240 },
          { name: '侧平举', sets: 3, reps: 12, rest: 90 },
          { name: '前平举', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周六',
        focus: '辅助训练',
        exercises: [
          { name: '引体向上', sets: 4, reps: 8, rest: 150 },
          { name: '双杠臂屈伸', sets: 3, reps: 10, rest: 120 },
          { name: '腿弯举', sets: 3, reps: 12, rest: 90 },
          { name: '腿屈伸', sets: 3, reps: 12, rest: 90 }
        ]
      }
    ]
  },
  [TRAINING_LEVELS.ADVANCED]: {
    [TRAINING_DAYS.THREE_DAYS]: [
      {
        day: '周一',
        focus: '最大力量日',
        exercises: [
          { name: '杠铃深蹲', sets: 7, reps: 2, rest: 360 },
          { name: '杠铃卧推', sets: 5, reps: 3, rest: 300 },
          { name: '杠铃划船', sets: 4, reps: 5, rest: 180 },
          { name: '双杠臂屈伸', sets: 3, reps: 8, rest: 120 }
        ]
      },
      {
        day: '周三',
        focus: '爆发力量日',
        exercises: [
          { name: '硬拉', sets: 7, reps: 2, rest: 360 },
          { name: '杠铃肩推', sets: 5, reps: 3, rest: 300 },
          { name: '引体向上', sets: 4, reps: 6, rest: 180 },
          { name: '前蹲', sets: 3, reps: 5, rest: 240 }
        ]
      },
      {
        day: '周五',
        focus: '力量耐力日',
        exercises: [
          { name: '杠铃深蹲', sets: 5, reps: 8, rest: 180 },
          { name: '杠铃卧推', sets: 4, reps: 10, rest: 150 },
          { name: '硬拉', sets: 4, reps: 6, rest: 240 },
          { name: '杠铃肩推', sets: 3, reps: 8, rest: 150 }
        ]
      }
    ],
    [TRAINING_DAYS.FOUR_DAYS]: [
      {
        day: '周一',
        focus: '深蹲极限',
        exercises: [
          { name: '杠铃深蹲', sets: 8, reps: 1, rest: 420 },
          { name: '前蹲', sets: 5, reps: 3, rest: 300 },
          { name: '保加利亚深蹲', sets: 3, reps: 6, rest: 120 },
          { name: '腿举', sets: 3, reps: 20, rest: 90 }
        ]
      },
      {
        day: '周二',
        focus: '卧推极限',
        exercises: [
          { name: '杠铃卧推', sets: 8, reps: 1, rest: 420 },
          { name: '上斜卧推', sets: 5, reps: 3, rest: 300 },
          { name: '双杠臂屈伸', sets: 3, reps: 8, rest: 150 },
          { name: '三头肌下压', sets: 3, reps: 15, rest: 90 }
        ]
      },
      {
        day: '周四',
        focus: '硬拉极限',
        exercises: [
          { name: '硬拉', sets: 8, reps: 1, rest: 420 },
          { name: '罗马尼亚硬拉', sets: 5, reps: 3, rest: 300 },
          { name: '杠铃划船', sets: 4, reps: 5, rest: 180 },
          { name: '引体向上', sets: 3, reps: 10, rest: 150 }
        ]
      },
      {
        day: '周六',
        focus: '肩推极限',
        exercises: [
          { name: '杠铃肩推', sets: 8, reps: 1, rest: 420 },
          { name: '哑铃肩推', sets:  5, reps: 3, rest: 300 },
          { name: '侧平举', sets: 4, reps: 15, rest: 90 },
          { name: '杠铃弯举', sets: 3, reps: 8, rest: 120 }
        ]
      }
    ],
    [TRAINING_DAYS.FIVE_DAYS]: [
      {
        day: '周一',
        focus: '深蹲极限',
        exercises: [
          { name: '杠铃深蹲', sets: 10, reps: 1, rest: 480 },
          { name: '前蹲', sets: 5, reps: 2, rest: 360 },
          { name: '保加利亚深蹲', sets: 3, reps: 5, rest: 120 }
        ]
      },
      {
        day: '周二',
        focus: '卧推极限',
        exercises: [
          { name: '杠铃卧推', sets: 10, reps: 1, rest: 480 },
          { name: '上斜卧推', sets: 5, reps: 2, rest: 360 },
          { name: '双杠臂屈伸', sets: 3, reps: 6, rest: 150 }
        ]
      },
      {
        day: '周三',
        focus: '硬拉极限',
        exercises: [
          { name: '硬拉', sets: 10, reps: 1, rest: 480 },
          { name: '罗马尼亚硬拉', sets: 5, reps: 2, rest: 360 },
          { name: '杠铃划船', sets: 3, reps: 5, rest: 180 }
        ]
      },
      {
        day: '周五',
        focus: '肩推极限',
        exercises: [
          { name: '杠铃肩推', sets: 10, reps: 1, rest: 480 },
          { name: '哑铃肩推', sets: 5, reps: 2, rest: 360 },
          { name: '侧平举', sets: 3, reps: 12, rest: 90 }
        ]
      },
      {
        day: '周六',
        focus: '辅助极限',
        exercises: [
          { name: '引体向上', sets: 5, reps: 5, rest: 180 },
          { name: '杠铃弯举', sets: 4, reps: 6, rest: 120 },
          { name: '三头肌下压', sets: 4, reps: 8, rest: 90 },
          { name: '腿举', sets: 3, reps: 25, rest: 90 }
        ]
      }
    ],
    [TRAINING_DAYS.SIX_DAYS]: [
      {
        day: '周一',
        focus: '深蹲专项',
        exercises: [
          { name: '杠铃深蹲', sets: 10, reps: 1, rest: 480 },
          { name: '前蹲', sets: 5, reps: 2, rest: 360 },
          { name: '箱式深蹲', sets: 3, reps: 3, rest: 240 }
        ]
      },
      {
        day: '周二',
        focus: '卧推专项',
        exercises: [
          { name: '杠铃卧推', sets: 10, reps: 1, rest: 480 },
          { name: '上斜卧推', sets: 5, reps: 2, rest: 360 },
          { name: '窄距卧推', sets: 3, reps: 3, rest: 240 }
        ]
      },
      {
        day: '周三',
        focus: '硬拉专项',
        exercises: [
          { name: '硬拉', sets: 10, reps: 1, rest: 480 },
          { name: '相扑硬拉', sets: 5, reps: 2, rest: 360 },
          { name: '罗马尼亚硬拉', sets: 3, reps: 3, rest: 240 }
        ]
      },
      {
        day: '周四',
        focus: '肩推专项',
        exercises: [
          { name: '杠铃肩推', sets: 10, reps: 1, rest: 480 },
          { name: '哑铃肩推', sets: 5, reps: 2, rest: 360 },
          { name: '推举', sets: 3, reps: 3, rest: 240 }
        ]
      },
      {
        day: '周五',
        focus: '拉力专项',
        exercises: [
          { name: '引体向上', sets: 6, reps: 3, rest: 240 },
          { name: '杠铃划船', sets: 5, reps: 3, rest: 180 },
          { name: '哑铃划船', sets: 3, reps: 5, rest: 120 },
          { name: '杠铃弯举', sets: 3, reps: 6, rest: 90 }
        ]
      },
      {
        day: '周六',
        focus: '辅助力量',
        exercises: [
          { name: '双杠臂屈伸', sets: 4, reps: 5, rest: 150 },
          { name: '三头肌下压', sets: 4, reps: 8, rest: 90 },
          { name: '腿举', sets: 4, reps: 20, rest: 90 },
          { name: '腿弯举', sets: 3, reps: 15, rest: 90 }
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
