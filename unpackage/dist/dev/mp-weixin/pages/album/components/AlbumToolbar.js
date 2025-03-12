"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "AlbumToolbar",
  props: {
    isSelectMode: {
      type: Boolean,
      default: false
    },
    selectedCount: {
      type: Number,
      default: 0
    }
  },
  emits: [
    "add",
    "enterSelect",
    "exitSelect",
    "download",
    "share",
    "delete"
  ],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    function handleAdd() {
      emit("add");
    }
    function handleEnterSelect() {
      emit("enterSelect");
    }
    function handleExitSelect() {
      emit("exitSelect");
    }
    function handleDownload() {
      emit("download");
    }
    function handleShare() {
      emit("share");
    }
    function handleDelete() {
      emit("delete");
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.isSelectMode && __props.selectedCount > 0
      }, __props.isSelectMode && __props.selectedCount > 0 ? {
        b: common_vendor.t(__props.selectedCount)
      } : {}, {
        c: !__props.isSelectMode
      }, !__props.isSelectMode ? {
        d: common_vendor.o(handleAdd),
        e: common_vendor.o(handleEnterSelect)
      } : {
        f: common_vendor.o(handleDownload),
        g: common_vendor.o(handleShare),
        h: common_vendor.o(handleDelete),
        i: common_vendor.o(handleExitSelect)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Project/Front/memhouse_font_new/pages/album/components/AlbumToolbar.vue"]]);
wx.createComponent(Component);
