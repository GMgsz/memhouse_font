"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_websocket = require("./utils/websocket.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/devicecontrol/index.js";
  "./pages/message/index.js";
  "./pages/album/index.js";
  "./pages/message/edit.js";
}
const _sfc_main = {
  globalData: {
    userId: "user123",
    // 模拟用户ID
    deviceId: "123456",
    // 模拟设备ID
    wsManager: null,
    previewUrlCache: /* @__PURE__ */ new Map(),
    // 预览图URL缓存
    // 解析URL过期时间
    parseExpirationFromUrl(url) {
      try {
        const queryString = url.split("?")[1];
        if (!queryString) {
          return Date.now() + 3600 * 1e3;
        }
        const params = queryString.split("&").reduce((acc, param) => {
          const [key, value] = param.split("=");
          acc[key] = value;
          return acc;
        }, {});
        const expires = params["Expires"];
        if (!expires) {
          return Date.now() + 3600 * 1e3;
        }
        return parseInt(expires) * 1e3;
      } catch (error) {
        console.error("解析URL过期时间失败:", error);
        return Date.now() + 3600 * 1e3;
      }
    },
    // 获取预览图URL（带缓存）
    async getPreviewUrl(thumbInfo) {
      this.cleanExpiredCache();
      const cached = this.previewUrlCache.get(thumbInfo.thumbId);
      if (cached && cached.expireTime > Date.now()) {
        return cached.signedUrl;
      }
      this.wsManager.sendMessage({
        type: "PREVIEW_REQUEST",
        content: {
          thumbId: thumbInfo.thumbId,
          thumbLocalPath: thumbInfo.thumbLocalPath,
          deviceId: this.deviceId
        }
      });
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          common_vendor.index.$off("previewImageUpdated", handler);
          reject(new Error("获取预览图超时"));
        }, 3e4);
        const handler = (data) => {
          if (data.thumbId === thumbInfo.thumbId) {
            clearTimeout(timeout);
            common_vendor.index.$off("previewImageUpdated", handler);
            resolve(data.signedUrl);
          }
        };
        common_vendor.index.$on("previewImageUpdated", handler);
      });
    },
    // 清理过期缓存
    cleanExpiredCache() {
      if (!this.previewUrlCache)
        return;
      const now = Date.now();
      for (const [key, value] of this.previewUrlCache) {
        if (value.expireTime <= now) {
          this.previewUrlCache.delete(key);
        }
      }
    }
  },
  onLaunch: function() {
    console.log("App Launch");
    this.initWebSocket();
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  },
  methods: {
    // 初始化WebSocket
    initWebSocket() {
      this.globalData.wsManager = utils_websocket.wsManager;
      utils_websocket.wsManager.init({
        userId: this.globalData.userId,
        deviceId: this.globalData.deviceId,
        previewUrlCache: this.globalData.previewUrlCache
      });
    }
  }
};
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Project/Front/memhouse_font_new/App.vue"]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
