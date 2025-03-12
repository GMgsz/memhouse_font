"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    function navigateTo(url) {
      common_vendor.index.navigateTo({
        url
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => navigateTo("/pages/album/index")),
        b: common_vendor.o(($event) => navigateTo("/pages/message/index")),
        c: common_vendor.o(($event) => navigateTo("/pages/devicecontrol/index"))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Project/Front/memhouse_font_new/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
