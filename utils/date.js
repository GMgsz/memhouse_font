/**
 * 日期格式化工具函数
 */

/**
 * 安全地解析日期字符串，兼容iOS
 * @param {string|Date} dateStr 日期字符串或日期对象
 * @returns {Date} 日期对象
 */
function safeParseDate(dateStr) {
  if (dateStr instanceof Date) {
    return dateStr;
  }
  
  if (typeof dateStr !== 'string') {
    return new Date(dateStr);
  }
  
  // 处理iOS兼容性问题
  // iOS只支持 "yyyy/MM/dd"、"yyyy/MM/dd HH:mm:ss"、"yyyy-MM-dd"、"yyyy-MM-ddTHH:mm:ss"、"yyyy-MM-ddTHH:mm:ss+HH:mm" 的格式
  
  // 检查是否包含空格分隔的日期和时间
  if (dateStr.includes(' ')) {
    // 将 "yyyy-MM-dd HH:mm:ss" 转换为 "yyyy/MM/dd HH:mm:ss"
    const parts = dateStr.split(' ');
    if (parts.length === 2) {
      const datePart = parts[0].replace(/-/g, '/');
      return new Date(`${datePart} ${parts[1]}`);
    }
  }
  
  // 处理纯日期格式 "yyyy-MM-dd" 或 "yyyy/MM/dd"
  if (dateStr.includes('-')) {
    return new Date(dateStr.replace(/-/g, '/'));
  }
  
  // 其他格式直接尝试解析
  return new Date(dateStr);
}

/**
 * 获取日期字符串（YYYY-MM-DD格式）
 * @param {string|Date} dateStr 日期字符串或日期对象
 * @returns {string} 格式化后的日期字符串
 */
function getDateString(dateStr) {
  try {
    const date = safeParseDate(dateStr);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('日期格式化错误:', dateStr, error);
    return typeof dateStr === 'string' ? dateStr : String(dateStr);
  }
}

/**
 * 格式化日期显示（YYYY年MM月DD日 星期X）
 * @param {string|Date} dateStr 日期字符串或日期对象
 * @returns {string} 格式化后的日期显示
 */
function formatDate(dateStr) {
  try {
    const date = safeParseDate(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
    
    return `${year}年${month}月${day}日 星期${weekDay}`;
  } catch (error) {
    console.error('日期显示格式化错误:', dateStr, error);
    return typeof dateStr === 'string' ? dateStr : String(dateStr);
  }
}

/**
 * 按日期分组照片
 * @param {Array} photoList 照片列表
 * @param {string} dateField 日期字段名
 * @returns {Array} 分组后的照片数组
 */
function groupPhotosByDate(photoList, dateField = 'uploadTime') {
  const groups = {};
  
  photoList.forEach(photo => {
    if (!photo[dateField]) {
      console.warn('照片缺少日期字段:', dateField, photo);
      return;
    }
    
    const date = getDateString(photo[dateField]);
    if (!groups[date]) {
      groups[date] = {
        date: formatDate(date),
        photos: []
      };
    }
    
    groups[date].photos.push(photo);
  });
  
  // 转换为数组并按日期降序排序
  return Object.values(groups).sort((a, b) => {
    try {
      const dateA = safeParseDate(a.photos[0][dateField]);
      const dateB = safeParseDate(b.photos[0][dateField]);
      return dateB - dateA;
    } catch (error) {
      console.error('日期排序错误:', error);
      return 0;
    }
  });
}

export default {
  safeParseDate,
  getDateString,
  formatDate,
  groupPhotosByDate
}; 