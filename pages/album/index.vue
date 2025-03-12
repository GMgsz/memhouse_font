<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import PhotoItem from './components/PhotoItem.vue';
import AlbumToolbar from './components/AlbumToolbar.vue';
import DateGroup from './components/DateGroup.vue';
import EmptyState from './components/EmptyState.vue';
import LoadingState from './components/LoadingState.vue';
import PhotoPreview from './components/PhotoPreview.vue';
import requestUtil from '@/utils/request.js';
import dateUtil from '@/utils/date.js';

export default {
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
      loadingStatus: 'more', // 加载状态
      
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
      urlRefreshThreshold: 5 * 60 * 1000, // 设置提前5分钟更新URL
      urlExpirationMap: new Map(), // 存储URL过期时间
      urlUpdateInterval: null // 用于存储定时器
    };
  },
  
  computed: {
    // 按日期分组的照片数据
    groupedPhotos() {
      return dateUtil.groupPhotosByDate(this.photoList, 'uploadTime');
    }
  },
  
  // 页面生命周期函数
  onLoad() {
    console.log('页面加载，初始化数据');
    // 初始加载
    this.loadPhotos(1, true);
    
    // 设置事件监听
    this.setupEventListeners();
    
    // 设置URL更新定时器
    this.urlUpdateInterval = setInterval(() => {
      this.checkAndUpdateUrls();
    }, 60000); // 每分钟检查一次
  },
  
  onUnload() {
    // 清理事件监听
    this.cleanupEventListeners();
    
    // 清理定时器
    if (this.urlUpdateInterval) {
      clearInterval(this.urlUpdateInterval);
    }
  },
  
  onReachBottom() {
    console.log('触发底部加载', {
      hasMore: this.hasMore,
      isLoading: this.loading,
      currentPage: this.currentPage,
      totalPages: this.pages
    });
    
    if (!this.hasMore || this.loading) {
      console.log('无法加载更多:', {
        hasMore: this.hasMore,
        isLoading: this.loading,
        currentPage: this.currentPage,
        totalPages: this.pages
      });
      return;
    }
    
    // 确保页码递增
    this.currentPage++;
    console.log('开始加载下一页:', this.currentPage);
    this.loadPhotos(this.currentPage);
  },
  
  onPullDownRefresh() {
    console.log('触发下拉刷新');
    this.currentPage = 1;
    this.loadPhotos(1, true).then(() => {
      uni.stopPullDownRefresh();
    });
  },
  
  methods: {
    // 加载照片数据
    async loadPhotos(page = 1, refresh = false) {
      if (this.loading) return;
      
      try {
        this.loading = true;
        this.loadingStatus = 'loading'; // 更新加载状态
        
        console.log(`开始加载第 ${page} 页数据`);
        
        const res = await requestUtil.request({
          url: `/photograph/thumbs/device/${this.deviceId}/page`,
          method: 'GET',
          data: {
            current: page,
            size: this.pageSize
          }
        });
        
        console.log('API返回数据:', res.data);
        
        if (res.data?.data) {
          const { records, total: totalCount, pages: totalPages, current } = res.data.data;
          
          console.log(`获取到数据: 当前页 ${current}, 总页数 ${totalPages}, 总记录数 ${totalCount}, 记录数量 ${records?.length || 0}`);
          
          if (records && records.length > 0) {
            // 处理缩略图数据
            const processedRecords = await this.processThumbsData(records);
            
            if (refresh) {
              this.photoList = processedRecords;
            } else {
              const newData = processedRecords.filter(newItem => 
                !this.photoList.some(existingItem => 
                  existingItem.thumbId === newItem.thumbId
                )
              );
              this.photoList = [...this.photoList, ...newData];
            }
            
            this.total = totalCount;
            this.pages = totalPages;
            
            // 更新是否有更多数据的状态
            this.hasMore = page < totalPages;
            console.log(`更新hasMore状态: ${this.hasMore}, 当前页 ${page}, 总页数 ${totalPages}`);
            
            this.loadingStatus = this.hasMore ? 'more' : 'noMore'; // 更新加载状态
          } else {
            console.log('没有获取到记录或记录为空');
            this.hasMore = false;
            this.loadingStatus = 'noMore'; // 更新加载状态
          }
        } else {
          console.error('API返回数据格式不正确:', res.data);
          this.hasMore = false;
          this.loadingStatus = 'noMore';
        }
      } catch (error) {
        console.error('加载失败:', error);
        this.loadingStatus = 'more'; // 更新加载状态
      } finally {
        this.loading = false;
      }
    },
    
    // 处理缩略图数据，添加签名URL
    async processThumbsData(records) {
      // 现在后端会直接返回带签名的URL，所以不需要额外处理
      return records.map(record => {
        // 确保日期格式正确
        let uploadTime = record.uploadTime;
        if (typeof uploadTime === 'string' && uploadTime.includes(' ')) {
          // 使用安全的日期解析函数
          uploadTime = dateUtil.safeParseDate(uploadTime);
        }
        
        return {
          ...record,
          id: record.thumbId, // 为了兼容新UI的id字段
          url: record.signedUrl, // 为了兼容新UI的url字段
          size: record.fileSize || '未知大小', // 为了兼容新UI的size字段
          date: uploadTime, // 为了兼容新UI的date字段
          uploadTime: uploadTime // 确保uploadTime是安全的日期对象
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
      const index = this.selectedPhotos.findIndex(item => item.id === photo.id);
      
      if (index > -1) {
        this.selectedPhotos.splice(index, 1);
      } else {
        if (this.selectedPhotos.length < 10) {
          this.selectedPhotos.push(photo);
        } else {
          uni.showToast({
            title: '最多只能选择10张照片',
            icon: 'none'
          });
        }
      }
    },
    
    // 检查照片是否被选中
    isPhotoSelected(photo) {
      return this.selectedPhotos.some(item => item.id === photo.id);
    },
    
    // 预览照片
    previewPhoto(photo) {
      if (this.isSelectMode) {
        this.toggleSelectPhoto(photo);
        return;
      }
      
      try {
        this.currentPreviewPhoto = { ...photo }; // 创建照片对象的副本
        this.previewVisible = true;
        this.showOriginal = false; // 默认不显示原图
      } catch (error) {
        console.error('预览照片出错:', error);
        uni.showToast({
          title: '预览照片出错',
          icon: 'none'
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
        const res = await requestUtil.request({
          url: '/photograph/api/check_device',
          method: 'GET',
          data: {
            deviceId: this.deviceId
          }
        });
        return res.data;
      } catch (err) {
        console.error('检查设备状态失败:', err);
        return false;
      }
    },
    
    // 查看原图（即原项目中的预览图功能）
    async viewOriginalPhoto() {
      if (this.isDownloadingOriginal) return;
      
      try {
        this.isDownloadingOriginal = true;
        
        // 检查设备在线状态
        const isDeviceOnline = await this.checkDeviceStatus();
        if (!isDeviceOnline) {
          uni.showToast({
            title: '设备不在线',
            icon: 'none'
          });
          this.isDownloadingOriginal = false;
          return;
        }
        
        // 检查WebSocket连接
        const wsManager = getApp().globalData.wsManager;
        if (!wsManager.isConnected()) {
          uni.showToast({
            title: '网络连接异常，请重新进入小程序',
            icon: 'none'
          });
          this.isDownloadingOriginal = false;
          return;
        }
        
        // 设置当前预览ID
        this.currentPreviewId = this.currentPreviewPhoto.thumbId;
        
        // 发送预览请求
        getApp().globalData.wsManager.sendMessage({
          type: 'PREVIEW_REQUEST',
          content: {
            thumbId: this.currentPreviewPhoto.thumbId,
            thumbLocalPath: this.currentPreviewPhoto.thumbLocalPath,
            deviceId: getApp().globalData.deviceId,
          }
        });
        
        // 监听预览图更新事件
        uni.$on('previewImageUpdated', this.handlePreviewUpdate);
        
      } catch (error) {
        console.error('获取原图失败:', error);
        uni.showToast({
          title: error.message || '获取原图失败',
          icon: 'none'
        });
        this.isDownloadingOriginal = false;
      }
    },
    
    // 处理预览图更新事件（接收WebSocket返回的预览URL）
    async handlePreviewUpdate(data) {
      try {
        // 如果不是当前请求的预览图，忽略
        if (this.currentPreviewId !== data.thumbId) {
          return;
        }

        // 更新当前预览照片的URL为原图URL
        if (this.currentPreviewPhoto) {
          this.currentPreviewPhoto.originalUrl = data.signedUrl;
          this.showOriginal = true;
        }
        
      } catch (error) {
        console.error('处理预览更新失败:', error);
        uni.showToast({
          title: '预览失败',
          icon: 'none'
        });
      } finally {
        this.isDownloadingOriginal = false;
      }
    },
    
    // 下载预览中的照片
    async downloadPreviewPhoto(photo) {
      // 如果还没有查看原图，先获取原图
      if (!this.showOriginal) {
        await this.viewOriginalPhoto();
        // 等待原图加载完成
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
      uni.showLoading({
        title: '下载中...'
      });
      
      const url = this.currentPreviewPhoto.originalUrl || this.currentPreviewPhoto.url;
      
      uni.downloadFile({
        url: url,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function() {
                uni.showToast({
                  title: '保存成功',
                  icon: 'success'
                });
              },
              fail: function() {
                uni.showToast({
                  title: '保存失败',
                  icon: 'none'
                });
              }
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: '下载失败',
            icon: 'none'
          });
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    },
    
    // 分享预览中的照片
    sharePreviewPhoto(photo) {
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    },
    
    // 删除预览中的照片
    deletePreviewPhoto(photo) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这张照片吗？',
        success: (res) => {
          if (res.confirm) {
            // 从照片列表中删除
            this.photoList = this.photoList.filter(p => p.id !== photo.id);
            
            // 关闭预览
            this.closePreview();
            
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      });
    },
    
    // 下载选中的照片
    downloadPhotos() {
      if (this.selectedPhotos.length === 0) {
        uni.showToast({
          title: '请先选择照片',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({
        title: '下载中...'
      });
      
      // 模拟下载过程
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '下载成功',
          icon: 'success'
        });
      }, 1500);
    },
    
    // 分享选中的照片
    sharePhotos() {
      if (this.selectedPhotos.length === 0) {
        uni.showToast({
          title: '请先选择照片',
          icon: 'none'
        });
        return;
      }
      
      // 在实际应用中，这里应该调用微信的分享API
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    },
    
    // 删除选中的照片
    deletePhotos() {
      if (this.selectedPhotos.length === 0) {
        uni.showToast({
          title: '请先选择照片',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '确认删除',
        content: `确定要删除选中的${this.selectedPhotos.length}张照片吗？`,
        success: (res) => {
          if (res.confirm) {
            // 模拟删除过程
            const selectedIds = this.selectedPhotos.map(photo => photo.id);
            this.photoList = this.photoList.filter(photo => !selectedIds.includes(photo.id));
            
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            this.exitSelectMode();
          }
        }
      });
    },
    
    // 打开添加照片菜单
    openAddPhotoMenu() {
      uni.showActionSheet({
        itemList: ['拍照上传', '微信聊天记录导入', '手机相册导入'],
        itemColor: '#333333', // 统一字体颜色
        success: (res) => {
          switch(res.tapIndex) {
            case 0: // 拍照上传
              this.takePhoto();
              break;
            case 1: // 微信聊天记录导入
              this.importFromWechat();
              break;
            case 2: // 手机相册导入
              this.importFromAlbum();
              break;
          }
        }
      });
    },
    
    // 拍照上传
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          this.uploadPhotos(res.tempFilePaths[0], res.tempFiles[0]);
        }
      });
    },
    
    // 从微信聊天记录导入
    importFromWechat() {
      // 实际应用中需要调用微信相关API
      uni.showToast({
        title: '暂未实现此功能',
        icon: 'none'
      });
    },
    
    // 从手机相册导入
    importFromAlbum() {
      uni.chooseImage({
        count: 1, // 修改为一次只能选择一张照片
        sourceType: ['album'],
        success: (res) => {
          this.uploadPhotos(res.tempFilePaths[0], res.tempFiles[0]);
        }
      });
    },
    
    // 上传照片
    async uploadPhotos(tempFilePath, tempFile) {
      if (!tempFilePath) {
        uni.showToast({
          title: '请选择照片',
          icon: 'none'
        });
        return;
      }
      
      try {
        // 检查设备状态
        const isDeviceOnline = await this.checkDeviceStatus();
        if (!isDeviceOnline) {
          uni.showToast({
            title: '电子相册设备不在线',
            icon: 'none'
          });
          return;
        }

        uni.showLoading({ 
          title: '上传中...',
          mask: true
        });
        
        // 构建一个合适的文件名
        const timestamp = new Date().getTime();
        const originalFileName = tempFile.name || tempFilePath.split('/').pop();
        const extension = originalFileName.split('.').pop() || 'jpg'; // 获取文件扩展名，默认jpg
        const fileName = `photo_${timestamp}.${extension}`;

        // 上传到服务器
        const res = await requestUtil.uploadFile({
          url: '/photograph/api/upload_photo',
          filePath: tempFilePath,
          name: 'photo',
          header: {
            'Content-Type': 'multipart/form-data'
          },
          formData: {
            deviceId: this.deviceId,
            fileName: fileName,
            question: ''
          }
        });

        console.log('上传响应:', res);
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            if (data.success) {
              uni.showToast({
                title: '上传成功',
                icon: 'success'
              });
              
              // 刷新相册列表
              this.currentPage = 1;
              this.loadPhotos(1, true);
            } else {
              console.error('服务器返回错误:', data);
              uni.showToast({
                title: data.message || '上传失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('解析响应数据失败:', error, res.data);
            uni.showToast({
              title: '解析响应数据失败',
              icon: 'none'
            });
          }
        } else {
          console.error('HTTP状态码错误:', res.statusCode);
          uni.showToast({
            title: `上传失败: ${res.statusCode}`,
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('上传请求失败:', err);
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 检查并更新URL
    async checkAndUpdateUrls() {
      if (!this.photoList.length) return;
      
      const now = Date.now();
      // 收集需要更新的缩略图信息
      const needUpdateThumbs = this.photoList.filter(thumb => {
        const expireTime = getApp().globalData.parseExpirationFromUrl(thumb.url);
        return expireTime - now <= this.urlRefreshThreshold;
      });
      
      if (needUpdateThumbs.length > 0) {
        try {
          // 批量请求更新URL
          const res = await requestUtil.request({
            url: '/photograph/api/batch_update_signed_urls',
            method: 'POST',
            data: {
              deviceId: this.deviceId,
              thumbInfos: needUpdateThumbs.map(thumb => ({
                thumbId: thumb.thumbId,
                thumbOssPath: thumb.thumbOssPath
              }))
            }
          });
          
          if (res.data?.success) {
            const updatedUrls = res.data.data;
            // 批量更新URL
            needUpdateThumbs.forEach(thumb => {
              if (updatedUrls[thumb.thumbId]) {
                thumb.url = updatedUrls[thumb.thumbId];
                // 更新过期时间映射
                this.urlExpirationMap.set(
                  thumb.thumbOssPath,
                  getApp().globalData.parseExpirationFromUrl(updatedUrls[thumb.thumbId])
                );
              }
            });
          }
        } catch (error) {
          console.error('批量更新签名URL失败:', error);
        }
      }
    },
    
    // 设置事件监听
    setupEventListeners() {
      // 监听预览图更新事件
      uni.$on('previewImageUpdated', this.handlePreviewUpdate);
    },
    
    // 清理事件监听
    cleanupEventListeners() {
      uni.$off('previewImageUpdated', this.handlePreviewUpdate);
    }
  }
}
</script>

<template>
  <view class="album-container">
    <!-- 相册内容区 -->
    <view class="album-content">
      <DateGroup
        v-for="(group, groupIndex) in groupedPhotos"
        :key="groupIndex"
        :group="group"
        :isSelectMode="isSelectMode"
        :selectedPhotos="selectedPhotos"
        @photoClick="previewPhoto"
        @photoLongPress="isSelectMode ? null : enterSelectMode"
      />
      
      <!-- 加载状态 -->
      <LoadingState 
        :loading="loading" 
        :hasMore="hasMore"
        :isEmpty="photoList.length === 0"
        :loadingStatus="loadingStatus"
      />
      
      <!-- 空状态 -->
      <EmptyState v-if="photoList.length === 0 && !loading" />
    </view>
    
    <!-- 底部工具栏 -->
    <AlbumToolbar
      :isSelectMode="isSelectMode"
      :selectedCount="selectedPhotos.length"
      @add="openAddPhotoMenu"
      @enterSelect="enterSelectMode"
      @exitSelect="exitSelectMode"
      @download="downloadPhotos"
      @share="sharePhotos"
      @delete="deletePhotos"
    />
    
    <!-- 照片预览 -->
    <PhotoPreview
      :visible="previewVisible"
      :photo="currentPreviewPhoto"
      :showOriginal="showOriginal"
      :isDownloadingOriginal="isDownloadingOriginal"
      @close="closePreview"
      @download="downloadPreviewPhoto"
      @share="sharePreviewPhoto"
      @delete="deletePreviewPhoto"
      @viewOriginal="viewOriginalPhoto"
    />
  </view>
</template>

<style>
/* 主容器 */
.album-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #FFFFFF;
}

.album-content {
  flex: 1;
  padding: 0;
  padding-bottom: calc(50px + env(safe-area-inset-bottom)); /* 为底部工具栏留出空间 */
  background-color: #FFFFFF;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 滚动效果 */
page {
  -webkit-overflow-scrolling: touch;
  background-color: #FFFFFF;
}
</style> 