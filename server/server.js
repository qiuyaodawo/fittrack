const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'fittrack_secret_key_2024';

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据库初始化
const dbPath = path.join(__dirname, 'fittrack.db');
const db = new sqlite3.Database(dbPath);

// 简单的密码哈希函数
function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'fittrack_salt').digest('hex');
}

// 验证密码
function verifyPassword(inputPassword, hashedPassword) {
    return hashPassword(inputPassword) === hashedPassword;
}

// 创建数据库表
db.serialize(() => {
    // 用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 用户数据表
    db.run(`CREATE TABLE IF NOT EXISTS user_data (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        data_type TEXT NOT NULL,
        data_content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
});

// JWT验证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: '需要登录' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: '无效的token' });
        }
        req.user = user;
        next();
    });
};

// ============== 用户认证相关API ==============

// 用户注册
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: '请填写所有必填字段'
            });
        }

        // 检查用户是否已存在
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '数据库错误'
                });
            }

            if (row) {
                return res.status(400).json({
                    success: false,
                    message: '用户已存在'
                });
            }

            // 创建新用户
            const userId = uuidv4();
            const hashedPassword = hashPassword(password);

            db.run(
                'INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
                [userId, email, hashedPassword, name],
                function(err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: '创建用户失败'
                        });
                    }

                    res.json({
                        success: true,
                        message: '注册成功',
                        data: {
                            userId: userId,
                            email: email,
                            name: name
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: '请填写邮箱和密码'
            });
        }

        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '数据库错误'
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '邮箱或密码错误'
                });
            }

            // 验证密码
            const validPassword = verifyPassword(password, user.password);
            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    message: '邮箱或密码错误'
                });
            }

            // 生成JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                message: '登录成功',
                data: {
                    userId: user.id,
                    email: user.email,
                    name: user.name,
                    token: token
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// ============== 数据同步相关API ==============

// 同步训练记录
app.post('/api/data/sync-workout-history', authenticateToken, (req, res) => {
    const { workoutHistory } = req.body;
    const userId = req.user.userId;

    const dataContent = JSON.stringify(workoutHistory);

    db.run(
        `INSERT OR REPLACE INTO user_data (id, user_id, data_type, data_content, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [`${userId}_workout_history`, userId, 'workout_history', dataContent],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '同步训练记录失败'
                });
            }

            res.json({
                success: true,
                message: '训练记录同步成功'
            });
        }
    );
});

// 获取训练记录
app.get('/api/data/workout-history', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.get(
        'SELECT data_content FROM user_data WHERE user_id = ? AND data_type = ?',
        [userId, 'workout_history'],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '获取训练记录失败'
                });
            }

            const workoutHistory = row ? JSON.parse(row.data_content) : [];
            res.json({
                success: true,
                data: workoutHistory
            });
        }
    );
});

// 同步个人记录
app.post('/api/data/sync-personal-records', authenticateToken, (req, res) => {
    const { personalRecords } = req.body;
    const userId = req.user.userId;

    const dataContent = JSON.stringify(personalRecords);

    db.run(
        `INSERT OR REPLACE INTO user_data (id, user_id, data_type, data_content, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [`${userId}_personal_records`, userId, 'personal_records', dataContent],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '同步个人记录失败'
                });
            }

            res.json({
                success: true,
                message: '个人记录同步成功'
            });
        }
    );
});

// 获取个人记录
app.get('/api/data/personal-records', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.get(
        'SELECT data_content FROM user_data WHERE user_id = ? AND data_type = ?',
        [userId, 'personal_records'],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '获取个人记录失败'
                });
            }

            const personalRecords = row ? JSON.parse(row.data_content) : {};
            res.json({
                success: true,
                data: personalRecords
            });
        }
    );
});

// 同步健身计划
app.post('/api/data/sync-plans', authenticateToken, (req, res) => {
    const { plans } = req.body;
    const userId = req.user.userId;

    const dataContent = JSON.stringify(plans);

    db.run(
        `INSERT OR REPLACE INTO user_data (id, user_id, data_type, data_content, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [`${userId}_plans`, userId, 'plans', dataContent],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '同步健身计划失败'
                });
            }

            res.json({
                success: true,
                message: '健身计划同步成功'
            });
        }
    );
});

// 获取健身计划
app.get('/api/data/plans', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.get(
        'SELECT data_content FROM user_data WHERE user_id = ? AND data_type = ?',
        [userId, 'plans'],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '获取健身计划失败'
                });
            }

            const plans = row ? JSON.parse(row.data_content) : [];
            res.json({
                success: true,
                data: plans
            });
        }
    );
});

// 获取所有数据
app.get('/api/data/all', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.all(
        'SELECT data_type, data_content FROM user_data WHERE user_id = ?',
        [userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '获取数据失败'
                });
            }

            const allData = {};
            rows.forEach(row => {
                allData[row.data_type] = JSON.parse(row.data_content);
            });

            res.json({
                success: true,
                data: allData
            });
        }
    );
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'FitTrack服务器运行正常',
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`FitTrack服务器已启动！`);
    console.log(`服务器地址: http://localhost:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
    console.log(`数据库路径: ${dbPath}`);
    console.log('');
    console.log('服务器功能：');
    console.log('   - 用户注册和登录');
    console.log('   - 训练记录同步');
    console.log('   - 个人记录管理');
    console.log('   - 健身计划存储');
    console.log('   - 数据安全加密');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    db.close((err) => {
        if (err) {
            console.error('关闭数据库时出错:', err.message);
        } else {
            console.log('数据库连接已关闭');
        }
        process.exit(0);
    });
});