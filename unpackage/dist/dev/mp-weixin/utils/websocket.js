"use strict";
const common_vendor = require("../common/vendor.js");
class WebSocketManager {
  constructor() {
    this.ws = null;
    this.userId = null;
    this.deviceId = null;
    this.baseUrl = null;
    this.previewUrlCache = null;
    this.heartbeatTimer = null;
    this.HEARTBEAT_INTERVAL = 2e4;
    this.reconnectTimer = null;
    this.reconnectCount = 0;
    this.MAX_RECONNECT = 3;
    this.RECONNECT_DELAY = 3e3;
    this.isConnecting = false;
    this.isInitialized = false;
    this.isClosing = false;
    this.MESSAGE_TYPES = {
      HEARTBEAT: "HEARTBEAT",
      PREVIEW_REQUEST: "PREVIEW_REQUEST",
      PREVIEW_RESPONSE: "PREVIEW_RESPONSE",
      DEVICE_STATUS: "DEVICE_STATUS"
    };
  }
  /**
   * 初始化WebSocket管理器
   * @param {Object} config 配置对象
   * @param {string} config.userId 用户ID
   * @param {string} config.deviceId 设备ID
   * @param {Map} config.previewUrlCache 预览图缓存
   * @param {string} [config.baseUrl] WebSocket服务器地址
   */
  init(config) {
    const {
      userId,
      deviceId,
      previewUrlCache,
      // baseUrl = 'ws://119.45.18.3:789/photograph'
      baseUrl = "ws://localhost:789/photograph"
    } = config;
    if (this.isInitialized) {
      console.log("WebSocket已经初始化过");
      return;
    }
    if (!userId || !deviceId || !previewUrlCache) {
      throw new Error("缺少必要的初始化参数");
    }
    this.userId = userId;
    this.deviceId = deviceId;
    this.baseUrl = baseUrl;
    this.previewUrlCache = previewUrlCache;
    this.isInitialized = true;
    this.connect();
  }
  /**
   * 建立WebSocket连接
   */
  connect() {
    if (this.isConnecting || this.ws)
      return;
    try {
      this.isConnecting = true;
      const wsUrl = `${this.baseUrl}/ws/miniprogram/${this.userId}`;
      this.ws = common_vendor.index.connectSocket({
        url: wsUrl,
        success: () => console.log("WebSocket连接创建成功"),
        fail: (error) => console.error("WebSocket连接创建失败:", error)
      });
      this.setupEventListeners();
    } catch (error) {
      console.error("建立WebSocket连接失败:", error);
      this.isConnecting = false;
      this.reconnect();
    }
  }
  /**
   * 设置WebSocket事件监听
   */
  setupEventListeners() {
    if (!this.ws)
      return;
    this.ws.onOpen(() => {
      console.log("WebSocket连接已打开");
      this.isConnecting = false;
      this.reconnectCount = 0;
      this.startHeartbeat();
    });
    this.ws.onMessage((res) => {
      try {
        this.handleMessage(res.data);
      } catch (error) {
        console.error("处理消息失败:", error);
      }
    });
    this.ws.onClose((res) => {
      console.log("WebSocket连接已关闭:", res);
      this.cleanup();
      if (!this.isClosing) {
        this.reconnect();
      }
    });
    this.ws.onError((error) => {
      console.error("WebSocket错误:", error);
      this.cleanup();
      this.reconnect();
    });
  }
  /**
   * 启动心跳
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.isConnected()) {
        this.sendMessage({
          fromId: this.userId,
          type: "HEARTBEAT"
        });
      } else {
        this.stopHeartbeat();
      }
    }, this.HEARTBEAT_INTERVAL);
  }
  /**
   * 停止心跳
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  /**
   * 重连机制
   */
  reconnect() {
    if (this.reconnectCount >= this.MAX_RECONNECT) {
      console.error("重连次数超过上限");
      return;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      console.log(`第${this.reconnectCount + 1}次重连`);
      this.reconnectCount++;
      this.connect();
    }, this.RECONNECT_DELAY * Math.pow(2, this.reconnectCount));
  }
  /**
   * 发送消息
   * @param {Object} message 消息对象
   */
  sendMessage(message) {
    if (!this.ws || !this.isConnected()) {
      console.error("WebSocket未连接");
      return;
    }
    try {
      const messageStr = JSON.stringify({
        ...message,
        content: typeof message.content === "object" ? JSON.stringify(message.content) : message.content,
        // 确保 content 是字符串
        messageId: this.generateMessageId(),
        timestamp: Date.now()
      });
      this.ws.send({
        data: messageStr,
        success: () => console.log("消息发送成功"),
        fail: (error) => console.error("消息发送失败:", error)
      });
    } catch (error) {
      console.error("发送消息失败:", error);
    }
  }
  /**
   * 生成消息ID
   */
  generateMessageId() {
    return `${this.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * 处理接收到的消息
   * @param {string} data 消息数据
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      if (message.type === this.MESSAGE_TYPES.HEARTBEAT) {
        return;
      }
      if (message.type === this.MESSAGE_TYPES.PREVIEW_RESPONSE) {
        this.handlePreviewResponse(message);
      }
      if (message.type === this.MESSAGE_TYPES.DEVICE_STATUS) {
        this.handleDeviceStatus(message);
      }
    } catch (error) {
      console.error("处理消息失败:", error);
    }
  }
  /**
   * 处理预览响应
   */
  handlePreviewResponse(message) {
    try {
      const response = JSON.parse(message.content);
      if (response.status === "SUCCESS") {
        const expireTime = this.parseExpirationFromUrl(response.signedUrl);
        this.previewUrlCache.set(response.thumbId, {
          signedUrl: response.signedUrl,
          expireTime
        });
        common_vendor.index.$emit("previewImageUpdated", {
          thumbId: response.thumbId,
          signedUrl: response.signedUrl
        });
      }
    } catch (error) {
      console.error("处理预览响应失败:", error);
    }
  }
  /**
   * 处理设备状态变更
   */
  handleDeviceStatus(message) {
    try {
      const statusData = JSON.parse(message.content);
      common_vendor.index.$emit("deviceStatusChanged", {
        deviceId: statusData.deviceId,
        online: statusData.online
      });
    } catch (error) {
      console.error("处理设备状态变更失败:", error);
    }
  }
  /**
   * 从URL中解析过期时间
   */
  parseExpirationFromUrl(url) {
    try {
      const queryString = url.split("?")[1];
      if (!queryString) {
        throw new Error("URL没有参数部分");
      }
      const params = queryString.split("&").reduce((acc, param) => {
        const [key, value] = param.split("=");
        acc[key] = value;
        return acc;
      }, {});
      const expires = params["Expires"];
      if (!expires) {
        throw new Error("URL中没有Expires参数");
      }
      return parseInt(expires) * 1e3;
    } catch (error) {
      console.error("解析URL过期时间失败:", error);
      return Date.now() + 3600 * 1e3;
    }
  }
  /**
   * 清理资源
   */
  cleanup() {
    this.stopHeartbeat();
    this.ws = null;
    this.isConnecting = false;
  }
  /**
   * 关闭连接
   */
  close() {
    this.isClosing = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close({
        success: () => console.log("WebSocket连接已主动关闭"),
        fail: (error) => console.error("关闭WebSocket连接失败:", error)
      });
      this.ws = null;
    }
    this.isClosing = false;
  }
  /**
   * 检查连接状态
   */
  isConnected() {
    return this.ws && !this.isConnecting;
  }
  /**
   * 重置连接状态
   */
  reset() {
    this.isInitialized = false;
    this.isClosing = false;
    this.reconnectCount = 0;
    this.close();
  }
}
const wsManager = new WebSocketManager();
exports.wsManager = wsManager;
