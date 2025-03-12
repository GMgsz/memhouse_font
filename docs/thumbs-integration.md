# 缩略图功能集成文档

## 1. 功能概述

缩略图模块主要实现以下功能：
- 按日期分组展示缩略图列表
- 支持图片预览
- 支持图片原图下载及缓存
- WebSocket长连接实时通信
- 设备状态监控
- URL签名过期管理

## 2. 核心模块

### 2.1 WebSocket管理器

#### 主要功能
- 连接管理：自动建立连接、断线重连
- 心跳检测：定时发送心跳包
- 消息处理：统一的消息收发接口

#### 初始化配置
```javascript
wsManager.init({
    userId: 'xxx',
    deviceId: 'xxx',
    previewUrlCache: new Map()
});
```

#### 消息类型
- HEARTBEAT: 心跳包
- PREVIEW_REQUEST: 预览请求
- PREVIEW_RESPONSE: 预览响应
- DEVICE_STATUS: 设备状态

### 2.2 预览图片缓存机制

#### 缓存结构
```javascript
previewUrlCache.set(thumbId, {
    signedUrl: 'xxx',
    expireTime: timestamp
});
```

#### URL过期管理
- 提前5分钟更新即将过期的URL
- 批量更新机制
- 定时清理过期缓存

### 2.3 设备状态监控

#### 状态检查
```javascript
async function checkDeviceStatus() {
    const res = await request({
        url: '/photograph/api/check_device',
        method: 'GET',
        data: { deviceId }
    });
    return res.data;
}
```

#### 状态变更通知
- WebSocket实时推送设备状态
- 统一的状态变更事件处理

## 3. API接口

### 3.1 缩略图列表
```javascript
GET /photograph/thumbs/device/{deviceId}/page
Params: {
    current: number,
    size: number
}
```

### 3.2 批量更新签名URL
```javascript
POST /photograph/api/batch_update_signed_urls
Body: {
    thumbInfos: [{
        thumbId: string,
        thumbOssPath: string
    }]
}
```

### 3.3 设备状态检查
```javascript
GET /photograph/api/check_device
Params: {
    deviceId: string
}
```

## 4. 事件处理

### 4.1 预览图片更新
```javascript
uni.$on('previewImageUpdated', (data) => {
    const { thumbId, signedUrl } = data;
    // 处理预览图更新
});
```

### 4.2 设备状态变更
```javascript
uni.$on('deviceStatusChanged', (data) => {
    const { deviceId, online } = data;
    // 处理设备状态变更
});
```

## 5. UI组件实现

### 5.1 相册列表组件

```javascript
// components/album/ThumbList.vue
export default {
    data() {
        return {
            thumbGroups: [],
            loading: false,
            current: 1,
            size: 20
        }
    },
    methods: {
        async loadThumbList() {
            this.loading = true;
            try {
                const res = await this.$request({
                    url: `/photograph/thumbs/device/${this.deviceId}/page`,
                    method: 'GET',
                    data: { current: this.current, size: this.size }
                });
                this.processThumbGroups(res.data.records);
            } finally {
                this.loading = false;
            }
        },
        processThumbGroups(records) {
            // 按日期分组处理
            const groups = {};
            records.forEach(item => {
                const date = this.$dayjs(item.createTime).format('YYYY-MM-DD');
                if (!groups[date]) groups[date] = [];
                groups[date].push(item);
            });
            this.thumbGroups = Object.entries(groups).map(([date, items]) => ({
                date,
                items
            }));
        }
    }
}
```

### 5.2 图片预览组件

```javascript
// components/album/ImagePreview.vue
export default {
    props: {
        visible: Boolean,
        initialIndex: Number,
        images: Array
    },
    data() {
        return {
            currentIndex: this.initialIndex || 0
        }
    },
    methods: {
        async loadImage(thumb) {
            const cache = this.$app.globalData.previewUrlCache.get(thumb.id);
            if (cache && cache.expireTime > Date.now()) {
                return cache.signedUrl;
            }
            // 请求新的签名URL
            const res = await this.$request({
                url: '/photograph/api/batch_update_signed_urls',
                method: 'POST',
                data: {
                    thumbInfos: [{
                        thumbId: thumb.id,
                        thumbOssPath: thumb.ossPath
                    }]
                }
            });
            const signedUrl = res.data[0].signedUrl;
            this.$app.globalData.previewUrlCache.set(thumb.id, {
                signedUrl,
                expireTime: Date.now() + 3600000 // 1小时过期
            });
            return signedUrl;
        }
    }
}
```

## 6. 数据模型映射

### 6.1 缩略图数据模型

```typescript
interface ThumbInfo {
    id: string;           // 缩略图ID
    deviceId: string;     // 设备ID
    ossPath: string;      // OSS存储路径
    createTime: string;   // 创建时间
    width: number;        // 图片宽度
    height: number;       // 图片高度
    size: number;        // 文件大小
}
```

### 6.2 设备状态模型

```typescript
interface DeviceStatus {
    deviceId: string;     // 设备ID
    online: boolean;      // 在线状态
    lastHeartbeat: string;// 最后心跳时间
    battery: number;      // 电池电量
    storage: number;      // 存储空间
}
```

## 7. 集成步骤

1. 复制核心工具类
   - websocket.js：WebSocket管理器
   - request.js：HTTP请求封装
   - dayjs.js：日期处理工具

2. 初始化WebSocket
   ```javascript
   // App.vue
   import wsManager from '@/utils/websocket.js'
   
   export default {
       globalData: {
           wsManager,
           previewUrlCache: new Map()
       },
       onLaunch() {
           wsManager.init({
               userId,
               deviceId,
               previewUrlCache
           });
       }
   }
   ```

3. 集成UI组件
   - 复制并注册ThumbList和ImagePreview组件
   - 配置相关路由
   - 实现页面布局和样式
   - 添加必要的状态管理

## 8. 迁移注意事项

### 8.1 性能优化

1. 图片懒加载
   - 使用虚拟列表优化大量图片渲染
   - 实现图片预加载机制
   - 合理设置缓存策略

2. WebSocket优化
   - 实现断线重连机制
   - 消息队列处理
   - 心跳包间隔调整

### 8.2 兼容性处理

1. 图片格式兼容
   - 支持HEIC格式转换
   - 处理图片方向信息
   - 适配不同分辨率

2. 网络状态适配
   - 弱网环境下的加载策略
   - 离线模式支持
   - 断点续传机制

### 8.3 潜在问题处理

1. URL过期处理
   ```javascript
   // 监听URL过期事件
   wsManager.on('urlExpired', async (thumbIds) => {
       await batchUpdateSignedUrls(thumbIds);
       // 触发UI更新
       uni.$emit('previewUrlsUpdated', thumbIds);
   });
   ```

2. 设备离线处理
   ```javascript
   // 设备离线后的UI处理
   export function handleDeviceOffline(deviceId) {
       // 更新UI状态
       store.commit('updateDeviceStatus', {
           deviceId,
           online: false
       });
       // 显示离线提示
       uni.showToast({
           title: '设备已离线',
           icon: 'none'
       });
   }
   ```

3. 内存管理
   ```javascript
   // 定期清理过期缓存
   function cleanExpiredCache() {
       const now = Date.now();
       for (const [key, value] of previewUrlCache) {
           if (value.expireTime < now) {
               previewUrlCache.delete(key);
           }
       }
   }
   ```

### 8.4 新功能扩展

1. 批量操作
   - 多选删除
   - 批量下载
   - 分享功能

2. 智能分类
   - 按拍摄地点分组
   - 人脸识别分类
   - 场景识别

3. 搜索功能
   - 按日期范围搜索
   - 按拍摄地点搜索
   - 图片内容搜索

## 6. 注意事项

1. WebSocket连接管理
   - 确保断线重连机制正常工作
   - 合理设置心跳间隔
   - 处理异常情况

2. 缓存管理
   - 定期清理过期缓存
   - 合理设置缓存更新阈值
   - 避免内存泄漏

3. 错误处理
   - 网络异常处理
   - 设备离线处理
   - 加载失败重试机制

4. 性能优化
   - 使用懒加载
   - 合理的批量更新策略
   - 避免频繁的状态检查