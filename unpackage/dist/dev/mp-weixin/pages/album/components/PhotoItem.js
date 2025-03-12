"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "PhotoItem",
  props: {
    photo: {
      type: Object,
      required: true
    },
    isSelectMode: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  emits: ["click", "longpress"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    function handleClick() {
      emit("click", props.photo);
    }
    function handleLongPress() {
      emit("longpress", props.photo);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.photo.url,
        b: __props.isSelectMode
      }, __props.isSelectMode ? common_vendor.e({
        c: __props.isSelected
      }, __props.isSelected ? {} : {}, {
        d: __props.isSelected ? 1 : ""
      }) : {}, {
        e: common_vendor.t(__props.photo.size),
        f: common_vendor.o(handleClick),
        g: common_vendor.o(handleLongPress)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Project/Front/memhouse_font_new/pages/album/components/PhotoItem.vue"]]);
wx.createComponent(Component);
