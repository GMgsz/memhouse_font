`<template>
	<view class="home-page">
	  <!-- 顶部标题区域 -->
	  <view class="header">
		<text class="title">记忆暖房</text>
		<text class="subtitle">让回忆更有温度</text>
	  </view>
  
	  <!-- 功能模块入口 -->
	  <view class="module-grid">
		<!-- 相册模块 -->
		<view class="module-card" @click="navigateTo('/pages/album/index')">
		  <view class="card-content">
			<view class="icon-wrapper photo-bg">
			  <text class="fa fa-image"></text>
			</view>
			<view class="card-info">
			  <text class="card-title">相册</text>
			  <text class="card-desc">珍藏美好回忆</text>
			</view>
		  </view>
		  <view class="card-footer">
			<text class="fa fa-angle-right"></text>
		  </view>
		</view>
  
		<!-- 设备消息模块 -->
		<view class="module-card" @click="navigateTo('/pages/message/index')">
		  <view class="card-content">
			<view class="icon-wrapper message-bg">
			  <text class="fa fa-comments"></text>
			</view>
			<view class="card-info">
			  <text class="card-title">设备消息</text>
			  <text class="card-desc">消息提醒</text>
			</view>
		  </view>
		  <view class="card-footer">
			<text class="fa fa-angle-right"></text>
		  </view>
		</view>
  
		<!-- 设备控制模块 -->
		<view class="module-card" @click="navigateTo('/pages/devicecontrol/index')">
		  <view class="card-content">
			<view class="icon-wrapper control-bg">
			  <text class="fa fa-sliders"></text>
			</view>
			<view class="card-info">
			  <text class="card-title">设备控制</text>
			  <text class="card-desc">便捷操控体验</text>
			</view>
		  </view>
		  <view class="card-footer">
			<text class="fa fa-angle-right"></text>
		  </view>
		</view>
	  </view>
  
	  <!-- 底部装饰 -->
	  <view class="decoration">
		<view class="deco-circle"></view>
		<view class="deco-circle"></view>
	  </view>
	</view>
  </template>
  
  <script setup>
  function navigateTo(url) {
	uni.navigateTo({
	  url: url
	})
  }
  </script>
  
  <style>
  .home-page {
	min-height: 100vh;
	background-color: #FFFFFF;
	padding: 32px 16px;
	position: relative;
	overflow: hidden;
  }
  
  /* 顶部标题样式 */
  .header {
	margin-bottom: 48px;
	padding: 0 8px;
  }
  
  .title {
	font-size: 28px;
	color: #333333;
	font-weight: 600;
	margin-bottom: 8px;
	display: block;
  }
  
  .subtitle {
	font-size: 14px;
	color: #666666;
	display: block;
  }
  
  /* 模块卡片网格 */
  .module-grid {
	display: flex;
	flex-direction: column;
	gap: 16px;
  }
  
  /* 模块卡片样式 */
  .module-card {
	background-color: #FFFFFF;
	border-radius: 16px;
	padding: 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
  }
  
  .module-card:active {
	transform: scale(0.98);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .card-content {
	display: flex;
	align-items: center;
	gap: 16px;
  }
  
  /* 图标样式 */
  .icon-wrapper {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
  }
  
  .icon-wrapper .fa {
	font-size: 24px;
	color: #FFFFFF;
  }
  
  /* 不同模块的图标背景色 */
  .photo-bg {
	background: linear-gradient(135deg, #FED31B, #FF9F1C);
  }
  
  .message-bg {
	background: linear-gradient(135deg, #4CAF50, #8BC34A);
  }
  
  .control-bg {
	background: linear-gradient(135deg, #2196F3, #03A9F4);
  }
  
  /* 卡片信息样式 */
  .card-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
  }
  
  .card-title {
	font-size: 17px;
	color: #333333;
	font-weight: 500;
  }
  
  .card-desc {
	font-size: 12px;
	color: #999999;
  }
  
  /* 卡片箭头样式 */
  .card-footer .fa {
	font-size: 20px;
	color: #CCCCCC;
  }
  
  /* 底部装饰 */
  .decoration {
	position: absolute;
	bottom: -100px;
	right: -50px;
	z-index: -1;
  }
  
  .deco-circle {
	width: 200px;
	height: 200px;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(254, 211, 27, 0.1), rgba(254, 211, 27, 0.05));
	position: absolute;
  }
  
  .deco-circle:nth-child(1) {
	transform: translate(-30px, -30px);
  }
  
  .deco-circle:nth-child(2) {
	transform: scale(0.8);
  }
  </style>`