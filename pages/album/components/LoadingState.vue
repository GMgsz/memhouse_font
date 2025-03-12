<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: true
  },
  isEmpty: {
    type: Boolean,
    default: false
  },
  loadingStatus: {
    type: String,
    default: 'more' // 'more', 'loading', 'noMore'
  }
});
</script>

<template>
  <view>
    <!-- 加载中 -->
    <view v-if="loadingStatus === 'loading'" class="loading-more">
      <text class="fa fa-spinner fa-spin loading-icon"></text>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 没有更多数据 -->
    <view v-if="loadingStatus === 'noMore' && !isEmpty" class="no-more">
      <text class="no-more-text">没有更多照片了</text>
    </view>
  </view>
</template>

<style>
/* 加载状态 */
.loading-more,
.no-more {
  text-align: center;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  font-size: 24px;
  color: #FED31B;
  margin-bottom: 8px;
}

.loading-text,
.no-more-text {
  font-size: 14px;
  color: #999999;
}

.no-more {
  position: relative;
  padding: 20px 0;
}

.no-more:before,
.no-more:after {
  content: "";
  position: absolute;
  top: 50%;
  width: 20%;
  height: 1px;
  background-color: #EEEEEE;
}

.no-more:before {
  left: 20%;
}

.no-more:after {
  right: 20%;
}
</style> 