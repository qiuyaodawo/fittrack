/**
 * 本地数据服务类
 * 替代uniCloud，使用本地Express服务器
 */
class LocalDataService {
	constructor() {
		// 自动检测服务器地址
		this.baseURL = this.getServerURL();
		this.isLoggedIn = false;
		this.userId = null;
		this.token = null;
		this.init();
	}
	
	// 自动获取服务器URL
	getServerURL() {
		// 如果是在浏览器环境中
		if (typeof window !== 'undefined') {
			const hostname = window.location.hostname;
			const port = window.location.port;
			
			// 如果访问的是localhost或127.0.0.1，使用本地服务器
			if (hostname === 'localhost' || hostname === '127.0.0.1') {
				return 'http://localhost:3000/api';
			} else {
				// 如果是其他IP地址，使用相同IP的3000端口
				return `http://${hostname}:3000/api`;
			}
		}
		
		// 默认返回localhost（兼容非浏览器环境）
		return 'http://localhost:3000/api';
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
				
				// 登录成功后自动同步数据
				setTimeout(async () => {
					try {
						await this.pullAllDataFromServer();
						console.log('登录后数据同步完成');
					} catch (error) {
						console.error('登录后数据同步失败:', error);
					}
				}, 500);
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
	
	// 获取用户隔离的存储键
	getUserStorageKey(baseKey) {
		return this.userId ? `${baseKey}_${this.userId}` : baseKey;
	}
	
	// 同步训练记录 - 修复存储键问题
	async syncWorkoutHistory() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			// 使用正确的用户隔离存储键
			const storageKey = this.getUserStorageKey('workoutHistory');
			const workoutHistory = uni.getStorageSync(storageKey) || [];
			
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
	
	// 获取训练记录 - 修复存储键问题
	async getWorkoutHistory() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const result = await this.request('/data/workout-history');
			
			if (result.success) {
				// 保存到正确的用户隔离存储键
				const storageKey = this.getUserStorageKey('workoutHistory');
				uni.setStorageSync(storageKey, result.data);
			}
			
			return {
				success: result.success,
				data: result.data
			};
		} catch (error) {
			console.error('获取训练记录失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 同步个人记录 - 修复存储键问题
	async syncPersonalRecords() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const storageKey = this.getUserStorageKey('personalRecords');
			const personalRecords = uni.getStorageSync(storageKey) || {};
			
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
	
	// 获取个人记录 - 修复存储键问题
	async getPersonalRecords() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const result = await this.request('/data/personal-records');
			
			if (result.success) {
				const storageKey = this.getUserStorageKey('personalRecords');
				uni.setStorageSync(storageKey, result.data);
			}
			
			return {
				success: result.success,
				data: result.data
			};
		} catch (error) {
			console.error('获取个人记录失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 同步健身计划 - 修复存储键问题
	async syncPlans() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };

		try {
			const storageKey = this.getUserStorageKey('myPlans');
			const plans = uni.getStorageSync(storageKey) || [];
			
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
	
	// 获取健身计划 - 修复存储键问题
	async getPlans() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const result = await this.request('/data/plans');
			
			if (result.success) {
				const storageKey = this.getUserStorageKey('myPlans');
				uni.setStorageSync(storageKey, result.data);
			}
			
			return {
				success: result.success,
				data: result.data
			};
		} catch (error) {
			console.error('获取健身计划失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 新增：同步体重数据
	async syncBodyWeight() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const storageKey = this.getUserStorageKey('bodyWeight');
			const bodyWeight = uni.getStorageSync(storageKey) || [];
			
			const result = await this.request('/data/sync-body-weight', {
				method: 'POST',
				data: { bodyWeight }
			});
			
			return {
				success: result.success,
				message: result.message
			};
		} catch (error) {
			console.error('体重数据同步失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 新增：获取体重数据
	async getBodyWeight() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const result = await this.request('/data/body-weight');
			
			if (result.success) {
				const storageKey = this.getUserStorageKey('bodyWeight');
				uni.setStorageSync(storageKey, result.data);
			}
			
			return {
				success: result.success,
				data: result.data
			};
		} catch (error) {
			console.error('获取体重数据失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 修复：获取所有数据 - 使用正确的存储键
	async getAllDataFromCloud() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			const result = await this.request('/data/all');
			
			if (result.success) {
				// 将云端数据同步到本地，使用正确的用户隔离存储键
				const { workout_history, personal_records, plans, body_weight } = result.data;
				
				if (workout_history) {
					const storageKey = this.getUserStorageKey('workoutHistory');
					uni.setStorageSync(storageKey, workout_history);
				}
				if (personal_records) {
					const storageKey = this.getUserStorageKey('personalRecords');
					uni.setStorageSync(storageKey, personal_records);
				}
				if (plans) {
					const storageKey = this.getUserStorageKey('myPlans');
					uni.setStorageSync(storageKey, plans);
				}
				if (body_weight) {
					const storageKey = this.getUserStorageKey('bodyWeight');
					uni.setStorageSync(storageKey, body_weight);
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
	
	// 新增：推送所有本地数据到服务器
	async pushAllDataToServer() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			console.log('开始推送本地数据到服务器...');
			
			// 推送训练记录
			await this.syncWorkoutHistory();
			console.log('训练记录推送完成');
			
			// 推送个人记录
			await this.syncPersonalRecords();
			console.log('个人记录推送完成');
			
			// 推送健身计划
			await this.syncPlans();
			console.log('健身计划推送完成');
			
			// 推送体重数据
			await this.syncBodyWeight();
			console.log('体重数据推送完成');
			
			return {
				success: true,
				message: '所有数据推送成功'
			};
		} catch (error) {
			console.error('推送数据失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 新增：从服务器拉取所有数据
	async pullAllDataFromServer() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			console.log('开始从服务器拉取数据...');
			
			// 拉取训练记录
			await this.getWorkoutHistory();
			console.log('训练记录拉取完成');
			
			// 拉取个人记录
			await this.getPersonalRecords();
			console.log('个人记录拉取完成');
			
			// 拉取健身计划
			await this.getPlans();
			console.log('健身计划拉取完成');
			
			// 拉取体重数据
			await this.getBodyWeight();
			console.log('体重数据拉取完成');
			
			return {
				success: true,
				message: '所有数据拉取成功'
			};
		} catch (error) {
			console.error('拉取数据失败:', error);
			return { success: false, message: error.message };
		}
	}
	
	// 完善：自动同步所有数据（双向同步）
	async autoSync() {
		if (!this.isLoggedIn) return { success: false, message: '用户未登录' };
		
		try {
			console.log('开始自动双向同步...');
			
			// 先推送本地数据到服务器
			await this.pushAllDataToServer();
			
			// 再从服务器获取最新数据
			await this.pullAllDataFromServer();
			
			console.log('自动同步完成');
			
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