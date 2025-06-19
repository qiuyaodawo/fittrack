/**
 * UI辅助工具函数
 * 提供通用的UI操作和状态管理
 */

/**
 * 显示加载提示
 * @param {string} title - 加载提示文本
 * @param {number} duration - 持续时间（毫秒）
 */
export function showLoading(title = '加载中...', duration = 0) {
  uni.showLoading({
    title,
    mask: true
  });
  
  if (duration > 0) {
    setTimeout(() => {
      uni.hideLoading();
    }, duration);
  }
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  uni.hideLoading();
}

/**
 * 显示成功提示
 * @param {string} title - 提示文本
 * @param {number} duration - 持续时间（毫秒）
 */
export function showSuccess(title, duration = 2000) {
  uni.showToast({
    title,
    icon: 'success',
    duration,
    mask: true
  });
}

/**
 * 显示错误提示
 * @param {string} title - 提示文本
 * @param {number} duration - 持续时间（毫秒）
 */
export function showError(title, duration = 3000) {
  uni.showToast({
    title,
    icon: 'none',
    duration,
    mask: true
  });
}

/**
 * 显示确认对话框
 * @param {Object} options - 对话框选项
 * @returns {Promise<boolean>} 用户是否确认
 */
export function showConfirm(options) {
  const {
    title = '确认',
    content = '',
    confirmText = '确定',
    cancelText = '取消',
    confirmColor = '#3b82f6'
  } = options;

  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      confirmText,
      cancelText,
      confirmColor,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay = 300) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

/**
 * 验证输入值范围
 * @param {number} value - 输入值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {number} defaultValue - 默认值
 * @returns {number} 验证后的值
 */
export function validateRange(value, min = 1, max = 99, defaultValue = 1) {
  const numValue = parseInt(value);
  
  if (isNaN(numValue) || numValue < min) {
    return defaultValue;
  }
  
  if (numValue > max) {
    return max;
  }
  
  return numValue;
}

/**
 * 格式化数字输入
 * @param {string} value - 输入值
 * @returns {string} 格式化后的值
 */
export function formatNumberInput(value) {
  return value.toString().replace(/[^\d]/g, '');
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

/**
 * 检查是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export function isMobile() {
  const systemInfo = uni.getSystemInfoSync();
  return systemInfo.platform === 'android' || systemInfo.platform === 'ios';
}

/**
 * 获取屏幕尺寸信息
 * @returns {Object} 屏幕信息
 */
export function getScreenInfo() {
  const systemInfo = uni.getSystemInfoSync();
  return {
    width: systemInfo.screenWidth,
    height: systemInfo.screenHeight,
    pixelRatio: systemInfo.pixelRatio,
    isSmallScreen: systemInfo.screenWidth < 768
  };
}

/**
 * 安全的JSON解析
 * @param {string} jsonString - JSON字符串
 * @param {any} defaultValue - 默认值
 * @returns {any} 解析结果
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON解析失败:', error);
    return defaultValue;
  }
}

/**
 * 安全的JSON字符串化
 * @param {any} obj - 要字符串化的对象
 * @param {string} defaultValue - 默认值
 * @returns {string} JSON字符串
 */
export function safeJsonStringify(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('JSON字符串化失败:', error);
    return defaultValue;
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取相对时间描述
 * @param {Date|string} date - 日期
 * @returns {string} 相对时间描述
 */
export function getRelativeTime(date) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}周前`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}个月前`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}年前`;
  }
}

/**
 * 页面导航辅助函数
 * @param {string} page - 页面名称
 * @param {Object} params - 页面参数
 */
export function navigateTo(page, params = {}) {
  const query = Object.keys(params).length > 0 
    ? '?' + Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
    : '';
    
  uni.reLaunch({
    url: `/pages/${page}/${page}${query}`
  });
}

/**
 * 错误处理辅助函数
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文
 */
export function handleError(error, context = '') {
  console.error(`${context}错误:`, error);
  
  let message = '操作失败，请稍后重试';
  
  if (error.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  showError(message);
}

/**
 * 异步操作包装器
 * @param {Function} asyncFn - 异步函数
 * @param {string} loadingText - 加载提示文本
 * @param {string} successText - 成功提示文本
 * @returns {Function} 包装后的函数
 */
export function withLoading(asyncFn, loadingText = '处理中...', successText = '') {
  return async function (...args) {
    try {
      showLoading(loadingText);
      const result = await asyncFn.apply(this, args);
      
      if (successText) {
        showSuccess(successText);
      }
      
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      hideLoading();
    }
  };
}
