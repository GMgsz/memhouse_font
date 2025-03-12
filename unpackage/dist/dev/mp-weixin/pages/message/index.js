"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const messages = common_vendor.ref([
      {
        id: 1,
        image: "/static/refdiagrams/test1.jpg",
        imageCount: 1,
        duration: "01:20",
        wordCount: 156,
        previewText: "这是一段示例文本，展示从语音转录得到的内容。在实际应用中，这里会显示用户录音转录后的详细文本。"
      },
      {
        id: 2,
        image: "/static/refdiagrams/test2.jpg",
        imageCount: 1,
        duration: "00:32",
        wordCount: 78,
        previewText: "这是一段示例文本，展示从语音转录得到的内容。在实际应用中，这里会显示用户录音转录后的详细文本。"
      },
      {
        id: 3,
        image: "/static/refdiagrams/test3.jpg",
        imageCount: 1,
        duration: "01:20",
        wordCount: 156,
        previewText: "这是一段示例文本，展示从语音转录得到的内容。在实际应用中，这里会显示用户录音转录后的详细文本。"
      },
      {
        id: 4,
        image: "/static/refdiagrams/test4.jpg",
        imageCount: 1,
        duration: "00:32",
        wordCount: 78,
        previewText: "这是一段示例文本，展示从语音转录得到的内容。在实际应用中，这里会显示用户录音转录后的详细文本。"
      }
    ]);
    function navigateToEdit(messageId) {
      common_vendor.index.navigateTo({
        url: `/pages/message/edit?id=${messageId}`
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(messages.value, (message, index, i0) => {
          return {
            a: message.image,
            b: common_vendor.t(message.imageCount),
            c: common_vendor.t(message.duration),
            d: common_vendor.t(message.wordCount),
            e: common_vendor.t(message.previewText),
            f: common_vendor.o(($event) => navigateToEdit(message.id), index),
            g: index
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Project/Front/memhouse_font_new/pages/message/index.vue"]]);
wx.createPage(MiniProgramPage);
