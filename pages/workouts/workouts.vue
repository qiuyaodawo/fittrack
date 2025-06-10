<template>
	<view class="page-container">
		<!-- 顶部导航 -->
		<view class="top-nav">
			<view class="logo">FitTrack</view>
			<view class="nav-links">
				<view class="nav-item" @tap="navigateTo('index')">首页</view>
				<view class="nav-item" @tap="navigateTo('progress')">进度追踪</view>
				<view class="nav-item" @tap="navigateTo('plans')">健身计划</view>
				<view class="nav-item active">训练数据库</view>
			</view>
			<view class="nav-actions">
				<!-- 右侧占位符，保持布局平衡 -->
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
				// 胸部动作
				{
					id: 1,
					name: '杠铃卧推',
					description: '使用杠铃在平板上进行胸部训练的基础动作，是发展胸肌力量的黄金动作。',
					tags: ['胸部', '杠铃'],
					category: 'chest'
				},
				{
					id: 2,
					name: '哑铃卧推',
					description: '使用哑铃进行的卧推动作，能够更好地刺激胸肌稳定性。',
					tags: ['胸部', '哑铃'],
					category: 'chest'
				},
				{
					id: 3,
					name: '上斜卧推',
					description: '在上斜角度进行的卧推，主要锻炼胸肌上部。',
					tags: ['胸部', '杠铃'],
					category: 'chest'
				},
				{
					id: 4,
					name: '下斜卧推',
					description: '在下斜角度进行的卧推，主要锻炼胸肌下部。',
					tags: ['胸部', '杠铃'],
					category: 'chest'
				},
				{
					id: 5,
					name: '哑铃飞鸟',
					description: '使用哑铃进行的胸部分离动作，能够很好地拉伸胸肌。',
					tags: ['胸部', '哑铃'],
					category: 'chest'
				},
				{
					id: 6,
					name: '俯卧撑',
					description: '经典的自重胸部训练动作，随时随地可以进行。',
					tags: ['胸部', '自重'],
					category: 'chest'
				},
				{
					id: 7,
					name: '双杠臂屈伸',
					description: '在双杠上进行的复合动作，同时锻炼胸肌和三头肌。',
					tags: ['胸部', '自重'],
					category: 'chest'
				},
				
				// 背部动作
				{
					id: 8,
					name: '引体向上',
					description: '锻炼背部和手臂力量的经典自重训练，发展背部宽度。',
					tags: ['背部', '自重'],
					category: 'back'
				},
				{
					id: 9,
					name: '杠铃划船',
					description: '使用杠铃进行的背部厚度训练，发展背阔肌和菱形肌。',
					tags: ['背部', '杠铃'],
					category: 'back'
				},
				{
					id: 10,
					name: '哑铃划船',
					description: '使用哑铃进行的单侧背部训练，可以修正力量不平衡。',
					tags: ['背部', '哑铃'],
					category: 'back'
				},
				{
					id: 11,
					name: '高位下拉',
					description: '在拉力器上进行的背部宽度训练，适合初学者学习引体向上动作模式。',
					tags: ['背部', '器械'],
					category: 'back'
				},
				{
					id: 12,
					name: '坐姿划船',
					description: '在坐姿划船机上进行的背部训练，能够很好地锻炼中背部肌群。',
					tags: ['背部', '器械'],
					category: 'back'
				},
				{
					id: 13,
					name: 'T杠划船',
					description: '使用T杠进行的划船动作，能够很好地发展背部厚度。',
					tags: ['背部', '杠铃'],
					category: 'back'
				},
				{
					id: 14,
					name: '面拉',
					description: '使用绳索进行的后束三角肌和菱形肌训练动作。',
					tags: ['背部', '器械'],
					category: 'back'
				},
				
				// 腿部动作
				{
					id: 15,
					name: '杠铃深蹲',
					description: '锻炼下肢肌群的黄金动作，是所有腿部训练的基础。',
					tags: ['腿部', '杠铃'],
					category: 'legs'
				},
				{
					id: 16,
					name: '前蹲',
					description: '杠铃置于前侧的深蹲变式，更多地锻炼股四头肌。',
					tags: ['腿部', '杠铃'],
					category: 'legs'
				},
				{
					id: 17,
					name: '哑铃深蹲',
					description: '使用哑铃进行的深蹲，适合初学者或家庭训练。',
					tags: ['腿部', '哑铃'],
					category: 'legs'
				},
				{
					id: 18,
					name: '腿举',
					description: '在腿举机上进行的下肢训练，可以使用更大的重量。',
					tags: ['腿部', '器械'],
					category: 'legs'
				},
				{
					id: 19,
					name: '保加利亚深蹲',
					description: '单腿进行的深蹲变式，能够很好地锻炼单侧力量。',
					tags: ['腿部', '自重'],
					category: 'legs'
				},
				{
					id: 20,
					name: '罗马尼亚硬拉',
					description: '主要锻炼腘绳肌和臀部肌群的硬拉变式。',
					tags: ['腿部', '杠铃'],
					category: 'legs'
				},
				{
					id: 21,
					name: '硬拉',
					description: '锻炼后链肌群的复合动作，提升整体力量的经典动作。',
					tags: ['背部', '腿部', '杠铃'],
					category: 'legs'
				},
				
				// 肩部动作
				{
					id: 22,
					name: '杠铃肩推',
					description: '使用杠铃进行的肩部推举，发展肩部整体力量。',
					tags: ['肩部', '杠铃'],
					category: 'shoulders'
				},
				{
					id: 23,
					name: '哑铃肩推',
					description: '使用哑铃进行的肩部推举，发展肩部力量和围度的经典动作。',
					tags: ['肩部', '哑铃'],
					category: 'shoulders'
				},
				{
					id: 24,
					name: '侧平举',
					description: '锻炼三角肌中束的分离动作，塑造肩部宽度。',
					tags: ['肩部', '哑铃'],
					category: 'shoulders'
				},
				{
					id: 25,
					name: '前平举',
					description: '主要锻炼三角肌前束的分离动作。',
					tags: ['肩部', '哑铃'],
					category: 'shoulders'
				},
				{
					id: 26,
					name: '阿诺德推举',
					description: '结合推举和旋转的复合肩部动作，以阿诺德·施瓦辛格命名。',
					tags: ['肩部', '哑铃'],
					category: 'shoulders'
				},
				{
					id: 27,
					name: '倒立撑',
					description: '高难度的自重肩部训练动作，需要良好的平衡能力。',
					tags: ['肩部', '自重'],
					category: 'shoulders'
				},
				
				// 手臂动作
				{
					id: 28,
					name: '杠铃弯举',
					description: '锻炼二头肌的基础动作，使用杠铃进行。',
					tags: ['手臂', '杠铃'],
					category: 'arms'
				},
				{
					id: 29,
					name: '哑铃弯举',
					description: '使用哑铃进行的二头肌训练，可以单侧或双侧进行。',
					tags: ['手臂', '哑铃'],
					category: 'arms'
				},
				{
					id: 30,
					name: '锤式弯举',
					description: '中性握法的弯举动作，同时锻炼二头肌和肱桡肌。',
					tags: ['手臂', '哑铃'],
					category: 'arms'
				},
				{
					id: 31,
					name: '窄距卧推',
					description: '窄握距的卧推变式，主要锻炼三头肌。',
					tags: ['手臂', '杠铃'],
					category: 'arms'
				},
				{
					id: 32,
					name: '三头肌下压',
					description: '在拉力器上锻炼三头肌的经典动作。',
					tags: ['手臂', '器械'],
					category: 'arms'
				},
				{
					id: 33,
					name: '臂屈伸',
					description: '在双杠或椅子上进行的三头肌训练动作。',
					tags: ['手臂', '自重'],
					category: 'arms'
				},
				
				// 核心动作
				{
					id: 34,
					name: '平板支撑',
					description: '强化核心肌群的等长收缩训练，是核心训练的基础动作。',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 35,
					name: '卷腹',
					description: '经典的腹部训练动作，主要锻炼腹直肌上部。',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 36,
					name: '俄罗斯转体',
					description: '坐姿进行的旋转动作，主要锻炼腹斜肌。',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 37,
					name: '登山者',
					description: '动态的核心训练动作，同时具有有氧训练效果。',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 38,
					name: '死虫',
					description: '仰卧进行的对侧手脚协调动作，训练核心稳定性。',
					tags: ['核心', '自重'],
					category: 'core'
				},
				{
					id: 39,
					name: '鸟狗式',
					description: '四点支撑的对侧手脚伸展动作，训练核心稳定性。',
					tags: ['核心', '自重'],
					category: 'core'
				},
				
				// 有氧动作
				{
					id: 40,
					name: '跑步',
					description: '最基础的有氧运动，可以在跑步机或户外进行。',
					tags: ['有氧', '自重'],
					category: 'core'
				},
				{
					id: 41,
					name: '游泳',
					description: '全身性的有氧运动，对关节冲击小。',
					tags: ['有氧', '自重'],
					category: 'core'
				},
				{
					id: 42,
					name: '自行车',
					description: '下肢主导的有氧运动，可以室内或户外进行。',
					tags: ['有氧', '器械'],
					category: 'core'
				},
				{
					id: 43,
					name: '椭圆机',
					description: '低冲击的全身有氧训练器械。',
					tags: ['有氧', '器械'],
					category: 'core'
				},
				{
					id: 44,
					name: 'HIIT',
					description: '高强度间歇训练，结合高强度和恢复期的训练方式。',
					tags: ['有氧', '自重'],
					category: 'core'
				},
				{
					id: 45,
					name: '波比跳',
					description: '全身性的爆发力训练动作，同时具有有氧和力量训练效果。',
					tags: ['有氧', '自重'],
					category: 'core'
				},
				{
					id: 46,
					name: '开合跳',
					description: '简单的全身有氧动作，适合热身和HIIT训练。',
					tags: ['有氧', '自重'],
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

.nav-actions {
	display: flex;
	align-items: center;
	min-width: 120rpx; /* 确保右侧有足够的占位空间 */
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
}
</style> 