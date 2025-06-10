/**
 * 云端数据服务类
 * 处理所有与云端数据库的交互
 */
class CloudDataService {
	constructor() {
		this.isLoggedIn = false;
		this.userId = null;
		this.token = null;
		this.init();
	}
	
	// 初始化服务
	init() {
		// 检查本地存储的登录状态
		const token = uni.getStorageSync('cloud_token');
		const userId = uni.getStorageSync('cloud_userId');
		
		if (token && userId) {
			this.token = token;
			this.userId = userId;
			this.isLoggedIn = true;
		}
	}
	
	// 用户注册
	async register(email, password, name) {
		try {
			const result = await uniCloud.callFunction({
				name: 'user-auth',
				data: {
					action: 'register',
					email: email,
					password: password,
					userInfo: {
						name: name
					}
				}
			});
			
			if (result.result.code === 200) {
				return {
					success: true,
					data: result.result.data,
					message: result.result.message
				};
			} else {
				return {
					success: false,
					message: result.result.message
				};
			}
		} catch (error) {
			console.error('注册失败:', error);
			return {
				success: false,
				message: '网络错误，请稍后重试'
			};
		}
	}
	
	// 用户登录
	async login(email, password) {
		try {
			const result = await uniCloud.callFunction({
				name: 'user-auth',
				data: {
					action: 'login',
					email: email,
					password: password
				}
			});
			
			if (result.result.code === 200) {
				// 保存登录状态
				this.userId = result.result.data.userId;
				this.token = result.result.data.token;
				this.isLoggedIn = true;
				
				uni.setStorageSync('cloud_token', this.token);
				uni.setStorageSync('cloud_userId', this.userId);
				uni.setStorageSync('userInfo', {
					id: result.result.data.userId,
					email: result.result.data.email,
					name: result.result.data.name
				});
				
				return {
					success: true,
					data: result.result.data,
					message: result.result.message
				};
			} else {
				return {
					success: false,
					message: result.result.message
				};
			}
		} catch (error) {
			console.error('登录失败:', error);
			return {
				success: false,
				message: '网络错误，请稍后重试'
			};
		}
	}
	
	// 退出登录
	logout() {
		this.isLoggedIn = false;
		this.userId = null;
		this.token = null;
		
		uni.removeStorageSync('cloud_token');
		uni.removeStorageSync('cloud_userId');
		uni.removeStorageSync('userInfo');
	}
	
	// 同步所有数据到云端
	async syncAllDataToCloud() {
		if (!this.isLoggedIn) {
			return { success: false, message: '用户未登录' };
		}
		
		try {
			// 收集本地所有数据
			const allData = {
				workoutHistory: uni.getStorageSync('workoutHistory') || [],
				personalRecords: uni.getStorageSync('personalRecords') || {},
				plans: uni.getStorageSync('myPlans') || [],
				strengthProgress: uni.getStorageSync('strengthProgress') || {},
				weightHistory: uni.getStorageSync('weightHistory') || []
			};
			
			const result = await uniCloud.callFunction({
				name: 'data-sync',
				data: {
					action: 'syncAllData',
					userId: this.userId,
					data: allData
				}
			});
			
			if (result.result.code === 200) {
				return {
					success: true,
					message: '数据同步成功'
				};
			} else {
				return {
					success: false,
					message: result.result.message
				};
			}
		} catch (error) {
			console.error('数据同步失败:', error);
			return {
				success: false,
				message: '网络错误，同步失败'
			};
		}
	}
	
	// 从云端获取所有数据
	async getAllDataFromCloud() {
		if (!this.isLoggedIn) {
			return { success: false, message: '用户未登录' };
		}
		
		try {
			const result = await uniCloud.callFunction({
				name: 'data-sync',
				data: {
					action: 'getAllData',
					userId: this.userId
				}
			});
			
			if (result.result.code === 200) {
				// 将云端数据保存到本地
				const cloudData = result.result.data;
				
				uni.setStorageSync('workoutHistory', cloudData.workoutHistory);
				uni.setStorageSync('personalRecords', cloudData.personalRecords);
				uni.setStorageSync('myPlans', cloudData.plans);
				uni.setStorageSync('strengthProgress', cloudData.strengthProgress);
				uni.setStorageSync('weightHistory', cloudData.weightHistory);
				
				return {
					success: true,
					data: cloudData,
					message: '数据加载成功'
				};
			} else {
				return {
					success: false,
					message: result.result.message
				};
			}
		} catch (error) {
			console.error('获取云端数据失败:', error);
			return {
				success: false,
				message: '网络错误，加载失败'
			};
		}
	}
	
	// 同步训练记录
	async syncWorkoutHistory() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const workoutHistory = uni.getStorageSync('workoutHistory') || [];
			
			const result = await uniCloud.callFunction({
				name: 'data-sync',
				data: {
					action: 'syncWorkoutHistory',
					userId: this.userId,
					data: workoutHistory
				}
			});
			
			return result.result.code === 200 ? 
				{ success: true, message: '训练记录同步成功' } :
				{ success: false, message: result.result.message };
		} catch (error) {
			console.error('训练记录同步失败:', error);
			return { success: false, message: '网络错误' };
		}
	}
	
	// 同步个人记录
	async syncPersonalRecords() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const personalRecords = uni.getStorageSync('personalRecords') || {};
			
			const result = await uniCloud.callFunction({
				name: 'data-sync',
				data: {
					action: 'syncPersonalRecords',
					userId: this.userId,
					data: personalRecords
				}
			});
			
			return result.result.code === 200 ? 
				{ success: true, message: '个人记录同步成功' } :
				{ success: false, message: result.result.message };
		} catch (error) {
			console.error('个人记录同步失败:', error);
			return { success: false, message: '网络错误' };
		}
	}
		// 同步健身计划
	async syncPlans() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const plans = uni.getStorageSync('myPlans') || [];
			
			const result = await uniCloud.callFunction({
				name: 'data-sync',
				data: {
					action: 'syncPlans',
					userId: this.userId,
					data: plans
				}
			});
			
			return result.result.code === 200 ? 
				{ success: true, message: '健身计划同步成功' } :
				{ success: false, message: result.result.message };
		} catch (error) {
			console.error('健身计划同步失败:', error);
			return { success: false, message: '网络错误' };
		}
	}
	
	// 同步计划到云端
	async syncPlansToCloud(plans) {
		if (!this.isLoggedIn) {
			throw new Error('用户未登录');
		}
		
		try {
			const result = await uniCloud.callFunction({
				name: 'data-sync',
				data: {
					action: 'syncPlans',
					userId: this.userId,
					data: plans
				}
			});
			
			if (result.result.code !== 200) {
				throw new Error(result.result.message);
			}
			
			return result.result.data;
		} catch (error) {
			console.error('同步计划到云端失败:', error);
			throw error;
		}
	}
	
	// 从云端获取计划
	async getPlansFromCloud() {
		if (!this.isLoggedIn) {
			throw new Error('用户未登录');
		}
		
		try {
			const result = await uniCloud.callFunction({
				name: 'data-sync',
				data: {
					action: 'getPlans',
					userId: this.userId
				}
			});
			
			if (result.result.code !== 200) {
				throw new Error(result.result.message);
			}
			
			return result.result.data || [];
		} catch (error) {
			console.error('从云端获取计划失败:', error);
			throw error;
		}
	}
	
	// 保存单个计划到云端
	async savePlanToCloud(plan) {
		if (!this.isLoggedIn) {
			throw new Error('用户未登录');
		}
		
		try {
			const result = await uniCloud.callFunction({
				name: 'data-sync',
				data: {
					action: 'savePlan',
					userId: this.userId,
					data: plan
				}
			});
			
			if (result.result.code !== 200) {
				throw new Error(result.result.message);
			}
			
			return result.result.data;		} catch (error) {
			console.error('保存计划到云端失败:', error);
			throw error;
		}
	}
	
	// 检查网络连接
	async checkNetworkConnection() {
		return new Promise((resolve) => {
			uni.getNetworkType({
				success: (res) => {
					resolve(res.networkType !== 'none');
				},
				fail: () => {
					resolve(false);
				}
			});
		});
	}
	
	// 自动同步（在有网络时）
	async autoSync() {
		const hasNetwork = await this.checkNetworkConnection();
		if (!hasNetwork || !this.isLoggedIn) {
			return { success: false, message: '网络不可用或用户未登录' };
		}
		
		try {
			// 先从云端获取最新数据
			await this.getAllDataFromCloud();
			// 然后同步本地数据到云端
			await this.syncAllDataToCloud();
			
			return { success: true, message: '自动同步完成' };
		} catch (error) {
			console.error('自动同步失败:', error);
			return { success: false, message: '自动同步失败' };
		}
	}
}

// 创建全局实例
const cloudDataService = new CloudDataService();

export default cloudDataService;
