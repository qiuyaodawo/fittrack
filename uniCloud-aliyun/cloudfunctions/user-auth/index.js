'use strict';

const db = uniCloud.database();
const dbJQL = uniCloud.databaseForJQL();

exports.main = async (event, context) => {
	const { action, userInfo, email, password } = event;
	
	switch (action) {
		case 'register':
			return await register(email, password, userInfo);
		case 'login':
			return await login(email, password);
		case 'getUserInfo':
			return await getUserInfo(event.userId);
		default:
			return {
				code: 400,
				message: '未知操作'
			};
	}
};

// 用户注册
async function register(email, password, userInfo) {
	try {
		// 检查用户是否已存在
		const existUser = await db.collection('users').where({
			email: email
		}).get();
		
		if (existUser.data.length > 0) {
			return {
				code: 400,
				message: '用户已存在'
			};
		}
		
		// 创建新用户
		const user = {
			email: email,
			password: password, // 在生产环境中应该加密
			name: userInfo.name || '健身爱好者',
			avatar: userInfo.avatar || '',
			createTime: new Date(),
			updateTime: new Date()
		};
		
		const result = await db.collection('users').add(user);
		
		return {
			code: 200,
			message: '注册成功',
			data: {
				userId: result.id,
				email: email,
				name: user.name
			}
		};
	} catch (error) {
		return {
			code: 500,
			message: '注册失败',
			error: error.message
		};
	}
}

// 用户登录
async function login(email, password) {
	try {
		const result = await db.collection('users').where({
			email: email,
			password: password
		}).get();
		
		if (result.data.length === 0) {
			return {
				code: 401,
				message: '邮箱或密码错误'
			};
		}
		
		const user = result.data[0];
		
		return {
			code: 200,
			message: '登录成功',
			data: {
				userId: user._id,
				email: user.email,
				name: user.name,
				avatar: user.avatar,
				token: `token_${user._id}_${Date.now()}` // 简单的token生成
			}
		};
	} catch (error) {
		return {
			code: 500,
			message: '登录失败',
			error: error.message
		};
	}
}

// 获取用户信息
async function getUserInfo(userId) {
	try {
		const result = await db.collection('users').doc(userId).get();
		
		if (result.data.length === 0) {
			return {
				code: 404,
				message: '用户不存在'
			};
		}
		
		const user = result.data[0];
		
		return {
			code: 200,
			data: {
				userId: user._id,
				email: user.email,
				name: user.name,
				avatar: user.avatar
			}
		};
	} catch (error) {
		return {
			code: 500,
			message: '获取用户信息失败',
			error: error.message
		};
	}
}
