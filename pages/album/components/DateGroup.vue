<script setup>
import { defineProps, defineEmits } from 'vue';
import PhotoItem from './PhotoItem.vue';

const props = defineProps({
  group: {
    type: Object,
    required: true
  },
  isSelectMode: {
    type: Boolean,
    default: false
  },
  selectedPhotos: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['photoClick', 'photoLongPress']);

function isPhotoSelected(photo) {
  return props.selectedPhotos.some(item => item.id === photo.id);
}

function handlePhotoClick(photo) {
  emit('photoClick', photo);
}

function handlePhotoLongPress(photo) {
  emit('photoLongPress', photo);
}
</script>

<template>
  <view class="date-group">
    <!-- 日期分组标题 -->
    <view class="date-header">
      <view class="date-left">
        <text class="date-text">{{ group.date }}</text>
      </view>
      <view class="photo-count">
        <text class="photo-count-text">{{ group.photos.length }}张</text>
      </view>
    </view>
    
    <!-- 照片网格 -->
    <view class="photo-grid">
      <view 
        v-for="photo in group.photos" 
        :key="photo.id"
        class="photo-wrapper"
      >
        <PhotoItem 
          :photo="photo"
          :isSelectMode="isSelectMode"
          :isSelected="isPhotoSelected(photo)"
          @click="handlePhotoClick(photo)"
          @longpress="handlePhotoLongPress(photo)"
        />
      </view>
    </view>
  </view>
</template>

<style>
.date-group {
  margin-bottom: 16px;
}

/* 日期分组标题 */
.date-header {
  padding: 8px 16px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.date-left {
  display: flex;
  align-items: center;
}

.date-text {
  font-size: 16px;
  color: #333333;
  font-weight: normal;
}

.photo-count {
  background-color: transparent;
}

.photo-count-text {
  font-size: 16px;
  color: #999999;
  font-weight: normal;
}

/* 照片网格 */
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0 16px;
}

.photo-wrapper {
  width: calc(33.33% - 2px);
  margin: 1px;
  aspect-ratio: 1/1;
}
</style> 