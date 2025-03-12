<template>
  <view class="message-preview-page bg-white min-h-screen">
    <!-- 页面内容区域 -->
    <view class="container py-3">
      <view class="message-list">
        <!-- 消息卡片 -->
        <view 
          v-for="(message, index) in messages" 
          :key="index" 
          class="message-card"
        >
          <!-- 消息图片 -->
          <view class="card-image-container">
            <image 
              :src="message.image" 
              mode="aspectFill" 
              class="card-image"
            />
            <!-- 图片数量标签 -->
            <view class="image-count-badge">
              <text class="fa fa-image"></text>
              <text>{{ message.imageCount }}张图片</text>
            </view>
          </view>
          
          <!-- 消息内容 -->
          <view class="card-content">
            <!-- 录音信息和字数 -->
            <view class="audio-info">
              <view class="audio-meta">
                <text class="fa fa-microphone-alt"></text>
                <text>{{ message.duration }}</text>
              </view>
              <text class="info-separator">·</text>
              <view class="word-count">
                <text class="fa fa-file-text"></text>
                <text>{{ message.wordCount }}字</text>
              </view>
            </view>
            
            <!-- 转录文本预览 -->
            <view class="preview-text">
              {{ message.previewText }}
            </view>
            
            <!-- 编辑按钮 - 使用分隔线和图标文字组合 -->
            <view class="card-actions">
              <view class="action-divider"></view>
              <view class="edit-action" @click="navigateToEdit(message.id)">
                <text class="fa fa-edit"></text>
                <text class="edit-text">编辑</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 模拟消息数据
const messages = ref([
  {
    id: 1,
    image: '/static/refdiagrams/test1.jpg',
    imageCount: 1,
    duration: '01:20',
    wordCount: 156,
    previewText: '这是一段示例文本，展示从语音转录得到的内容。在实际应用中，这里会显示用户录音转录后的详细文本。'
  },
  {
    id: 2,
    image: '/static/refdiagrams/test2.jpg',
    imageCount: 1,
    duration: '00:32',
    wordCount: 78,
    previewText: '这是一段示例文本，展示从语音转录得到的内容。在实际应用中，这里会显示用户录音转录后的详细文本。'
  },
  {
    id: 3,
    image: '/static/refdiagrams/test3.jpg',
    imageCount: 1,
    duration: '01:20',
    wordCount: 156,
    previewText: '这是一段示例文本，展示从语音转录得到的内容。在实际应用中，这里会显示用户录音转录后的详细文本。'
  },
  {
    id: 4,
    image: '/static/refdiagrams/test4.jpg',
    imageCount: 1,
    duration: '00:32',
    wordCount: 78,
    previewText: '这是一段示例文本，展示从语音转录得到的内容。在实际应用中，这里会显示用户录音转录后的详细文本。'
  }
]);

// 导航到编辑页面
function navigateToEdit(messageId) {
  uni.navigateTo({
    url: `/pages/message/edit?id=${messageId}`
  });
}
</script>

<style>
/* 容器样式 */
.container {
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 20px;
}

/* 消息列表样式 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片样式 */
.message-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  margin-bottom: 16px;
  width: 100%;
}

/* 卡片图片容器 */
.card-image-container {
  position: relative;
  width: 100%;
  height: 160px;
}

/* 卡片图片 */
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图片数量标签 */
.image-count-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.image-count-badge .fa {
  color: #FFFFFF;
  font-size: 12px;
}

.image-count-badge text {
  color: #FFFFFF;
  font-size: 12px;
}

/* 卡片内容 */
.card-content {
  padding: 12px 16px;
}

/* 音频信息和字数 */
.audio-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.audio-meta {
  display: flex;
  align-items: center;
}

.audio-meta .fa {
  color: #666666;
  font-size: 14px;
  margin-right: 4px;
}

.audio-meta text {
  color: #666666;
  font-size: 12px;
}

/* 分隔符 */
.info-separator {
  margin: 0 8px;
  color: #999999;
  font-size: 12px;
}

.word-count {
  display: flex;
  align-items: center;
}

.word-count .fa {
  color: #666666;
  font-size: 14px;
  margin-right: 4px;
}

.word-count text {
  color: #666666;
  font-size: 12px;
}

/* 预览文本 */
.preview-text {
  color: #333333;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 卡片操作区 */
.card-actions {
  display: flex;
  flex-direction: column;
}

/* 分隔线 */
.action-divider {
  height: 1px;
  background-color: #EEEEEE;
  margin-bottom: 12px;
}

/* 编辑操作 */
.edit-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
  cursor: pointer;
}

.edit-action .fa {
  color: #1D9BF0;
  font-size: 16px;
  margin-right: 6px;
}

.edit-text {
  color: #1D9BF0;
  font-size: 14px;
}
</style> 