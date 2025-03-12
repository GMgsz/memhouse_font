"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "PhotoPreview",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    photo: {
      type: Object,
      default: () => ({})
    },
    showOriginal: {
      type: Boolean,
      default: false
    },
    isDownloadingOriginal: {
      type: Boolean,
      default: false
    }
  },
  emits: ["close", "download", "share", "delete", "viewOriginal"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const scale = common_vendor.ref(1);
    const displayUrl = common_vendor.computed(() => {
      if (!props.photo)
        return "";
      return props.showOriginal && props.photo.originalUrl ? props.photo.originalUrl : props.photo.url;
    });
    function handleClose() {
      scale.value = 1;
      emit("close");
    }
    function handleDownload() {
      if (!props.photo)
        return;
      emit("download", props.photo);
    }
    function handleShare() {
      if (!props.photo)
        return;
      emit("share", props.photo);
    }
    function handleDelete() {
      if (!props.photo)
        return;
      emit("delete", props.photo);
    }
    function handleViewOriginal() {
      if (!props.photo)
        return;
      emit("viewOriginal", props.photo);
    }
    function handleTouchStart(e) {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        e.currentTarget.dataset.initialDistance = initialDistance;
        e.currentTarget.dataset.initialScale = scale.value;
      }
    }
    function handleTouchMove(e) {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        const initialDistance = parseFloat(e.currentTarget.dataset.initialDistance);
        const initialScale = parseFloat(e.currentTarget.dataset.initialScale);
        if (initialDistance > 0) {
          const newScale = initialScale * (currentDistance / initialDistance);
          scale.value = Math.min(Math.max(newScale, 1), 3);
        }
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? common_vendor.e({
        b: __props.photo
      }, __props.photo ? {
        c: displayUrl.value,
        d: __props.showOriginal ? "widthFix" : "aspectFit",
        e: __props.showOriginal ? "100%" : "",
        f: `scale(${scale.value})`
      } : {}, {
        g: !__props.showOriginal
      }, !__props.showOriginal ? common_vendor.e({
        h: __props.isDownloadingOriginal
      }, __props.isDownloadingOriginal ? {} : {}, {
        i: __props.isDownloadingOriginal
      }, __props.isDownloadingOriginal ? {} : {
        j: common_vendor.t(__props.photo.size)
      }, {
        k: common_vendor.o(handleViewOriginal)
      }) : {}, {
        l: common_vendor.o(handleTouchStart),
        m: common_vendor.o(handleTouchMove),
        n: common_vendor.o(handleDownload),
        o: common_vendor.o(handleShare),
        p: common_vendor.o(handleDelete),
        q: common_vendor.o(() => {
        }),
        r: common_vendor.o(handleClose)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Project/Front/memhouse_font_new/pages/album/components/PhotoPreview.vue"]]);
wx.createComponent(Component);
