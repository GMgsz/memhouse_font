"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_date = require("../../utils/date.js");
const PhotoItem = () => "./components/PhotoItem.js";
const AlbumToolbar = () => "./components/AlbumToolbar.js";
const DateGroup = () => "./components/DateGroup.js";
const EmptyState = () => "./components/EmptyState.js";
const LoadingState = () => "./components/LoadingState.js";
const PhotoPreview = () => "./components/PhotoPreview.js";
const _sfc_main = {
  components: {
    PhotoItem,
    AlbumToolbar,
    DateGroup,
    EmptyState,
    LoadingState,
    PhotoPreview
  },
  data() {
    return {
      // 照片数据
      photoList: [],
      loading: false,
      hasMore: true,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pages: 0,
      loadingStatus: "more",
      // 加载状态
      // 设备ID
      deviceId: getApp().globalData.deviceId,
      // 选择模式相关
      isSelectMode: false,
      selectedPhotos: [],
      // 预览相关
      previewVisible: false,
      currentPreviewPhoto: null,
      previewLoading: false,
      currentPreviewId: null,
      showOriginal: false,
      isDownloadingOriginal: false,
      // URL更新相关
      urlRefreshThreshold: 5 * 60 * 1e3,
      // 设置提前5分钟更新URL
      urlExpirationMap: /* @__PURE__ */ new Map(),
      // 存储URL过期时间
      urlUpdateInterval: null
      // 用于存储定时器
    };
  },
  computed: {
    // 按日期分组的照片数据
    groupedPhotos() {
      return utils_date.dateUtil.groupPhotosByDate(this.photoList, "uploadTime");
    }
  },
  // 页面生命周期函数
  onLoad() {
    console.log("页面加载，初始化数据");
    this.loadPhotos(1, true);
    this.setupEventListeners();
    this.urlUpdateInterval = setInterval(() => {
      this.checkAndUpdateUrls();
    }, 6e4);
  },
  onUnload() {
    this.cleanupEventListeners();
    if (this.urlUpdateInterval) {
      clearInterval(this.urlUpdateInterval);
    }
  },
  onReachBottom() {
    console.log("触发底部加载", {
      hasMore: this.hasMore,
      isLoading: this.loading,
      currentPage: this.currentPage,
      totalPages: this.pages
    });
    if (!this.hasMore || this.loading) {
      console.log("无法加载更多:", {
        hasMore: this.hasMore,
        isLoading: this.loading,
        currentPage: this.currentPage,
        totalPages: this.pages
      });
      return;
    }
    this.currentPage++;
    console.log("开始加载下一页:", this.currentPage);
    this.loadPhotos(this.currentPage);
  },
  onPullDownRefresh() {
    console.log("触发下拉刷新");
    this.currentPage = 1;
    this.loadPhotos(1, true).then(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  methods: {
    // 加载照片数据
    async loadPhotos(page = 1, refresh = false) {
      var _a;
      if (this.loading)
        return;
      try {
        this.loading = true;
        this.loadingStatus = "loading";
        console.log(`开始加载第 ${page} 页数据`);
        const res = await utils_request.requestUtil.request({
          url: `/photograph/thumbs/device/${this.deviceId}/page`,
          method: "GET",
          data: {
            current: page,
            size: this.pageSize
          }
        });
        console.log("API返回数据:", res.data);
        if ((_a = res.data) == null ? void 0 : _a.data) {
          const { records, total: totalCount, pages: totalPages, current } = res.data.data;
          console.log(`获取到数据: 当前页 ${current}, 总页数 ${totalPages}, 总记录数 ${totalCount}, 记录数量 ${(records == null ? void 0 : records.length) || 0}`);
          if (records && records.length > 0) {
            const processedRecords = await this.processThumbsData(records);
            if (refresh) {
              this.photoList = processedRecords;
            } else {
              const newData = processedRecords.filter(
                (newItem) => !this.photoList.some(
                  (existingItem) => existingItem.thumbId === newItem.thumbId
                )
              );
              this.photoList = [...this.photoList, ...newData];
            }
            this.total = totalCount;
            this.pages = totalPages;
            this.hasMore = page < totalPages;
            console.log(`更新hasMore状态: ${this.hasMore}, 当前页 ${page}, 总页数 ${totalPages}`);
            this.loadingStatus = this.hasMore ? "more" : "noMore";
          } else {
            console.log("没有获取到记录或记录为空");
            this.hasMore = false;
            this.loadingStatus = "noMore";
          }
        } else {
          console.error("API返回数据格式不正确:", res.data);
          this.hasMore = false;
          this.loadingStatus = "noMore";
        }
      } catch (error) {
        console.error("加载失败:", error);
        this.loadingStatus = "more";
      } finally {
        this.loading = false;
      }
    },
    // 处理缩略图数据，添加签名URL
    async processThumbsData(records) {
      return records.map((record) => {
        let uploadTime = record.uploadTime;
        if (typeof uploadTime === "string" && uploadTime.includes(" ")) {
          uploadTime = utils_date.dateUtil.safeParseDate(uploadTime);
        }
        return {
          ...record,
          id: record.thumbId,
          // 为了兼容新UI的id字段
          url: record.signedUrl,
          // 为了兼容新UI的url字段
          size: record.fileSize || "未知大小",
          // 为了兼容新UI的size字段
          date: uploadTime,
          // 为了兼容新UI的date字段
          uploadTime
          // 确保uploadTime是安全的日期对象
        };
      });
    },
    // 进入选择模式
    enterSelectMode() {
      this.isSelectMode = true;
      this.selectedPhotos = [];
    },
    // 退出选择模式
    exitSelectMode() {
      this.isSelectMode = false;
      this.selectedPhotos = [];
    },
    // 选择/取消选择照片
    toggleSelectPhoto(photo) {
      const index = this.selectedPhotos.findIndex((item) => item.id === photo.id);
      if (index > -1) {
        this.selectedPhotos.splice(index, 1);
      } else {
        if (this.selectedPhotos.length < 10) {
          this.selectedPhotos.push(photo);
        } else {
          common_vendor.index.showToast({
            title: "最多只能选择10张照片",
            icon: "none"
          });
        }
      }
    },
    // 检查照片是否被选中
    isPhotoSelected(photo) {
      return this.selectedPhotos.some((item) => item.id === photo.id);
    },
    // 预览照片
    previewPhoto(photo) {
      if (this.isSelectMode) {
        this.toggleSelectPhoto(photo);
        return;
      }
      try {
        this.currentPreviewPhoto = { ...photo };
        this.previewVisible = true;
        this.showOriginal = false;
      } catch (error) {
        console.error("预览照片出错:", error);
        common_vendor.index.showToast({
          title: "预览照片出错",
          icon: "none"
        });
      }
    },
    // 关闭预览
    closePreview() {
      this.previewVisible = false;
      this.currentPreviewPhoto = null;
      this.showOriginal = false;
      this.isDownloadingOriginal = false;
    },
    // 检查设备在线状态方法
    async checkDeviceStatus() {
      try {
        const res = await utils_request.requestUtil.request({
          url: "/photograph/api/check_device",
          method: "GET",
          data: {
            deviceId: this.deviceId
          }
        });
        return res.data;
      } catch (err) {
        console.error("检查设备状态失败:", err);
        return false;
      }
    },
    // 查看原图（即原项目中的预览图功能）
    async viewOriginalPhoto() {
      if (this.isDownloadingOriginal)
        return;
      try {
        this.isDownloadingOriginal = true;
        const isDeviceOnline = await this.checkDeviceStatus();
        if (!isDeviceOnline) {
          common_vendor.index.showToast({
            title: "设备不在线",
            icon: "none"
          });
          this.isDownloadingOriginal = false;
          return;
        }
        const wsManager = getApp().globalData.wsManager;
        if (!wsManager.isConnected()) {
          common_vendor.index.showToast({
            title: "网络连接异常，请重新进入小程序",
            icon: "none"
          });
          this.isDownloadingOriginal = false;
          return;
        }
        this.currentPreviewId = this.currentPreviewPhoto.thumbId;
        getApp().globalData.wsManager.sendMessage({
          type: "PREVIEW_REQUEST",
          content: {
            thumbId: this.currentPreviewPhoto.thumbId,
            thumbLocalPath: this.currentPreviewPhoto.thumbLocalPath,
            deviceId: getApp().globalData.deviceId
          }
        });
        common_vendor.index.$on("previewImageUpdated", this.handlePreviewUpdate);
      } catch (error) {
        console.error("获取原图失败:", error);
        common_vendor.index.showToast({
          title: error.message || "获取原图失败",
          icon: "none"
        });
        this.isDownloadingOriginal = false;
      }
    },
    // 处理预览图更新事件（接收WebSocket返回的预览URL）
    async handlePreviewUpdate(data) {
      try {
        if (this.currentPreviewId !== data.thumbId) {
          return;
        }
        if (this.currentPreviewPhoto) {
          this.currentPreviewPhoto.originalUrl = data.signedUrl;
          this.showOriginal = true;
        }
      } catch (error) {
        console.error("处理预览更新失败:", error);
        common_vendor.index.showToast({
          title: "预览失败",
          icon: "none"
        });
      } finally {
        this.isDownloadingOriginal = false;
      }
    },
    // 下载预览中的照片
    async downloadPreviewPhoto(photo) {
      if (!this.showOriginal) {
        await this.viewOriginalPhoto();
        const checkOriginalLoaded = () => {
          if (this.showOriginal) {
            this.startDownload();
          } else {
            setTimeout(checkOriginalLoaded, 500);
          }
        };
        checkOriginalLoaded();
        return;
      }
      this.startDownload();
    },
    // 开始下载
    startDownload() {
      common_vendor.index.showLoading({
        title: "下载中..."
      });
      const url = this.currentPreviewPhoto.originalUrl || this.currentPreviewPhoto.url;
      common_vendor.index.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode === 200) {
            common_vendor.index.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function() {
                common_vendor.index.showToast({
                  title: "保存成功",
                  icon: "success"
                });
              },
              fail: function() {
                common_vendor.index.showToast({
                  title: "保存失败",
                  icon: "none"
                });
              }
            });
          }
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "下载失败",
            icon: "none"
          });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    },
    // 分享预览中的照片
    sharePreviewPhoto(photo) {
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    },
    // 删除预览中的照片
    deletePreviewPhoto(photo) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这张照片吗？",
        success: (res) => {
          if (res.confirm) {
            this.photoList = this.photoList.filter((p) => p.id !== photo.id);
            this.closePreview();
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    },
    // 下载选中的照片
    downloadPhotos() {
      if (this.selectedPhotos.length === 0) {
        common_vendor.index.showToast({
          title: "请先选择照片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "下载中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "下载成功",
          icon: "success"
        });
      }, 1500);
    },
    // 分享选中的照片
    sharePhotos() {
      if (this.selectedPhotos.length === 0) {
        common_vendor.index.showToast({
          title: "请先选择照片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      });
    },
    // 删除选中的照片
    deletePhotos() {
      if (this.selectedPhotos.length === 0) {
        common_vendor.index.showToast({
          title: "请先选择照片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除选中的${this.selectedPhotos.length}张照片吗？`,
        success: (res) => {
          if (res.confirm) {
            const selectedIds = this.selectedPhotos.map((photo) => photo.id);
            this.photoList = this.photoList.filter((photo) => !selectedIds.includes(photo.id));
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            this.exitSelectMode();
          }
        }
      });
    },
    // 打开添加照片菜单
    openAddPhotoMenu() {
      common_vendor.index.showActionSheet({
        itemList: ["拍照上传", "微信聊天记录导入", "手机相册导入"],
        itemColor: "#333333",
        // 统一字体颜色
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.takePhoto();
              break;
            case 1:
              this.importFromWechat();
              break;
            case 2:
              this.importFromAlbum();
              break;
          }
        }
      });
    },
    // 拍照上传
    takePhoto() {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["camera"],
        success: (res) => {
          this.uploadPhotos(res.tempFilePaths[0], res.tempFiles[0]);
        }
      });
    },
    // 从微信聊天记录导入
    importFromWechat() {
      common_vendor.index.showToast({
        title: "暂未实现此功能",
        icon: "none"
      });
    },
    // 从手机相册导入
    importFromAlbum() {
      common_vendor.index.chooseImage({
        count: 1,
        // 修改为一次只能选择一张照片
        sourceType: ["album"],
        success: (res) => {
          this.uploadPhotos(res.tempFilePaths[0], res.tempFiles[0]);
        }
      });
    },
    // 上传照片
    async uploadPhotos(tempFilePath, tempFile) {
      if (!tempFilePath) {
        common_vendor.index.showToast({
          title: "请选择照片",
          icon: "none"
        });
        return;
      }
      try {
        const isDeviceOnline = await this.checkDeviceStatus();
        if (!isDeviceOnline) {
          common_vendor.index.showToast({
            title: "电子相册设备不在线",
            icon: "none"
          });
          return;
        }
        common_vendor.index.showLoading({
          title: "上传中...",
          mask: true
        });
        const timestamp = (/* @__PURE__ */ new Date()).getTime();
        const originalFileName = tempFile.name || tempFilePath.split("/").pop();
        const extension = originalFileName.split(".").pop() || "jpg";
        const fileName = `photo_${timestamp}.${extension}`;
        const res = await utils_request.requestUtil.uploadFile({
          url: "/photograph/api/upload_photo",
          filePath: tempFilePath,
          name: "photo",
          header: {
            "Content-Type": "multipart/form-data"
          },
          formData: {
            deviceId: this.deviceId,
            fileName,
            question: ""
          }
        });
        console.log("上传响应:", res);
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            if (data.success) {
              common_vendor.index.showToast({
                title: "上传成功",
                icon: "success"
              });
              this.currentPage = 1;
              this.loadPhotos(1, true);
            } else {
              console.error("服务器返回错误:", data);
              common_vendor.index.showToast({
                title: data.message || "上传失败",
                icon: "none"
              });
            }
          } catch (error) {
            console.error("解析响应数据失败:", error, res.data);
            common_vendor.index.showToast({
              title: "解析响应数据失败",
              icon: "none"
            });
          }
        } else {
          console.error("HTTP状态码错误:", res.statusCode);
          common_vendor.index.showToast({
            title: `上传失败: ${res.statusCode}`,
            icon: "none"
          });
        }
      } catch (err) {
        console.error("上传请求失败:", err);
        common_vendor.index.showToast({
          title: "上传失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 检查并更新URL
    async checkAndUpdateUrls() {
      var _a;
      if (!this.photoList.length)
        return;
      const now = Date.now();
      const needUpdateThumbs = this.photoList.filter((thumb) => {
        const expireTime = getApp().globalData.parseExpirationFromUrl(thumb.url);
        return expireTime - now <= this.urlRefreshThreshold;
      });
      if (needUpdateThumbs.length > 0) {
        try {
          const res = await utils_request.requestUtil.request({
            url: "/photograph/api/batch_update_signed_urls",
            method: "POST",
            data: {
              deviceId: this.deviceId,
              thumbInfos: needUpdateThumbs.map((thumb) => ({
                thumbId: thumb.thumbId,
                thumbOssPath: thumb.thumbOssPath
              }))
            }
          });
          if ((_a = res.data) == null ? void 0 : _a.success) {
            const updatedUrls = res.data.data;
            needUpdateThumbs.forEach((thumb) => {
              if (updatedUrls[thumb.thumbId]) {
                thumb.url = updatedUrls[thumb.thumbId];
                this.urlExpirationMap.set(
                  thumb.thumbOssPath,
                  getApp().globalData.parseExpirationFromUrl(updatedUrls[thumb.thumbId])
                );
              }
            });
          }
        } catch (error) {
          console.error("批量更新签名URL失败:", error);
        }
      }
    },
    // 设置事件监听
    setupEventListeners() {
      common_vendor.index.$on("previewImageUpdated", this.handlePreviewUpdate);
    },
    // 清理事件监听
    cleanupEventListeners() {
      common_vendor.index.$off("previewImageUpdated", this.handlePreviewUpdate);
    }
  }
};
if (!Array) {
  const _component_DateGroup = common_vendor.resolveComponent("DateGroup");
  const _component_LoadingState = common_vendor.resolveComponent("LoadingState");
  const _component_EmptyState = common_vendor.resolveComponent("EmptyState");
  const _component_AlbumToolbar = common_vendor.resolveComponent("AlbumToolbar");
  const _component_PhotoPreview = common_vendor.resolveComponent("PhotoPreview");
  (_component_DateGroup + _component_LoadingState + _component_EmptyState + _component_AlbumToolbar + _component_PhotoPreview)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($options.groupedPhotos, (group, groupIndex, i0) => {
      return {
        a: groupIndex,
        b: common_vendor.o($options.previewPhoto, groupIndex),
        c: common_vendor.o(($event) => $data.isSelectMode ? null : $options.enterSelectMode, groupIndex),
        d: "e065a5d8-0-" + i0,
        e: common_vendor.p({
          group,
          isSelectMode: $data.isSelectMode,
          selectedPhotos: $data.selectedPhotos
        })
      };
    }),
    b: common_vendor.p({
      loading: $data.loading,
      hasMore: $data.hasMore,
      isEmpty: $data.photoList.length === 0,
      loadingStatus: $data.loadingStatus
    }),
    c: $data.photoList.length === 0 && !$data.loading
  }, $data.photoList.length === 0 && !$data.loading ? {} : {}, {
    d: common_vendor.o($options.openAddPhotoMenu),
    e: common_vendor.o($options.enterSelectMode),
    f: common_vendor.o($options.exitSelectMode),
    g: common_vendor.o($options.downloadPhotos),
    h: common_vendor.o($options.sharePhotos),
    i: common_vendor.o($options.deletePhotos),
    j: common_vendor.p({
      isSelectMode: $data.isSelectMode,
      selectedCount: $data.selectedPhotos.length
    }),
    k: common_vendor.o($options.closePreview),
    l: common_vendor.o($options.downloadPreviewPhoto),
    m: common_vendor.o($options.sharePreviewPhoto),
    n: common_vendor.o($options.deletePreviewPhoto),
    o: common_vendor.o($options.viewOriginalPhoto),
    p: common_vendor.p({
      visible: $data.previewVisible,
      photo: $data.currentPreviewPhoto,
      showOriginal: $data.showOriginal,
      isDownloadingOriginal: $data.isDownloadingOriginal
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "E:/Project/Front/memhouse_font_new/pages/album/index.vue"]]);
wx.createPage(MiniProgramPage);
