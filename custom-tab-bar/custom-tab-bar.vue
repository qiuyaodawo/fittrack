<template>
	<!-- 空的tabBar组件 -->
</template>

<script>
export default {
	name: 'custom-tab-bar',
	data() {
		return {}
	},
	created() {
		// 提供一个空的实现，确保框架能正常调用tabBar相关API
		if (typeof window !== 'undefined') {
			window.__customTabBar__ = {
				show: () => {},
				hide: () => {},
				setStyle: () => {},
				setHeight: () => {}
			};
		}
	}
}
</script>

<style>
/* 空样式，确保没有任何视觉元素 */
</style> 