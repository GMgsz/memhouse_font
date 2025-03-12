<script>
import wsManager from './utils/websocket.js';

export default {
	globalData: {
		userId: 'user123', // 模拟用户ID
		deviceId: '123456', // 模拟设备ID
		wsManager: null,
		previewUrlCache: new Map(), // 预览图URL缓存
		
		// 解析URL过期时间
		parseExpirationFromUrl(url) {
			try {
				const queryString = url.split('?')[1];
				if (!queryString) {
					return Date.now() + 3600 * 1000; // 默认1小时
				}
				
				const params = queryString.split('&').reduce((acc, param) => {
					const [key, value] = param.split('=');
					acc[key] = value;
					return acc;
				}, {});
				
				const expires = params['Expires'];
				if (!expires) {
					return Date.now() + 3600 * 1000; // 默认1小时
				}
				
				return parseInt(expires) * 1000; // 转换为毫秒时间戳
			} catch (error) {
				console.error('解析URL过期时间失败:', error);
				return Date.now() + 3600 * 1000; // 默认1小时过期
			}
		},
		
		// 获取预览图URL（带缓存）
		async getPreviewUrl(thumbInfo) {
			// 清理过期缓存
			this.cleanExpiredCache();
			
			// 检查缓存
			const cached = this.previewUrlCache.get(thumbInfo.thumbId);
			if (cached && cached.expireTime > Date.now()) {
				return cached.signedUrl;
			}
			
			// 发送预览请求
			this.wsManager.sendMessage({
				type: 'PREVIEW_REQUEST',
				content: {
					thumbId: thumbInfo.thumbId,
					thumbLocalPath: thumbInfo.thumbLocalPath,
					deviceId: this.deviceId
				}
			});
			
			// 返回一个Promise，等待WebSocket响应
			return new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					uni.$off('previewImageUpdated', handler);
					reject(new Error('获取预览图超时'));
				}, 30000); // 30秒超时
				
				const handler = (data) => {
					if (data.thumbId === thumbInfo.thumbId) {
						clearTimeout(timeout);
						uni.$off('previewImageUpdated', handler);
						resolve(data.signedUrl);
					}
				};
				
				uni.$on('previewImageUpdated', handler);
			});
		},
		
		// 清理过期缓存
		cleanExpiredCache() {
			if (!this.previewUrlCache) return;
			
			const now = Date.now();
			for (const [key, value] of this.previewUrlCache) {
				if (value.expireTime <= now) {
					this.previewUrlCache.delete(key);
				}
			}
		}
	},
	
	onLaunch: function() {
		console.log('App Launch');
		
		// 初始化WebSocket
		this.initWebSocket();
	},
	
	onShow: function() {
		console.log('App Show');
	},
	
	onHide: function() {
		console.log('App Hide');
	},
	
	methods: {
		// 初始化WebSocket
		initWebSocket() {
			this.globalData.wsManager = wsManager;
			
			// 初始化WebSocket连接
			wsManager.init({
				userId: this.globalData.userId,
				deviceId: this.globalData.deviceId,
				previewUrlCache: this.globalData.previewUrlCache
			});
		}
	}
}
</script>

<style>
	/* 引入FontAwesome */
	@import '/static/css/font-awesome.css';

	/* 全局样式 */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		color: #333333;
		background-color: #F7F7F7;
	}

	/* 品牌色系 */
	.brand-primary {
		color: #FED31B;
	}
	.bg-brand-primary {
		background-color: #FED31B;
	}

	/* 文字色系 */
	.text-primary {
		color: #333333;
	}
	.text-secondary {
		color: #666666;
	}
	.text-tertiary {
		color: #999999;
	}

	/* 功能色 */
	.text-success {
		color: #FED31B;
	}
	.text-warning {
		color: #ADFF2F;
	}
	.text-error {
		color: #FA5151;
	}
	.bg-success {
		background-color: #FED31B;
	}
	.bg-warning {
		background-color: #ADFF2F;
	}
	.bg-error {
		background-color: #FA5151;
	}

	/* TailwindCSS 核心样式 */
	.flex { display: flex; }
	.flex-col { flex-direction: column; }
	.items-center { align-items: center; }
	.justify-center { justify-content: center; }
	.justify-between { justify-content: space-between; }
	.justify-around { justify-content: space-around; }
	.flex-wrap { flex-wrap: wrap; }
	.flex-1 { flex: 1; }

	.text-xs { font-size: 12px; }
	.text-sm { font-size: 14px; }
	.text-base { font-size: 16px; }
	.text-lg { font-size: 18px; }
	.text-xl { font-size: 20px; }
	.font-bold { font-weight: bold; }

	.text-gray-400 { color: #999999; }
	.text-gray-600 { color: #666666; }
	.text-gray-800 { color: #333333; }
	.text-white { color: #FFFFFF; }
	.text-red { color: #FA5151; }

	.bg-white { background-color: #FFFFFF; }
	.bg-gray-100 { background-color: #F7F7F7; }
	.bg-primary { background-color: #FED31B; }
	.bg-red { background-color: #FA5151; }

	.rounded-full { border-radius: 9999px; }
	.rounded-lg { border-radius: 8px; }
	.rounded-md { border-radius: 6px; }
	.rounded-sm { border-radius: 4px; }

	.p-1 { padding: 4px; }
	.p-2 { padding: 8px; }
	.p-3 { padding: 12px; }
	.p-4 { padding: 16px; }
	.px-2 { padding-left: 8px; padding-right: 8px; }
	.py-1 { padding-top: 4px; padding-bottom: 4px; }
	.py-2 { padding-top: 8px; padding-bottom: 8px; }

	.m-1 { margin: 4px; }
	.m-2 { margin: 8px; }
	.mx-1 { margin-left: 4px; margin-right: 4px; }
	.mx-2 { margin-left: 8px; margin-right: 8px; }
	.my-1 { margin-top: 4px; margin-bottom: 4px; }
	.my-2 { margin-top: 8px; margin-bottom: 8px; }
	.mb-1 { margin-bottom: 4px; }
	.mb-2 { margin-bottom: 8px; }
	.mb-4 { margin-bottom: 16px; }
	.mt-1 { margin-top: 4px; }
	.mt-2 { margin-top: 8px; }

	.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
	.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
	.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }

	.w-full { width: 100%; }
	.h-full { height: 100%; }
	.h-screen { height: 100vh; }

	.relative { position: relative; }
	.absolute { position: absolute; }
	.fixed { position: fixed; }
	.sticky { position: sticky; }
	.top-0 { top: 0; }
	.right-0 { right: 0; }
	.bottom-0 { bottom: 0; }
	.left-0 { left: 0; }

	.z-10 { z-index: 10; }
	.z-20 { z-index: 20; }
	.z-50 { z-index: 50; }
	.z-100 { z-index: 100; }

	.opacity-0 { opacity: 0; }
	.opacity-50 { opacity: 0.5; }
	.opacity-100 { opacity: 1; }

	.transition { transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform; }
	.duration-200 { transition-duration: 200ms; }
	.ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }

	/* 自定义样式 */
	.safe-area-bottom {
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
