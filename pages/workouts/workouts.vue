<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item" @tap="navigateTo('index')">首页</view>
				<view class="nav-item active">运动数据库</view>
				<view class="nav-item" @tap="navigateTo('plans')">健身计划</view>
				<view class="nav-item" @tap="navigateTo('progress')">进度追踪</view>
			</view>
			<view class="record-btn">
				<button class="btn btn-primary" @tap="recordWorkout">记录训练</button>
			</view>
		</view>
		
		<view class="content-container">
			<view class="card workout-search">
				<input type="text" class="input search-input" v-model="searchKeyword" placeholder="搜索运动..." />
			</view>
			
			<view class="filter-tags">
				<view 
					class="filter-tag" 
					:class="{'active-tag': activeFilter === tag.id}"
					v-for="tag in filterTags" 
					:key="tag.id"
					@tap="setFilter(tag.id)"
				>
					{{tag.name}}
				</view>
			</view>
			
			<view class="workout-list">
				<view class="card workout-card" v-for="workout in filteredWorkouts" :key="workout.id" @tap="viewWorkoutDetails(workout)">
					<view class="workout-card-content">
						<text class="workout-title">{{workout.name}}</text>
						<text class="workout-desc">{{workout.description}}</text>
						<view class="workout-tags">
							<view class="badge badge-primary" v-for="(tag, index) in workout.tags" :key="index">
								{{tag}}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			searchKeyword: '',
			activeFilter: 'all',
			filterTags: [
				{ id: 'all', name: '全部' },
				{ id: 'chest', name: '胸部' },
				{ id: 'back', name: '背部' },
				{ id: 'legs', name: '腿部' },
				{ id: 'shoulders', name: '肩部' },
				{ id: 'arms', name: '手臂' },
				{ id: 'core', name: '核心' }
			],
			workouts: [
				{
					id: 1,
					name: '平板卧推',
					description: '使用杠铃在平板上进行胸部训练的基础动作。',
					tags: ['胸部', '杠铃'],
					category: 'chest'
				},
				{
					id: 2,
					name: '引体向上',
					description: '锻炼背部和手臂力量的经典自重训练。',
					tags: ['背部', '自重'],
					category: 'back'
				},
				{
					id: 3,
					name: '深蹲',
					description: '锻炼下肢肌群的黄金动作，可负重或自重进行。',
					tags: ['腿部', '杠铃'],
					category: 'legs'
				},
				{
					id: 4,
					name: '硬拉',
					description: '锻炼后链肌群的复合动作，提升整体力量。',
					tags: ['背部', '腿部', '杠铃'],
					category: 'back'
				},
				{
					id: 5,
					name: '哑铃肩推',
					description: '发展肩部力量和围度的经典动作。',
					tags: ['肩部', '哑铃'],
					category: 'shoulders'
				},
				{
					id: 6,
					name: '平板支撑',
					description: '强化核心肌群的等长收缩训练。',
					tags: ['核心', '自重'],
					category: 'core'
				}
			]
		}
	},
	computed: {
		filteredWorkouts() {
			let result = this.workouts;
			
			// 关键词搜索过滤
			if (this.searchKeyword) {
				const keyword = this.searchKeyword.toLowerCase();
				result = result.filter(workout => 
					workout.name.toLowerCase().includes(keyword) || 
					workout.description.toLowerCase().includes(keyword)
				);
			}
			
			// 分类过滤
			if (this.activeFilter !== 'all') {
				result = result.filter(workout => workout.category === this.activeFilter);
			}
			
			return result;
		}
	},
	methods: {
		navigateTo(page) {
			uni.reLaunch({
				url: `/pages/${page}/${page}`
			});
		},
		recordWorkout() {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		},
		setFilter(filterId) {
			this.activeFilter = filterId;
		},
		viewWorkoutDetails(workout) {
			uni.showToast({
				title: '查看运动: ' + workout.name,
				icon: 'none'
			});
		}
	}
}
</script>

<style lang="scss">
.page-container {
	min-height: 100vh;
	background-color: var(--light-bg-color);
}

.top-nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 40rpx;
	background-color: #ffffff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	position: sticky;
	top: 0;
	z-index: 100;
}

.logo {
	font-size: 40rpx;
	font-weight: bold;
	color: var(--primary-color);
}

.nav-links {
	display: flex;
	align-items: center;
	flex: 1;
	justify-content: center;
	margin: 0 40rpx;
}

.nav-item {
	padding: 16rpx 30rpx;
	margin: 0 15rpx;
	font-size: 30rpx;
	border-bottom: 4rpx solid transparent;
	transition: all 0.3s;
	
	&.active {
		border-bottom: 4rpx solid var(--primary-color);
		color: var(--primary-color);
		font-weight: 500;
	}
}

.record-btn {
	.btn {
		font-size: 26rpx;
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 30rpx;
	}
}

.content-container {
	width: 80%;
	margin: 0 auto;
	padding: 30rpx;
}

.workout-search {
	margin-bottom: 30rpx;
	padding: 30rpx;
}

.search-input {
	margin-bottom: 0;
	height: 80rpx;
}

.filter-tags {
	display: flex;
	flex-wrap: nowrap;
	overflow-x: auto;
	margin-bottom: 40rpx;
	padding: 10rpx 0;
}

.filter-tag {
	padding: 16rpx 36rpx;
	background-color: #f1f5f9;
	border-radius: 100rpx;
	margin-right: 20rpx;
	white-space: nowrap;
	transition: all 0.3s ease;
	font-size: 26rpx;
	
	&:active {
		opacity: 0.7;
	}
}

.active-tag {
	background-color: var(--primary-color);
	color: #fff;
}

.workout-list {
	width: 100%;
}

.workout-card {
	margin-bottom: 30rpx;
	transition: all 0.3s ease;
	
	&:active {
		transform: translateY(-5rpx);
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
	}
}

.workout-card-content {
	padding: 30rpx;
}

.workout-title {
	font-size: 34rpx;
	font-weight: bold;
	margin-bottom: 15rpx;
	display: block;
}

.workout-desc {
	font-size: 28rpx;
	color: var(--text-color-light);
	margin-bottom: 25rpx;
	display: block;
}

.workout-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 15rpx;
}

@media screen and (max-width: 768px) {
	.content-container {
		width: 90%;
		padding: 20rpx;
	}
	
	.top-nav {
		flex-direction: column;
		padding: 20rpx;
	}
	
	.logo {
		margin-bottom: 20rpx;
	}
	
	.nav-links {
		width: 100%;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}
	
	.nav-item {
		padding: 10rpx;
		margin: 0 5rpx;
		font-size: 24rpx;
	}
	
	.record-btn {
		display: none;
	}
}
</style> 