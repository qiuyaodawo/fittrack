<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 检查登录状态
			const token = uni.getStorageSync('token');
			if (!token) {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	
	/* 全局变量 */
	:root {
		--primary-color: #3b82f6;
		--primary-hover-color: #2563eb;
		--light-bg-color: #f5f5f5;
		--card-bg-color: #ffffff;
		--border-color: #e5e7eb;
		--text-color: #1f2937;
		--text-color-light: #6b7280;
		--success-color: #10b981;
		--warning-color: #f59e0b;
		--error-color: #ef4444;
	}
	
	// 设置整个项目的背景色
	page {
		background-color: var(--light-bg-color);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		color: var(--text-color);
		font-size: 28rpx;
	}
	
	/* 隐藏tabBar */
	.uni-tabbar {
		display: none !important;
		height: 0 !important;
		opacity: 0 !important;
		visibility: hidden !important;
	}
	
	/* 确保没有tabBar的额外padding */
	.uni-page-wrapper {
		padding-bottom: 0 !important;
	}
	
	/* 通用样式 */
	.container {
		padding: 30rpx;
	}
	
	.flex-row {
		display: flex;
		flex-direction: row;
	}
	
	.flex-column {
		display: flex;
		flex-direction: column;
	}
	
	.justify-between {
		justify-content: space-between;
	}
	
	.align-center {
		align-items: center;
	}
	
	.card {
		background-color: var(--card-bg-color);
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	}
	
	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 30rpx;
	}
	
	.text-primary {
		color: var(--primary-color);
	}
	
	.text-success {
		color: var(--success-color);
	}
	
	.text-warning {
		color: var(--warning-color);
	}
	
	.text-error {
		color: var(--error-color);
	}
	
	.badge {
		padding: 6rpx 16rpx;
		border-radius: 100rpx;
		font-size: 24rpx;
		font-weight: 600;
	}
	
	.badge-primary {
		background-color: rgba(59, 130, 246, 0.1);
		color: var(--primary-color);
	}
	
	.badge-success {
		background-color: rgba(16, 185, 129, 0.1);
		color: var(--success-color);
	}
	
	.btn {
		height: 96rpx;
		line-height: 96rpx;
		border-radius: 12rpx;
		font-size: 32rpx;
		text-align: center;
		padding: 0 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}
	
	.btn-primary {
		background-color: var(--primary-color);
		color: #ffffff;
	}
	
	.btn-outline {
		border: 2rpx solid var(--primary-color);
		color: var(--primary-color);
		background-color: transparent;
	}
	
	.input {
		height: 88rpx;
		padding: 0 24rpx;
		border: 2rpx solid var(--border-color);
		border-radius: 8rpx;
		margin-bottom: 30rpx;
	}
	
	.fade-in {
		animation: fadeIn 0.5s ease-in;
	}
	
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	/* #endif */
</style>
