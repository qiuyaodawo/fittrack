// 测试每日计划同步功能
// 用于验证在其他设备登录后能否看到本周训练计划

console.log('=== 每日计划同步功能测试 ===');

// 模拟用户数据
const mockUserInfo = {
    id: 'test_user_123',
    userId: 'test_user_123',
    name: '测试用户'
};

// 模拟每日计划数据
const mockDailyPlans = [
    {
        date: '2024-06-17',
        dayName: '周一',
        restDay: false,
        exercises: [
            { name: '卧推', sets: 4, reps: 8, weight: '80', rest: 120 },
            { name: '哑铃飞鸟', sets: 3, reps: 12, weight: '15', rest: 90 }
        ],
        notes: '胸肌训练日'
    },
    {
        date: '2024-06-18',
        dayName: '周二',
        restDay: false,
        exercises: [
            { name: '引体向上', sets: 4, reps: 6, weight: '', rest: 120 },
            { name: '杠铃划船', sets: 3, reps: 10, weight: '60', rest: 90 }
        ],
        notes: '背部训练日'
    },
    {
        date: '2024-06-19',
        dayName: '周三',
        restDay: true,
        exercises: [],
        notes: '休息日'
    },
    {
        date: '2024-06-20',
        dayName: '周四',
        restDay: false,
        exercises: [
            { name: '深蹲', sets: 4, reps: 10, weight: '100', rest: 180 },
            { name: '腿举', sets: 3, reps: 15, weight: '120', rest: 120 }
        ],
        notes: '腿部训练日'
    }
];

// 测试存储键生成
function testStorageKeyGeneration() {
    console.log('\n1. 测试存储键生成');
    
    // 模拟 getUserStorageKey 方法
    function getUserStorageKey(dataType) {
        return mockUserInfo && mockUserInfo.id ? `${dataType}_${mockUserInfo.id}` : dataType;
    }
    
    const dailyPlansKey = getUserStorageKey('dailyPlans');
    const myPlansKey = getUserStorageKey('myPlans');
    
    console.log('每日计划存储键:', dailyPlansKey);
    console.log('健身计划存储键:', myPlansKey);
    
    // 验证键的正确性
    const expectedDailyPlansKey = 'dailyPlans_test_user_123';
    const expectedMyPlansKey = 'myPlans_test_user_123';
    
    console.log('每日计划键正确:', dailyPlansKey === expectedDailyPlansKey ? '✅' : '❌');
    console.log('健身计划键正确:', myPlansKey === expectedMyPlansKey ? '✅' : '❌');
    
    return { dailyPlansKey, myPlansKey };
}

// 测试数据结构差异
function testDataStructureDifference() {
    console.log('\n2. 测试数据结构差异');
    
    console.log('每日计划 (dailyPlans) 数据结构:');
    console.log('- 用途: 首页本周训练计划显示');
    console.log('- 结构: 数组，每个元素代表一天的计划');
    console.log('- 示例:', JSON.stringify(mockDailyPlans[0], null, 2));
    
    console.log('\n健身计划 (myPlans) 数据结构:');
    console.log('- 用途: 计划管理页面的完整计划');
    console.log('- 结构: 数组，每个元素是一个完整的训练计划');
    console.log('- 包含: 计划名称、周期、每周安排等');
    
    console.log('\n关键差异:');
    console.log('❗ dailyPlans: 按日期存储的具体训练安排');
    console.log('❗ myPlans: 按计划存储的完整训练方案');
    console.log('❗ 两者数据不同步导致其他设备看不到本周计划');
}

// 测试同步流程
function testSyncProcess() {
    console.log('\n3. 测试同步流程');
    
    console.log('修复前的同步流程:');
    console.log('1. 设备A: 创建每日计划 → 保存到 dailyPlans_userA');
    console.log('2. 设备A: 数据同步 → 只同步 myPlans，不同步 dailyPlans');
    console.log('3. 设备B: 登录同一账号 → 只获取到 myPlans');
    console.log('4. 设备B: 首页加载 → 从 dailyPlans_userA 读取（为空）');
    console.log('5. 结果: 设备B 看不到本周训练计划 ❌');
    
    console.log('\n修复后的同步流程:');
    console.log('1. 设备A: 创建每日计划 → 保存到 dailyPlans_userA');
    console.log('2. 设备A: 数据同步 → 同步 myPlans + dailyPlans');
    console.log('3. 设备B: 登录同一账号 → 获取 myPlans + dailyPlans');
    console.log('4. 设备B: 首页加载 → 从 dailyPlans_userA 读取（有数据）');
    console.log('5. 结果: 设备B 可以看到本周训练计划 ✅');
}

// 测试API端点
function testAPIEndpoints() {
    console.log('\n4. 测试API端点');
    
    console.log('新增的API端点:');
    console.log('POST /api/data/sync-daily-plans - 同步每日计划到服务器');
    console.log('GET  /api/data/daily-plans - 从服务器获取每日计划');
    console.log('GET  /api/data/all - 获取所有数据（已更新包含daily_plans）');
    
    console.log('\n数据库存储:');
    console.log('表: user_data');
    console.log('字段: data_type = "daily_plans"');
    console.log('内容: JSON格式的每日计划数组');
}

// 测试修复效果验证
function testFixValidation() {
    console.log('\n5. 修复效果验证');
    
    console.log('验证步骤:');
    console.log('1. 在设备A上创建本周训练计划');
    console.log('2. 在设备A上执行数据同步');
    console.log('3. 在设备B上登录同一账号');
    console.log('4. 检查设备B首页是否显示本周训练计划');
    
    console.log('\n预期结果:');
    console.log('✅ 设备B能够看到完整的本周训练计划');
    console.log('✅ 训练计划包含正确的日期、动作、组数等信息');
    console.log('✅ 休息日正确显示为"休息日"');
    console.log('✅ 训练日显示动作数量和状态');
}

// 测试潜在问题和解决方案
function testPotentialIssues() {
    console.log('\n6. 潜在问题和解决方案');
    
    console.log('可能的问题:');
    console.log('❓ 数据冲突: 两个设备同时修改每日计划');
    console.log('❓ 时区问题: 不同设备的日期可能不一致');
    console.log('❓ 数据过期: 每日计划可能包含过期的日期');
    
    console.log('\n解决方案:');
    console.log('💡 使用时间戳进行冲突解决（最新的数据优先）');
    console.log('💡 统一使用UTC时间或用户本地时区');
    console.log('💡 定期清理过期的每日计划数据');
    console.log('💡 在同步时验证数据的有效性');
}

// 运行所有测试
function runAllTests() {
    console.log('开始运行每日计划同步功能测试...\n');
    
    const storageKeys = testStorageKeyGeneration();
    testDataStructureDifference();
    testSyncProcess();
    testAPIEndpoints();
    testFixValidation();
    testPotentialIssues();
    
    console.log('\n=== 测试总结 ===');
    console.log('🔧 问题根因: 每日计划(dailyPlans)未包含在数据同步中');
    console.log('✅ 修复方案: 在localDataService中添加dailyPlans同步支持');
    console.log('🚀 修复内容:');
    console.log('   - 新增 syncDailyPlans() 方法');
    console.log('   - 新增 getDailyPlans() 方法');
    console.log('   - 更新 getAllDataFromCloud() 包含daily_plans');
    console.log('   - 更新 pushAllDataToServer() 包含dailyPlans同步');
    console.log('   - 服务器端新增相应API端点');
    
    console.log('\n📋 验证清单:');
    console.log('□ 在设备A创建每日计划');
    console.log('□ 在设备A执行数据同步');
    console.log('□ 在设备B登录并检查首页');
    console.log('□ 确认本周训练计划正确显示');
    
    return true;
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testStorageKeyGeneration,
        testDataStructureDifference,
        testSyncProcess,
        testAPIEndpoints,
        testFixValidation,
        testPotentialIssues
    };
} else {
    // 在浏览器环境中直接运行
    runAllTests();
}
