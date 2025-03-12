<script setup>
// 无需props和emits
</script>

<template>
  <view class="empty-state">
    <view class="empty-icon-wrapper">
      <text class="fa fa-image"></text>
    </view>
    <text class="empty-text">暂无照片，点击下方按钮添加</text>
  </view>
</template>

<style>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon-wrapper .fa {
  font-size: 40px;
  color: #CCCCCC;
}

.empty-text {
  font-size: 15px;
  color: #999999;
  text-align: center;
  line-height: 1.5;
}
</style> 