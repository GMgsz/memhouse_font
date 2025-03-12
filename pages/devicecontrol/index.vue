<template>
  <view class="device-control">
    <!-- 顶部设备信息 -->
    <view class="device-info">
      <view class="power-section">
        <switch 
          :checked="power" 
          @change="togglePower" 
          color="#FED31B"
          class="power-switch"
        />
        <text class="power-label">电源</text>
      </view>
      <view class="device-id">
        <text class="id-label">03</text>
      </view>
    </view>

    <!-- 频谱控制旋钮 -->
    <view class="brightness-control">
      <view 
        class="control-knob"
        @touchstart="startRotate"
        @touchmove="rotate"
        @touchend="endRotate"
      >
        <view 
          class="knob-indicator"
          :style="{transform: 'rotate(' + rotation + 'deg)'}"
        ></view>
        <text class="control-label">频谱调节</text>
      </view>
      
      <!-- 音量控制 -->
      <view class="volume-controls">
        <view class="volume-btn" @click="toggleMute">
          <text class="fa" :class="volumeIcon"></text>
        </view>
        <slider 
          class="volume-slider" 
          :value="volume" 
          @change="onVolumeChange"
          min="0"
          max="100"
          activeColor="#FED31B"
          backgroundColor="#EEEEEE"
          block-size="12"
        />
        <view class="volume-btn">
          <text class="fa fa-volume-up"></text>
        </view>
      </view>
    </view>

    <!-- 控制按钮组 -->
    <view class="control-buttons">
      <button class="control-btn">
        <text>画面调节</text>
      </button>
      <button class="control-btn">
        <text>色彩调节</text>
      </button>
      <button class="control-btn">
        <text>其他调节</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 状态管理
const power = ref(false)
const volume = ref(50)
const rotation = ref(0)
const isMuted = ref(false)
const lastVolume = ref(50)

// 计算音量图标
const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) {
    return 'fa-volume-off'
  } else if (volume.value < 50) {
    return 'fa-volume-down'
  } else {
    return 'fa-volume-up'
  }
})

// 旋钮控制相关变量
let startAngle = 0
let currentAngle = 0
let isDragging = false

// 开始旋转
function startRotate(event) {
  const touch = event.touches[0]
  const knob = event.currentTarget
  const rect = knob.getBoundingClientRect()
  const center = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
  
  startAngle = Math.atan2(
    touch.clientY - center.y,
    touch.clientX - center.x
  ) * 180 / Math.PI
  
  isDragging = true
  currentAngle = rotation.value
}

// 旋转中
function rotate(event) {
  if (!isDragging) return
  
  const touch = event.touches[0]
  const knob = event.currentTarget
  const rect = knob.getBoundingClientRect()
  const center = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
  
  const angle = Math.atan2(
    touch.clientY - center.y,
    touch.clientX - center.x
  ) * 180 / Math.PI
  
  let deltaAngle = angle - startAngle
  
  rotation.value = (currentAngle + deltaAngle + 360) % 360
}

// 结束旋转
function endRotate() {
  isDragging = false
}

// 静音切换
function toggleMute() {
  if (isMuted.value) {
    volume.value = lastVolume.value
    isMuted.value = false
  } else {
    lastVolume.value = volume.value
    volume.value = 0
    isMuted.value = true
  }
}

// 音量调节
function onVolumeChange(event) {
  volume.value = event.detail.value
  if (volume.value > 0) {
    isMuted.value = false
  }
}

// 电源开关
function togglePower(event) {
  power.value = event.detail.value
}
</script>

<style>
.device-control {
  min-height: 100vh;
  background-color: #FFFFFF;
  padding: 16px;
}

/* 设备信息样式 */
.device-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.power-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.power-label {
  font-size: 15px;
  color: #333333;
}

.device-id {
  background-color: #F7F7F7;
  padding: 4px 12px;
  border-radius: 16px;
}

.id-label {
  font-size: 14px;
  color: #666666;
}

/* 亮度控制样式 */
.brightness-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.control-knob {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: #F7F7F7;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  touch-action: none;
}

.knob-indicator {
  width: 4px;
  height: 80px;
  background-color: #FED31B;
  position: absolute;
  top: 20px;
  transform-origin: bottom center;
  transition: transform 0.05s linear;
  border-radius: 4px;
}

.control-label {
  font-size: 17px;
  color: #333333;
  position: absolute;
  bottom: -30px;
}

/* 音量控制样式 */
.volume-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 300px;
  margin-top: 48px;
}

.volume-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.volume-btn .fa {
  font-size: 20px;
  color: #666666;
  transition: color 0.3s ease;
}

.volume-btn:active .fa {
  color: #FED31B;
}

.volume-slider {
  flex: 1;
  margin: 0 8px;
}

/* 控制按钮组样式 */
.control-buttons {
  display: flex;
  gap: 8px;
  margin-top: 32px;
}

.control-btn {
  flex: 1;
  height: 40px;
  background-color: #F7F7F7;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #666666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.control-btn:active {
  background-color: #EEEEEE;
}
</style> 