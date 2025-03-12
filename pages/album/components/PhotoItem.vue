<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  photo: {
    type: Object,
    required: true
  },
  isSelectMode: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click', 'longpress']);

function handleClick() {
  emit('click', props.photo);
}

function handleLongPress() {
  emit('longpress', props.photo);
}
</script>

<template>
  <view 
    class="photo-item"
    @tap="handleClick"
    @longpress="handleLongPress"
  >
    <image 
      class="photo-image" 
      :src="photo.url" 
      mode="aspectFill"
      :lazy-load="true"
    />
    
    <!-- 选择模式下的选择器 -->
    <view 
      v-if="isSelectMode" 
      class="select-indicator"
      :class="{ 'selected': isSelected }"
    >
      <text v-if="isSelected" class="fa fa-check"></text>
    </view>
    
    <!-- 照片信息悬浮层 -->
    <view class="photo-info">
      <text class="photo-size">{{ photo.size }}</text>
    </view>
  </view>
</template>

<style>
/* 照片项样式 */
.photo-item {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 0;
  overflow: hidden;
  transition: opacity 0.2s ease;
}

.photo-item:active {
  opacity: 0.8;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 选择器样式 */
.select-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #FFFFFF;
  background-color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.select-indicator.selected {
  background-color: #FED31B;
  border-color: #FFFFFF;
}

.select-indicator .fa {
  color: #333333;
  font-size: 10px;
  font-weight: bold;
}

/* 照片信息悬浮层 */
.photo-info {
  display: none;
}

.photo-size {
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 500;
}
</style> 