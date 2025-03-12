"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "LoadingState",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: true
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    loadingStatus: {
      type: String,
      default: "more"
      // 'more', 'loading', 'noMore'
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.loadingStatus === "loading"
      }, __props.loadingStatus === "loading" ? {} : {}, {
        b: __props.loadingStatus === "noMore" && !__props.isEmpty
      }, __props.loadingStatus === "noMore" && !__props.isEmpty ? {} : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Project/Front/memhouse_font_new/pages/album/components/LoadingState.vue"]]);
wx.createComponent(Component);
