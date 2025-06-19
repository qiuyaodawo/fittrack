const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 数据库路径
const dbPath = path.join(__dirname, 'fittrack.db');
const db = new sqlite3.Database(dbPath);

// 密码哈希函数
function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'fittrack_salt').digest('hex');
}

// 生成日期字符串
function getDateString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

// 演示数据
const DEMO_USER = {
    id: 'demo-user-2024',
    email: 'demo@fittrack.com',
    password: hashPassword('demo123'),
    name: '演示用户',
    avatar: null
};

// 体重数据 - 过去3周的减重过程
const WEIGHT_DATA = [
    { weight: 70.2, date: getDateString(21), timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000 },
    { weight: 70.0, date: getDateString(19), timestamp: Date.now() - 19 * 24 * 60 * 60 * 1000 },
    { weight: 69.8, date: getDateString(17), timestamp: Date.now() - 17 * 24 * 60 * 60 * 1000 },
    { weight: 69.5, date: getDateString(14), timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000 },
    { weight: 69.3, date: getDateString(12), timestamp: Date.now() - 12 * 24 * 60 * 60 * 1000 },
    { weight: 69.1, date: getDateString(10), timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
    { weight: 68.9, date: getDateString(7), timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    { weight: 68.7, date: getDateString(5), timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { weight: 68.5, date: getDateString(3), timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { weight: 68.3, date: getDateString(1), timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
    { weight: 68.2, date: getDateString(0), timestamp: Date.now() }
];

// 个人记录数据
const PERSONAL_RECORDS = {
    '杠铃卧推': { weight: 85, date: getDateString(3) },
    '杠铃深蹲': { weight: 120, date: getDateString(5) },
    '硬拉': { weight: 140, date: getDateString(2) },
    '杠铃划船': { weight: 75, date: getDateString(4) },
    '哑铃肩推': { weight: 30, date: getDateString(6) },
    '哑铃弯举': { weight: 20, date: getDateString(7) },
    '引体向上': { weight: 15, date: getDateString(8) },
    '三头肌下压': { weight: 45, date: getDateString(9) }
};

// 训练记录数据
const WORKOUT_HISTORY = [
    {
        id: uuidv4(),
        date: getDateString(1),
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        exercises: [
            {
                name: '杠铃卧推',
                sets: [
                    { reps: 12, weight: 60, rest: 90 },
                    { reps: 10, weight: 70, rest: 90 },
                    { reps: 8, weight: 80, rest: 120 },
                    { reps: 6, weight: 85, rest: 120 }
                ]
            },
            {
                name: '上斜卧推',
                sets: [
                    { reps: 12, weight: 50, rest: 90 },
                    { reps: 10, weight: 60, rest: 90 },
                    { reps: 8, weight: 65, rest: 90 }
                ]
            },
            {
                name: '哑铃飞鸟',
                sets: [
                    { reps: 15, weight: 15, rest: 60 },
                    { reps: 12, weight: 17.5, rest: 60 },
                    { reps: 10, weight: 20, rest: 60 }
                ]
            },
            {
                name: '双杠臂屈伸',
                sets: [
                    { reps: 12, weight: 0, rest: 60 },
                    { reps: 10, weight: 5, rest: 60 },
                    { reps: 8, weight: 10, rest: 60 }
                ]
            }
        ],
        notes: '胸部训练日，感觉状态不错，卧推创新高！',
        bodyParts: ['胸部']
    },
    {
        id: uuidv4(),
        date: getDateString(3),
        startTime: '18:30',
        endTime: '20:00',
        duration: 90,
        exercises: [
            {
                name: '杠铃深蹲',
                sets: [
                    { reps: 15, weight: 80, rest: 120 },
                    { reps: 12, weight: 100, rest: 120 },
                    { reps: 10, weight: 110, rest: 150 },
                    { reps: 8, weight: 120, rest: 150 }
                ]
            },
            {
                name: '罗马尼亚硬拉',
                sets: [
                    { reps: 12, weight: 80, rest: 90 },
                    { reps: 10, weight: 90, rest: 90 },
                    { reps: 8, weight: 100, rest: 90 }
                ]
            },
            {
                name: '保加利亚深蹲',
                sets: [
                    { reps: 12, weight: 20, rest: 60 },
                    { reps: 10, weight: 25, rest: 60 },
                    { reps: 8, weight: 30, rest: 60 }
                ]
            }
        ],
        notes: '腿部训练，深蹲感觉很棒',
        bodyParts: ['腿部']
    },
    {
        id: uuidv4(),
        date: getDateString(5),
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        exercises: [
            {
                name: '引体向上',
                sets: [
                    { reps: 8, weight: 0, rest: 90 },
                    { reps: 6, weight: 5, rest: 90 },
                    { reps: 5, weight: 10, rest: 120 },
                    { reps: 4, weight: 15, rest: 120 }
                ]
            },
            {
                name: '杠铃划船',
                sets: [
                    { reps: 12, weight: 60, rest: 90 },
                    { reps: 10, weight: 70, rest: 90 },
                    { reps: 8, weight: 75, rest: 90 }
                ]
            },
            {
                name: '高位下拉',
                sets: [
                    { reps: 12, weight: 50, rest: 60 },
                    { reps: 10, weight: 55, rest: 60 },
                    { reps: 8, weight: 60, rest: 60 }
                ]
            },
            {
                name: '面拉',
                sets: [
                    { reps: 15, weight: 25, rest: 60 },
                    { reps: 12, weight: 30, rest: 60 },
                    { reps: 10, weight: 35, rest: 60 }
                ]
            }
        ],
        notes: '背部训练日，引体向上有进步',
        bodyParts: ['背部']
    },
    {
        id: uuidv4(),
        date: getDateString(7),
        startTime: '19:00',
        endTime: '20:15',
        duration: 75,
        exercises: [
            {
                name: '哑铃肩推',
                sets: [
                    { reps: 12, weight: 20, rest: 90 },
                    { reps: 10, weight: 25, rest: 90 },
                    { reps: 8, weight: 30, rest: 90 }
                ]
            },
            {
                name: '侧平举',
                sets: [
                    { reps: 15, weight: 10, rest: 60 },
                    { reps: 12, weight: 12.5, rest: 60 },
                    { reps: 10, weight: 15, rest: 60 }
                ]
            },
            {
                name: '前平举',
                sets: [
                    { reps: 12, weight: 10, rest: 60 },
                    { reps: 10, weight: 12.5, rest: 60 },
                    { reps: 8, weight: 15, rest: 60 }
                ]
            },
            {
                name: '哑铃弯举',
                sets: [
                    { reps: 12, weight: 15, rest: 60 },
                    { reps: 10, weight: 17.5, rest: 60 },
                    { reps: 8, weight: 20, rest: 60 }
                ]
            },
            {
                name: '三头肌下压',
                sets: [
                    { reps: 12, weight: 35, rest: 60 },
                    { reps: 10, weight: 40, rest: 60 },
                    { reps: 8, weight: 45, rest: 60 }
                ]
            }
        ],
        notes: '肩部和手臂训练，感觉肩膀更稳定了',
        bodyParts: ['肩部', '手臂']
    },
    {
        id: uuidv4(),
        date: getDateString(9),
        startTime: '08:30',
        endTime: '10:00',
        duration: 90,
        exercises: [
            {
                name: '硬拉',
                sets: [
                    { reps: 8, weight: 100, rest: 150 },
                    { reps: 6, weight: 120, rest: 150 },
                    { reps: 5, weight: 130, rest: 180 },
                    { reps: 3, weight: 140, rest: 180 }
                ]
            },
            {
                name: '杠铃卧推',
                sets: [
                    { reps: 10, weight: 70, rest: 120 },
                    { reps: 8, weight: 75, rest: 120 },
                    { reps: 6, weight: 80, rest: 120 }
                ]
            },
            {
                name: '杠铃深蹲',
                sets: [
                    { reps: 10, weight: 90, rest: 120 },
                    { reps: 8, weight: 100, rest: 120 },
                    { reps: 6, weight: 110, rest: 120 }
                ]
            }
        ],
        notes: '复合动作训练日，硬拉创新高！',
        bodyParts: ['背部', '腿部', '胸部']
    }
];

// 健身计划数据
const PLANS_DATA = [
    {
        id: uuidv4(),
        title: '新手入门计划',
        description: '适合健身新手的全身训练计划，每周3次训练',
        duration: '4周',
        difficulty: '初级',
        targetMuscles: ['全身'],
        exercises: [
            { name: '杠铃深蹲', sets: 3, reps: '8-12', weight: '', rest: 90 },
            { name: '杠铃卧推', sets: 3, reps: '8-12', weight: '', rest: 90 },
            { name: '杠铃划船', sets: 3, reps: '8-12', weight: '', rest: 90 },
            { name: '哑铃肩推', sets: 3, reps: '10-15', weight: '', rest: 60 },
            { name: '平板支撑', sets: 3, reps: '30-60秒', weight: '', rest: 60 }
        ],
        createdAt: getDateString(14),
        isActive: true
    },
    {
        id: uuidv4(),
        title: '胸部专项训练',
        description: '专注胸部肌群发展的高强度训练计划',
        duration: '6周',
        difficulty: '中级',
        targetMuscles: ['胸部'],
        exercises: [
            { name: '杠铃卧推', sets: 4, reps: '6-8', weight: '', rest: 120 },
            { name: '上斜卧推', sets: 3, reps: '8-10', weight: '', rest: 90 },
            { name: '下斜卧推', sets: 3, reps: '8-10', weight: '', rest: 90 },
            { name: '哑铃飞鸟', sets: 3, reps: '12-15', weight: '', rest: 60 },
            { name: '双杠臂屈伸', sets: 3, reps: '8-12', weight: '', rest: 90 }
        ],
        createdAt: getDateString(10),
        isActive: false
    },
    {
        id: uuidv4(),
        title: '力量提升计划',
        description: '专注于提升三大项力量的训练计划',
        duration: '8周',
        difficulty: '高级',
        targetMuscles: ['全身'],
        exercises: [
            { name: '杠铃深蹲', sets: 5, reps: '3-5', weight: '', rest: 180 },
            { name: '杠铃卧推', sets: 5, reps: '3-5', weight: '', rest: 180 },
            { name: '硬拉', sets: 5, reps: '1-3', weight: '', rest: 240 },
            { name: '杠铃划船', sets: 4, reps: '5-8', weight: '', rest: 120 }
        ],
        createdAt: getDateString(7),
        isActive: true
    }
];

// 每日计划数据
const DAILY_PLANS = [
    {
        date: getDateString(0), // 今天
        exercises: [
            { name: '杠铃卧推', sets: 4, reps: '6-8', weight: '80' },
            { name: '上斜卧推', sets: 3, reps: '8-10', weight: '65' },
            { name: '哑铃飞鸟', sets: 3, reps: '12-15', weight: '17.5' },
            { name: '双杠臂屈伸', sets: 3, reps: '8-12', weight: '10' }
        ],
        restDay: false,
        completed: false
    },
    {
        date: getDateString(-1), // 明天
        exercises: [
            { name: '杠铃深蹲', sets: 4, reps: '8-10', weight: '100' },
            { name: '罗马尼亚硬拉', sets: 3, reps: '10-12', weight: '90' },
            { name: '保加利亚深蹲', sets: 3, reps: '12-15', weight: '25' }
        ],
        restDay: false,
        completed: false
    },
    {
        date: getDateString(-2), // 后天
        restDay: true,
        completed: false
    }
];

console.log('开始初始化演示数据...');

// 首先检查演示用户是否已存在
db.get('SELECT id FROM users WHERE email = ?', [DEMO_USER.email], (err, row) => {
    if (err) {
        console.error('检查用户失败:', err);
        process.exit(1);
    }

    if (row) {
        console.log('⚠️  演示用户已存在，将更新演示数据...');
    } else {
        console.log('📝 首次创建演示用户和数据...');
    }

    // 继续执行数据初始化
    initializeData();
});

function initializeData() {
db.serialize(() => {
    // 1. 创建演示用户
    console.log('创建演示用户...');
    db.run(
        `INSERT OR REPLACE INTO users (id, email, password, name, avatar, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [DEMO_USER.id, DEMO_USER.email, DEMO_USER.password, DEMO_USER.name, DEMO_USER.avatar],
        function(err) {
            if (err) {
                console.error('创建用户失败:', err);
            } else {
                console.log('✅ 演示用户创建成功');
            }
        }
    );

    // 2. 插入体重数据
    console.log('插入体重数据...');
    db.run(
        `INSERT OR REPLACE INTO user_data (id, user_id, data_type, data_content, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [`${DEMO_USER.id}_body_weight`, DEMO_USER.id, 'body_weight', JSON.stringify(WEIGHT_DATA)],
        function(err) {
            if (err) {
                console.error('插入体重数据失败:', err);
            } else {
                console.log('✅ 体重数据插入成功');
            }
        }
    );

    // 3. 插入个人记录数据
    console.log('插入个人记录数据...');
    db.run(
        `INSERT OR REPLACE INTO user_data (id, user_id, data_type, data_content, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [`${DEMO_USER.id}_personal_records`, DEMO_USER.id, 'personal_records', JSON.stringify(PERSONAL_RECORDS)],
        function(err) {
            if (err) {
                console.error('插入个人记录数据失败:', err);
            } else {
                console.log('✅ 个人记录数据插入成功');
            }
        }
    );

    // 4. 插入训练记录数据
    console.log('插入训练记录数据...');
    db.run(
        `INSERT OR REPLACE INTO user_data (id, user_id, data_type, data_content, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [`${DEMO_USER.id}_workout_history`, DEMO_USER.id, 'workout_history', JSON.stringify(WORKOUT_HISTORY)],
        function(err) {
            if (err) {
                console.error('插入训练记录数据失败:', err);
            } else {
                console.log('✅ 训练记录数据插入成功');
            }
        }
    );

    // 5. 插入健身计划数据
    console.log('插入健身计划数据...');
    db.run(
        `INSERT OR REPLACE INTO user_data (id, user_id, data_type, data_content, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [`${DEMO_USER.id}_plans`, DEMO_USER.id, 'plans', JSON.stringify(PLANS_DATA)],
        function(err) {
            if (err) {
                console.error('插入健身计划数据失败:', err);
            } else {
                console.log('✅ 健身计划数据插入成功');
            }
        }
    );

    // 6. 插入每日计划数据
    console.log('插入每日计划数据...');
    db.run(
        `INSERT OR REPLACE INTO user_data (id, user_id, data_type, data_content, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [`${DEMO_USER.id}_daily_plans`, DEMO_USER.id, 'daily_plans', JSON.stringify(DAILY_PLANS)],
        function(err) {
            if (err) {
                console.error('插入每日计划数据失败:', err);
            } else {
                console.log('✅ 每日计划数据插入成功');
                console.log('\n🎉 演示数据初始化完成！');
                console.log('\n📋 演示账号信息：');
                console.log('   邮箱: demo@fittrack.com');
                console.log('   密码: demo123');
                console.log('\n📊 已创建的演示数据：');
                console.log('   ✅ 体重记录: 11条记录（过去3周减重趋势）');
                console.log('   ✅ 训练记录: 5次完整训练');
                console.log('   ✅ 个人记录: 8个动作的最大重量');
                console.log('   ✅ 健身计划: 3个不同难度的计划');
                console.log('   ✅ 每日计划: 未来3天的训练安排');
                console.log('\n🚀 现在可以使用演示账号登录体验完整功能！');

                // 关闭数据库连接
                db.close((err) => {
                    if (err) {
                        console.error('关闭数据库连接失败:', err);
                    } else {
                        console.log('✅ 数据库连接已关闭');
                    }
                });
            }
        }
    );
});
}
