"use strict";
const common_vendor = require("../../../common/vendor.js");
if (!Math) {
  PhotoItem();
}
const PhotoItem = () => "./PhotoItem.js";
const _sfc_main = {
  __name: "DateGroup",
  props: {
    group: {
      type: Object,
      required: true
    },
    isSelectMode: {
      type: Boolean,
      default: false
    },
    selectedPhotos: {
      type: Array,
      default: () => []
    }
  },
  emits: ["photoClick", "photoLongPress"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    function isPhotoSelected(photo) {
      return props.selectedPhotos.some((item) => item.id === photo.id);
    }
    function handlePhotoClick(photo) {
      emit("photoClick", photo);
    }
    function handlePhotoLongPress(photo) {
      emit("photoLongPress", photo);
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(__props.group.date),
        b: common_vendor.t(__props.group.photos.length),
        c: common_vendor.f(__props.group.photos, (photo, k0, i0) => {
          return {
            a: common_vendor.o(($event) => handlePhotoClick(photo), photo.id),
            b: common_vendor.o(($event) => handlePhotoLongPress(photo), photo.id),
            c: "7482ea46-0-" + i0,
            d: common_vendor.p({
              photo,
              isSelectMode: __props.isSelectMode,
              isSelected: isPhotoSelected(photo)
            }),
            e: photo.id
          };
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Project/Front/memhouse_font_new/pages/album/components/DateGroup.vue"]]);
wx.createComponent(Component);
