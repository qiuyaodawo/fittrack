'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	const { action, userId, data } = event;
	
	if (!userId) {
		return {
			code: 401,
			message: '用户未登录'
		};
	}
		switch (action) {
		case 'syncWorkoutHistory':
			return await syncWorkoutHistory(userId, data);
		case 'getWorkoutHistory':
			return await getWorkoutHistory(userId);
		case 'syncPersonalRecords':
			return await syncPersonalRecords(userId, data);
		case 'getPersonalRecords':
			return await getPersonalRecords(userId);
		case 'syncPlans':
			return await syncPlans(userId, data);
		case 'getPlans':
			return await getPlans(userId);
		case 'savePlan':
			return await savePlan(userId, data);
		case 'syncAllData':
			return await syncAllData(userId, data);
		case 'getAllData':
			return await getAllData(userId);
		default:
			return {
				code: 400,
				message: '未知操作'
			};
	}
};

// 同步训练记录
async function syncWorkoutHistory(userId, workoutHistory) {
	try {
		await db.collection('user_data').doc(userId).update({
			workoutHistory: workoutHistory,
			updateTime: new Date()
		});
		
		return {
			code: 200,
			message: '训练记录同步成功'
		};
	} catch (error) {
		// 如果文档不存在，则创建新文档
		try {
			await db.collection('user_data').doc(userId).set({
				userId: userId,
				workoutHistory: workoutHistory,
				createTime: new Date(),
				updateTime: new Date()
			});
			
			return {
				code: 200,
				message: '训练记录同步成功'
			};
		} catch (createError) {
			return {
				code: 500,
				message: '训练记录同步失败',
				error: createError.message
			};
		}
	}
}

// 获取训练记录
async function getWorkoutHistory(userId) {
	try {
		const result = await db.collection('user_data').doc(userId).get();
		
		if (result.data.length === 0) {
			return {
				code: 200,
				data: []
			};
		}
		
		return {
			code: 200,
			data: result.data[0].workoutHistory || []
		};
	} catch (error) {
		return {
			code: 500,
			message: '获取训练记录失败',
			error: error.message
		};
	}
}

// 同步个人记录
async function syncPersonalRecords(userId, personalRecords) {
	try {
		await db.collection('user_data').doc(userId).update({
			personalRecords: personalRecords,
			updateTime: new Date()
		});
		
		return {
			code: 200,
			message: '个人记录同步成功'
		};
	} catch (error) {
		try {
			await db.collection('user_data').doc(userId).set({
				userId: userId,
				personalRecords: personalRecords,
				createTime: new Date(),
				updateTime: new Date()
			});
			
			return {
				code: 200,
				message: '个人记录同步成功'
			};
		} catch (createError) {
			return {
				code: 500,
				message: '个人记录同步失败',
				error: createError.message
			};
		}
	}
}

// 获取个人记录
async function getPersonalRecords(userId) {
	try {
		const result = await db.collection('user_data').doc(userId).get();
		
		if (result.data.length === 0) {
			return {
				code: 200,
				data: {}
			};
		}
		
		return {
			code: 200,
			data: result.data[0].personalRecords || {}
		};
	} catch (error) {
		return {
			code: 500,
			message: '获取个人记录失败',
			error: error.message
		};
	}
}

// 同步健身计划
async function syncPlans(userId, plans) {
	try {
		await db.collection('user_data').doc(userId).update({
			plans: plans,
			updateTime: new Date()
		});
		
		return {
			code: 200,
			message: '健身计划同步成功'
		};
	} catch (error) {
		try {
			await db.collection('user_data').doc(userId).set({
				userId: userId,
				plans: plans,
				createTime: new Date(),
				updateTime: new Date()
			});
			
			return {
				code: 200,
				message: '健身计划同步成功'
			};
		} catch (createError) {
			return {
				code: 500,
				message: '健身计划同步失败',
				error: createError.message
			};
		}
	}
}

// 获取健身计划
async function getPlans(userId) {
	try {
		const result = await db.collection('user_data').doc(userId).get();
		
		if (result.data.length === 0) {
			return {
				code: 200,
				data: []
			};
		}
		
		return {
			code: 200,
			data: result.data[0].plans || []
		};
	} catch (error) {
		return {
			code: 500,
			message: '获取健身计划失败',
			error: error.message
		};
	}
}

// 保存单个健身计划
async function savePlan(userId, plan) {
	try {
		// 先获取现有计划
		const result = await db.collection('user_data').doc(userId).get();
		let existingPlans = [];
		
		if (result.data.length > 0 && result.data[0].plans) {
			existingPlans = result.data[0].plans;
		}
		
		// 添加新计划到开头
		existingPlans.unshift(plan);
		
		// 更新数据库
		await db.collection('user_data').doc(userId).update({
			plans: existingPlans,
			updateTime: new Date()
		});
		
		return {
			code: 200,
			message: '计划保存成功',
			data: plan
		};
	} catch (error) {
		try {
			// 如果文档不存在，创建新文档
			await db.collection('user_data').doc(userId).set({
				userId: userId,
				plans: [plan],
				createTime: new Date(),
				updateTime: new Date()
			});
			
			return {
				code: 200,
				message: '计划保存成功',
				data: plan
			};
		} catch (createError) {
			return {
				code: 500,
				message: '计划保存失败',
				error: createError.message
			};
		}
	}
}

// 同步所有数据
async function syncAllData(userId, allData) {
	try {
		const userData = {
			userId: userId,
			workoutHistory: allData.workoutHistory || [],
			personalRecords: allData.personalRecords || {},
			plans: allData.plans || [],
			strengthProgress: allData.strengthProgress || {},
			weightHistory: allData.weightHistory || [],
			updateTime: new Date()
		};
		
		await db.collection('user_data').doc(userId).set(userData);
		
		return {
			code: 200,
			message: '所有数据同步成功'
		};
	} catch (error) {
		return {
			code: 500,
			message: '数据同步失败',
			error: error.message
		};
	}
}

// 获取所有数据
async function getAllData(userId) {
	try {
		const result = await db.collection('user_data').doc(userId).get();
		
		if (result.data.length === 0) {
			return {
				code: 200,
				data: {
					workoutHistory: [],
					personalRecords: {},
					plans: [],
					strengthProgress: {},
					weightHistory: []
				}
			};
		}
		
		const userData = result.data[0];
		
		return {
			code: 200,
			data: {
				workoutHistory: userData.workoutHistory || [],
				personalRecords: userData.personalRecords || {},
				plans: userData.plans || [],
				strengthProgress: userData.strengthProgress || {},
				weightHistory: userData.weightHistory || []
			}
		};
	} catch (error) {
		return {
			code: 500,
			message: '获取数据失败',
			error: error.message
		};
	}
}
