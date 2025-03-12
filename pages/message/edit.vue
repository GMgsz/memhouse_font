<template>
  <view class="edit-page">
    <!-- 主要内容区域 -->
    <scroll-view 
      class="main-content" 
      scroll-y
      :scroll-top="scrollTop"
      @scroll="onScroll"
    >
      <view class="page-container">
        <!-- 图片区域 -->
        <view class="image-wrapper">
          <image 
            :src="messageData.image" 
            mode="aspectFill" 
            class="cover-image"
          />
        </view>

        <!-- 音频播放器 -->
        <view class="audio-player">
          <view class="player-content">
            <view class="play-control" @click="togglePlay">
              <text class="fa" :class="isPlaying ? 'fa fa-pause' : 'fa fa-play'"></text>
            </view>
            <view class="progress-container">
              <slider 
                class="progress-slider" 
                :value="progress" 
                @change="onProgressChange"
                activeColor="#1890FF"
                backgroundColor="#E5E5E5"
                block-size="12"
              />
              <view class="time-info">
                <text>{{ formatTime(currentTime) }}</text>
                <text>{{ formatTime(duration) }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 文本内容区域 -->
        <view class="text-content-wrapper">
          <!-- 切换按钮 -->
          <view class="switch-tabs">
            <view 
              class="tab" 
              :class="{ active: activeTab === 'transcript' }"
              @click="switchTab('transcript')"
            >
              转录文本
            </view>
            <view 
              class="tab" 
              :class="{ active: activeTab === 'ai-preview' }"
              @click="switchTab('ai-preview')"
            >
              AI编辑预览
            </view>
          </view>

          <!-- 文本显示区域 -->
          <view class="text-content">
            {{ activeTab === 'transcript' ? messageData.transcript : messageData.aiPreview }}
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 固定在底部的工具栏 -->
    <view class="fixed-bottom">
      <view class="bottom-toolbar">
        <view 
          v-for="(item, index) in toolbarItems" 
          :key="index"
          class="toolbar-item"
          :class="[
            { active: item.isActive }, 
            `toolbar-item-${item.type}`
          ]"
          @click="handleToolClick(item)"
        >
          <view class="toolbar-icon-wrapper">
            <text class="fa" :class="item.icon"></text>
          </view>
          <text class="toolbar-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 选项弹窗 -->
    <view class="popup-wrapper" v-if="showPopup" @click="closePopup">
      <view 
        class="popup-content" 
        @click.stop 
        :class="`popup-type-${currentTool.type}`"
      >
        <view class="popup-header">
          <text class="popup-title">{{ currentTool.label }}</text>
          <view class="close-btn" @click="closePopup">
            <text class="fa fa-xmark"></text>
          </view>
        </view>
        <scroll-view 
          class="popup-scroll" 
          scroll-y 
          :style="{ maxHeight: '60vh' }"
        >
          <view class="options-list">
            <view 
              v-for="(option, index) in currentTool.options" 
              :key="index"
              class="option-item"
              :class="{ active: currentTool.selected === option.value }"
              @click="selectOption(option)"
            >
              <view class="option-icon">
                <text class="fa" :class="option.icon"></text>
              </view>
              <text class="option-label">{{ option.label }}</text>
              <text class="fa fa-check check-icon" v-if="currentTool.selected === option.value"></text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 模拟消息数据
const messageData = ref({
  image: '/static/refdiagrams/test1.jpg',
  transcript: '这是一段示例文本，展示从语音转录得到的内容。在实际应用中，这里会显示用户录音转录后的详细文本。这里可以显示更多的文本内容，用户可以通过滚动查看。'.repeat(10),
  aiPreview: '这是AI编辑后的预览文本，展示经过AI处理后的优化内容。在实际应用中，这里会显示AI处理后的文本效果。'.repeat(10)
});

// 播放器状态
const isPlaying = ref(false);
const progress = ref(0);
const currentTime = ref(0);
const duration = ref(45);
const activeTab = ref('transcript');
const scrollTop = ref(0);
const popup = ref(null);

// 弹窗状态
const showPopup = ref(false);

// 当前工具状态
const currentTool = ref({
  type: '',
  label: '',
  options: [],
  selected: ''
});

// 底部工具栏配置
const toolbarItems = [
  {
    type: 'style',
    label: 'AI风格转换',
    icon: 'fa fa-magic',
    isActive: false,
    options: [
      { label: '轻松活泼', value: 'casual', icon: 'fa fa-sun-o' },
      { label: '幽默风格', value: 'humor', icon: 'fa fa-smile-o' },
      { label: '叙事风格', value: 'narrative', icon: 'fa fa-book' },
      { label: '诗歌风格', value: 'poetry', icon: 'fa fa-feather' }
    ]
  },
  {
    type: 'emotion',
    label: '情感调整',
    icon: 'fa fa-heart',
    isActive: false,
    options: [
      { label: '积极正面', value: 'positive', icon: 'fa fa-sun-o' },
      { label: '温和平静', value: 'calm', icon: 'fa fa-moon-o' },
      { label: '热情洋溢', value: 'enthusiastic', icon: 'fa fa-fire' },
      { label: '严肃正式', value: 'serious', icon: 'fa fa-university' }
    ]
  },
  {
    type: 'length',
    label: '长度调整',
    icon: 'fa fa-arrows-v',
    isActive: false,
    options: [
      { label: '精简版本', value: 'brief', icon: 'fa fa-compress' },
      { label: '标准版本', value: 'standard', icon: 'fa fa-equals' },
      { label: '详细版本', value: 'detailed', icon: 'fa fa-expand' }
    ]
  },
  {
    type: 'more',
    label: '更多',
    icon: 'fa fa-ellipsis',
    isActive: false,
    options: [
      { label: '保存草稿', value: 'save', icon: 'fa fa-floppy-disk' },
      { label: '复制文本', value: 'copy', icon: 'fa fa-copy' },
      { label: '分享', value: 'share', icon: 'fa fa-share-alt' }
    ]
  }
];

// 格式化时间
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 播放控制
function togglePlay() {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    startPlayback();
  } else {
    pausePlayback();
  }
}

// 进度条控制
function onProgressChange(e) {
  progress.value = e.detail.value;
  currentTime.value = (duration.value * progress.value) / 100;
}

// 切换标签
function switchTab(tab) {
  activeTab.value = tab;
  scrollTop.value = 0;
}

// 处理工具点击
function handleToolClick(item) {
  currentTool.value = {
    type: item.type,
    label: item.label,
    options: item.options,
    selected: ''
  };
  showPopup.value = true;
}

// 选择选项
function selectOption(option) {
  // 更新选中状态
  currentTool.value.selected = option.value;
  
  // 切换到AI编辑预览
  activeTab.value = 'ai-preview';
  
  // 关闭弹窗
  closePopup();
  
  // 显示提示
  uni.showToast({
    title: `已应用${option.label}`,
    icon: 'none'
  });
}

// 关闭弹窗
function closePopup() {
  showPopup.value = false;
}

// 滚动处理
function onScroll(e) {
  requestAnimationFrame(() => {
    scrollTop.value = e.detail.scrollTop;
  });
}

// 播放控制相关函数
function startPlayback() {
  // 实现播放逻辑
}

function pausePlayback() {
  // 实现暂停逻辑
}
</script>

<style>
.edit-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
}

.main-content {
  flex: 1;
  overflow: hidden;
}

.page-container {
  padding: 16px 16px 80px;
}

/* 图片容器 */
.image-wrapper {
  margin-bottom: 16px;
}

.cover-image {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
}

/* 音频播放器 */
.audio-player {
  background-color: #F7F7F7;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.player-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-control {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #FED31B;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-control .fa {
  font-size: 16px;
  color: #FFFFFF;
}

.progress-container {
  flex: 1;
}

.progress-slider {
  margin: 0;
  padding: 0;
}

.time-info {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.time-info text {
  font-size: 12px;
  color: #999999;
}

/* 文本内容区域 */
.text-content-wrapper {
  background-color: #F7F7F7;
  border-radius: 12px;
  overflow: hidden;
}

.switch-tabs {
  display: flex;
  padding: 8px;
  gap: 8px;
  background-color: #FFFFFF;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 8px;
  font-size: 14px;
  color: #666666;
  background-color: #F7F7F7;
  border-radius: 6px;
}

.tab.active {
  color: #FED31B;
  background-color: #FFFFFF;
  font-weight: 500;
}

.text-content {
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #333333;
  background-color: #FFFFFF;
  min-height: 200px;
  -webkit-overflow-scrolling: touch;
  will-change: transform;
}

/* 固定底部工具栏 */
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  border-top: 1px solid #EEEEEE;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-toolbar {
  display: flex;
  justify-content: space-around;
  padding: 12px 16px;
}

/* 工具栏主题色 */
:root {
  --theme-style: #8B5CF6;
  --theme-emotion: #EC4899;
  --theme-length: #3B82F6;
  --theme-more: #10B981;
}

/* 固定底部工具栏 */
.toolbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  position: relative;
}

.toolbar-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-item .fa {
  font-size: 20px;
  color: #666666;
}

.toolbar-label {
  font-size: 12px;
  color: #666666;
}

/* 工具栏按钮主题色 */
.toolbar-item-style.active .toolbar-icon-wrapper {
  background-color: rgba(139, 92, 246, 0.1);
}

.toolbar-item-style.active .fa,
.toolbar-item-style.active .toolbar-label {
  color: var(--theme-style);
}

.toolbar-item-emotion.active .toolbar-icon-wrapper {
  background-color: rgba(236, 72, 153, 0.1);
}

.toolbar-item-emotion.active .fa,
.toolbar-item-emotion.active .toolbar-label {
  color: var(--theme-emotion);
}

.toolbar-item-length.active .toolbar-icon-wrapper {
  background-color: rgba(59, 130, 246, 0.1);
}

.toolbar-item-length.active .fa,
.toolbar-item-length.active .toolbar-label {
  color: var(--theme-length);
}

.toolbar-item-more.active .toolbar-icon-wrapper {
  background-color: rgba(16, 185, 129, 0.1);
}

.toolbar-item-more.active .fa,
.toolbar-item-more.active .toolbar-label {
  color: var(--theme-more);
}

/* 弹窗样式 */
.popup-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.popup-content {
  background-color: #FFFFFF;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  position: relative;
  padding-bottom: env(safe-area-inset-bottom);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #EEEEEE;
}

.popup-title {
  font-size: 17px;
  font-weight: 600;
  color: #333333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F7F7F7;
}

.close-btn .fa {
  font-size: 16px;
  color: #666666;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #F7F7F7;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.option-icon .fa {
  font-size: 18px;
  color: #666666;
  transition: all 0.3s ease;
}

.option-label {
  flex: 1;
  font-size: 15px;
  color: #333333;
  font-weight: 500;
}

/* 选项悬停和激活状态 - 根据工具类型应用对应的主题色 */
.popup-type-style .option-item.active {
  background-color: rgba(139, 92, 246, 0.1);
}

.popup-type-style .option-item.active .option-icon {
  background-color: var(--theme-style);
}

.popup-type-emotion .option-item.active {
  background-color: rgba(236, 72, 153, 0.1);
}

.popup-type-emotion .option-item.active .option-icon {
  background-color: var(--theme-emotion);
}

.popup-type-length .option-item.active {
  background-color: rgba(59, 130, 246, 0.1);
}

.popup-type-length .option-item.active .option-icon {
  background-color: var(--theme-length);
}

.popup-type-more .option-item.active {
  background-color: rgba(16, 185, 129, 0.1);
}

.popup-type-more .option-item.active .option-icon {
  background-color: var(--theme-more);
}

/* 选项图标颜色变化 */
.option-item.active .option-icon .fa {
  color: #FFFFFF;
}

/* 选中图标颜色 */
.popup-type-style .check-icon {
  color: var(--theme-style);
}

.popup-type-emotion .check-icon {
  color: var(--theme-emotion);
}

.popup-type-length .check-icon {
  color: var(--theme-length);
}

.popup-type-more .check-icon {
  color: var(--theme-more);
}
</style> 