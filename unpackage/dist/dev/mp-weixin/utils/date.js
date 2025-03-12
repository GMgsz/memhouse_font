"use strict";
function safeParseDate(dateStr) {
  if (dateStr instanceof Date) {
    return dateStr;
  }
  if (typeof dateStr !== "string") {
    return new Date(dateStr);
  }
  if (dateStr.includes(" ")) {
    const parts = dateStr.split(" ");
    if (parts.length === 2) {
      const datePart = parts[0].replace(/-/g, "/");
      return /* @__PURE__ */ new Date(`${datePart} ${parts[1]}`);
    }
  }
  if (dateStr.includes("-")) {
    return new Date(dateStr.replace(/-/g, "/"));
  }
  return new Date(dateStr);
}
function getDateString(dateStr) {
  try {
    const date = safeParseDate(dateStr);
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("日期格式化错误:", dateStr, error);
    return typeof dateStr === "string" ? dateStr : String(dateStr);
  }
}
function formatDate(dateStr) {
  try {
    const date = safeParseDate(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekDay = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
    return `${year}年${month}月${day}日 星期${weekDay}`;
  } catch (error) {
    console.error("日期显示格式化错误:", dateStr, error);
    return typeof dateStr === "string" ? dateStr : String(dateStr);
  }
}
function groupPhotosByDate(photoList, dateField = "uploadTime") {
  const groups = {};
  photoList.forEach((photo) => {
    if (!photo[dateField]) {
      console.warn("照片缺少日期字段:", dateField, photo);
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
  return Object.values(groups).sort((a, b) => {
    try {
      const dateA = safeParseDate(a.photos[0][dateField]);
      const dateB = safeParseDate(b.photos[0][dateField]);
      return dateB - dateA;
    } catch (error) {
      console.error("日期排序错误:", error);
      return 0;
    }
  });
}
const dateUtil = {
  safeParseDate,
  getDateString,
  formatDate,
  groupPhotosByDate
};
exports.dateUtil = dateUtil;
