<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  photo: {
    type: Object,
    default: () => ({})
  },
  showOriginal: {
    type: Boolean,
    default: false
  },
  isDownloadingOriginal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'download', 'share', 'delete', 'viewOriginal']);

const scale = ref(1);

// 显示的图片URL
const displayUrl = computed(() => {
  if (!props.photo) return '';
  return props.showOriginal && props.photo.originalUrl ? props.photo.originalUrl : props.photo.url;
});

// 关闭预览
function handleClose() {
  // 重置状态
  scale.value = 1;
  emit('close');
}

// 下载照片
function handleDownload() {
  if (!props.photo) return;
  emit('download', props.photo);
}

// 分享照片
function handleShare() {
  if (!props.photo) return;
  emit('share', props.photo);
}

// 删除照片
function handleDelete() {
  if (!props.photo) return;
  emit('delete', props.photo);
}

// 查看原图
function handleViewOriginal() {
  if (!props.photo) return;
  emit('viewOriginal', props.photo);
}

// 处理缩放手势
function handleTouchStart(e) {
  if (e.touches.length === 2) {
    // 记录初始两指距离
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const initialDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    // 存储初始距离
    e.currentTarget.dataset.initialDistance = initialDistance;
    e.currentTarget.dataset.initialScale = scale.value;
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 2) {
    // 计算当前两指距离
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    // 获取初始距离和初始缩放比例
    const initialDistance = parseFloat(e.currentTarget.dataset.initialDistance);
    const initialScale = parseFloat(e.currentTarget.dataset.initialScale);
    
    if (initialDistance > 0) {
      // 计算新的缩放比例
      const newScale = initialScale * (currentDistance / initialDistance);
      
      // 限制缩放范围
      scale.value = Math.min(Math.max(newScale, 1), 3);
    }
  }
}
</script>

<template>
  <view v-if="visible" class="preview-container" @tap="handleClose">
    <!-- 单张照片预览 -->
    <view 
      class="preview-image-container" 
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
    >
      <image 
        v-if="photo"
        class="preview-image" 
        :src="displayUrl" 
        :mode="showOriginal ? 'widthFix' : 'aspectFit'"
        :style="{
          width: showOriginal ? '100%' : '',
          transform: `scale(${scale})`
        }"
      />
      
      <!-- 查看原图按钮 -->
      <view 
        class="view-original-btn" 
        @tap.stop="handleViewOriginal" 
        v-if="!showOriginal"
      >
        <text class="fa fa-download" v-if="isDownloadingOriginal"></text>
        <text class="view-original-text">
          <text v-if="isDownloadingOriginal">正在下载原图...</text>
          <text v-else>查看原图({{ photo.size }})</text>
        </text>
      </view>
    </view>
    
    <!-- 底部工具栏 -->
    <view class="preview-toolbar" @tap.stop>
      <view class="preview-tool-btn" @tap="handleDownload">
        <text class="fa fa-download"></text>
        <text class="preview-tool-text">下载</text>
      </view>
      
      <view class="preview-tool-btn" @tap="handleShare">
        <text class="fa fa-share-alt"></text>
        <text class="preview-tool-text">分享</text>
      </view>
      
      <view class="preview-tool-btn" @tap="handleDelete">
        <text class="fa fa-trash"></text>
        <text class="preview-tool-text">删除</text>
      </view>
    </view>
  </view>
</template>

<style>
.preview-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000000;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

/* 照片预览容器 */
.preview-image-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  transition: transform 0.1s ease;
}

/* 查看原图按钮 */
.view-original-btn {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-original-btn:active {
  opacity: 0.8;
}

.view-original-btn .fa {
  margin-right: 6px;
  color: #FFFFFF;
  font-size: 14px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.view-original-text {
  color: #FFFFFF;
  font-size: 14px;
  font-weight: normal;
}

/* 底部工具栏 */
.preview-toolbar {
  height: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #000000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
}

.preview-tool-btn .fa {
  font-size: 20px;
  color: #FFFFFF;
  margin-bottom: 4px;
}

.preview-tool-text {
  font-size: 12px;
  color: #FFFFFF;
}
</style> 