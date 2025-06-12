/**
 * 本地数据服务类
 * 替代uniCloud，使用本地Express服务器
 */
class LocalDataService {
	constructor() {
		this.baseURL = 'http://localhost:3000/api';
		this.isLoggedIn = false;
		this.userId = null;
		this.token = null;
		this.init();
	}
	
	// 初始化服务
	init() {
		// 检查本地存储的登录状态
		const token = uni.getStorageSync('local_token');
		const userId = uni.getStorageSync('local_userId');
		
		if (token && userId) {
			this.token = token;
			this.userId = userId;
			this.isLoggedIn = true;
		}
	}
	
	// HTTP请求封装
	async request(url, options = {}) {
		const config = {
			url: `${this.baseURL}${url}`,
			method: options.method || 'GET',
			header: {
				'Content-Type': 'application/json',
				...options.headers
			},
			timeout: 10000
		};
		
		// 添加认证头
		if (this.token) {
			config.header['Authorization'] = `Bearer ${this.token}`;
		}
		
		// 添加数据
		if (options.data) {
			config.data = options.data;
		}
		
		return new Promise((resolve, reject) => {
			uni.request({
				...config,
				success: (res) => {
					if (res.statusCode >= 200 && res.statusCode < 300) {
						resolve(res.data);
					} else {
						reject(new Error(res.data.message || '请求失败'));
					}
				},
				fail: (err) => {
					console.error('请求失败:', err);
					reject(new Error('网络错误，请检查服务器是否启动'));
				}
			});
		});
	}
	
	// 用户注册
	async register(email, password, name) {
		try {
			const result = await this.request('/auth/register', {
				method: 'POST',
				data: { email, password, name }
			});
			
			return {
				success: result.success,
				data: result.data,
				message: result.message
			};
		} catch (error) {
			console.error('注册失败:', error);
			return {
				success: false,
				message: error.message || '注册失败'
			};
		}
	}
	
	// 用户登录
	async login(email, password) {
		try {
			const result = await this.request('/auth/login', {
				method: 'POST',
				data: { email, password }
			});
			
			if (result.success) {
				// 保存登录状态
				this.userId = result.data.userId;
				this.token = result.data.token;
				this.isLoggedIn = true;
				
				uni.setStorageSync('local_token', this.token);
				uni.setStorageSync('local_userId', this.userId);
				uni.setStorageSync('userInfo', {
					id: result.data.userId,
					email: result.data.email,
					name: result.data.name
				});
			}
			
			return {
				success: result.success,
				data: result.data,
				message: result.message
			};
		} catch (error) {
			console.error('登录失败:', error);
			return {
				success: false,
				message: error.message || '登录失败'
			};
		}
	}
	
	// 退出登录
	logout() {
		this.isLoggedIn = false;
		this.userId = null;
		this.token = null;
		
		uni.removeStorageSync('local_token');
		uni.removeStorageSync('local_userId');
		uni.removeStorageSync('userInfo');
	}
	
	// 同步训练记录
	async syncWorkoutHistory() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const workoutHistory = uni.getStorageSync('workoutHistory') || [];
			
			const result = await this.request('/data/sync-workout-history', {
				method: 'POST',
				data: { workoutHistory }
			});
			
			return {
				success: result.success,
				message: result.message
			};
		} catch (error) {
			console.error('训练记录同步失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 获取训练记录
	async getWorkoutHistory() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const result = await this.request('/data/workout-history');
			return {
				success: result.success,
				data: result.data
			};
		} catch (error) {
			console.error('获取训练记录失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 同步个人记录
	async syncPersonalRecords() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const personalRecords = uni.getStorageSync('personalRecords') || {};
			
			const result = await this.request('/data/sync-personal-records', {
				method: 'POST',
				data: { personalRecords }
			});
			
			return {
				success: result.success,
				message: result.message
			};
		} catch (error) {
			console.error('个人记录同步失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 获取个人记录
	async getPersonalRecords() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const result = await this.request('/data/personal-records');
			return {
				success: result.success,
				data: result.data
			};
		} catch (error) {
			console.error('获取个人记录失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 同步健身计划
	async syncPlans() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const plans = uni.getStorageSync('fitnessPlans') || [];
			
			const result = await this.request('/data/sync-plans', {
				method: 'POST',
				data: { plans }
			});
			
			return {
				success: result.success,
				message: result.message
			};
		} catch (error) {
			console.error('健身计划同步失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 获取健身计划
	async getPlans() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const result = await this.request('/data/plans');
			return {
				success: result.success,
				data: result.data
			};
		} catch (error) {
			console.error('获取健身计划失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 获取所有数据
	async getAllDataFromCloud() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const result = await this.request('/data/all');
			
			if (result.success) {
				// 将云端数据同步到本地
				const { workout_history, personal_records, plans } = result.data;
				
				if (workout_history) {
					uni.setStorageSync('workoutHistory', workout_history);
				}
				if (personal_records) {
					uni.setStorageSync('personalRecords', personal_records);
				}
				if (plans) {
					uni.setStorageSync('fitnessPlans', plans);
				}
			}
			
			return {
				success: result.success,
				data: result.data
			};
		} catch (error) {
			console.error('获取所有数据失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 自动同步所有数据
	async autoSync() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			// 上传本地数据到服务器
			await this.syncWorkoutHistory();
			await this.syncPersonalRecords();
			await this.syncPlans();
			
			// 下载服务器数据到本地
			await this.getAllDataFromCloud();
			
			return {
				success: true,
				message: '数据同步成功'
			};
		} catch (error) {
			console.error('自动同步失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 检查服务器健康状态
	async checkServerHealth() {
		try {
			const result = await this.request('/health');
			return {
				success: result.success,
				message: result.message
			};
		} catch (error) {
			return {
				success: false,
				message: '服务器连接失败'
			};
		}
	}
}

// 创建全局实例
const localDataService = new LocalDataService();

export default localDataService;