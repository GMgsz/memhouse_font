<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isSelectMode: {
    type: Boolean,
    default: false
  },
  selectedCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits([
  'add', 
  'enterSelect', 
  'exitSelect', 
  'download', 
  'share', 
  'delete'
]);

function handleAdd() {
  emit('add');
}

function handleEnterSelect() {
  emit('enterSelect');
}

function handleExitSelect() {
  emit('exitSelect');
}

function handleDownload() {
  emit('download');
}

function handleShare() {
  emit('share');
}

function handleDelete() {
  emit('delete');
}
</script>

<template>
  <view>
    <!-- 已选照片数量提示 -->
    <view v-if="isSelectMode && selectedCount > 0" class="selected-count-badge">
      <text class="selected-count-text">已选择 {{ selectedCount }}/10</text>
    </view>
    
    <!-- 底部工具栏 -->
    <view class="toolbar">
      <!-- 浏览模式 -->
      <block v-if="!isSelectMode">
        <view class="toolbar-btn" @tap="handleAdd">
          <view class="icon-wrapper add-icon">
            <text class="fa fa-plus"></text>
          </view>
          <text class="toolbar-text">添加照片</text>
        </view>
        
        <view class="toolbar-btn" @tap="handleEnterSelect">
          <view class="icon-wrapper select-icon">
            <text class="fa fa-check-square-o"></text>
          </view>
          <text class="toolbar-text">选择</text>
        </view>
      </block>
      
      <!-- 选择模式 -->
      <block v-else>
        <view class="toolbar-btn" @tap="handleDownload">
          <view class="icon-wrapper download-icon">
            <text class="fa fa-download"></text>
          </view>
          <text class="toolbar-text">下载</text>
        </view>
        
        <view class="toolbar-btn" @tap="handleShare">
          <view class="icon-wrapper share-icon">
            <text class="fa fa-share-alt"></text>
          </view>
          <text class="toolbar-text">分享</text>
        </view>
        
        <view class="toolbar-btn" @tap="handleDelete">
          <view class="icon-wrapper delete-icon">
            <text class="fa fa-trash"></text>
          </view>
          <text class="toolbar-text">删除</text>
        </view>
        
        <view class="toolbar-btn cancel-btn" @tap="handleExitSelect">
          <text class="cancel-text">取消</text>
        </view>
      </block>
    </view>
  </view>
</template>

<style>
/* 底部工具栏 */
.toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #F7F7F7;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  transition: opacity 0.2s ease;
}

.toolbar-btn:active {
  opacity: 0.7;
}

.icon-wrapper {
  width: auto;
  height: auto;
  margin-right: 4px;
  display: flex;
  align-items: center;
}

.icon-wrapper .fa {
  font-size: 20px;
  color: #576B95;
}

.toolbar-text {
  font-size: 17px;
  color: #576B95;
  font-weight: normal;
}

/* 选择模式下的按钮样式 */
.delete-icon .fa {
  color: #FF5A5F;
}

.cancel-text {
  font-size: 17px;
  color: #576B95;
  font-weight: normal;
}

/* 已选照片数量提示 */
.selected-count-badge {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  padding: 6px 16px;
  border-radius: 16px;
  z-index: 101;
}

.selected-count-text {
  font-size: 15px;
  color: #FFFFFF;
  font-weight: normal;
}
</style> 