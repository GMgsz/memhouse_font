"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const power = common_vendor.ref(false);
    const volume = common_vendor.ref(50);
    const rotation = common_vendor.ref(0);
    const isMuted = common_vendor.ref(false);
    const lastVolume = common_vendor.ref(50);
    const volumeIcon = common_vendor.computed(() => {
      if (isMuted.value || volume.value === 0) {
        return "fa-volume-off";
      } else if (volume.value < 50) {
        return "fa-volume-down";
      } else {
        return "fa-volume-up";
      }
    });
    let startAngle = 0;
    let currentAngle = 0;
    let isDragging = false;
    function startRotate(event) {
      const touch = event.touches[0];
      const knob = event.currentTarget;
      const rect = knob.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      startAngle = Math.atan2(
        touch.clientY - center.y,
        touch.clientX - center.x
      ) * 180 / Math.PI;
      isDragging = true;
      currentAngle = rotation.value;
    }
    function rotate(event) {
      if (!isDragging)
        return;
      const touch = event.touches[0];
      const knob = event.currentTarget;
      const rect = knob.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      const angle = Math.atan2(
        touch.clientY - center.y,
        touch.clientX - center.x
      ) * 180 / Math.PI;
      let deltaAngle = angle - startAngle;
      rotation.value = (currentAngle + deltaAngle + 360) % 360;
    }
    function endRotate() {
      isDragging = false;
    }
    function toggleMute() {
      if (isMuted.value) {
        volume.value = lastVolume.value;
        isMuted.value = false;
      } else {
        lastVolume.value = volume.value;
        volume.value = 0;
        isMuted.value = true;
      }
    }
    function onVolumeChange(event) {
      volume.value = event.detail.value;
      if (volume.value > 0) {
        isMuted.value = false;
      }
    }
    function togglePower(event) {
      power.value = event.detail.value;
    }
    return (_ctx, _cache) => {
      return {
        a: power.value,
        b: common_vendor.o(togglePower),
        c: "rotate(" + rotation.value + "deg)",
        d: common_vendor.o(startRotate),
        e: common_vendor.o(rotate),
        f: common_vendor.o(endRotate),
        g: common_vendor.n(volumeIcon.value),
        h: common_vendor.o(toggleMute),
        i: volume.value,
        j: common_vendor.o(onVolumeChange)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Project/Front/memhouse_font_new/pages/devicecontrol/index.vue"]]);
wx.createPage(MiniProgramPage);
