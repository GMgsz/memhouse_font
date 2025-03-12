"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const messageData = common_vendor.ref({
      image: "/static/refdiagrams/test1.jpg",
      transcript: "这是一段示例文本，展示从语音转录得到的内容。在实际应用中，这里会显示用户录音转录后的详细文本。这里可以显示更多的文本内容，用户可以通过滚动查看。".repeat(10),
      aiPreview: "这是AI编辑后的预览文本，展示经过AI处理后的优化内容。在实际应用中，这里会显示AI处理后的文本效果。".repeat(10)
    });
    const isPlaying = common_vendor.ref(false);
    const progress = common_vendor.ref(0);
    const currentTime = common_vendor.ref(0);
    const duration = common_vendor.ref(45);
    const activeTab = common_vendor.ref("transcript");
    const scrollTop = common_vendor.ref(0);
    common_vendor.ref(null);
    const showPopup = common_vendor.ref(false);
    const currentTool = common_vendor.ref({
      type: "",
      label: "",
      options: [],
      selected: ""
    });
    const toolbarItems = [
      {
        type: "style",
        label: "AI风格转换",
        icon: "fa fa-magic",
        isActive: false,
        options: [
          { label: "轻松活泼", value: "casual", icon: "fa fa-sun-o" },
          { label: "幽默风格", value: "humor", icon: "fa fa-smile-o" },
          { label: "叙事风格", value: "narrative", icon: "fa fa-book" },
          { label: "诗歌风格", value: "poetry", icon: "fa fa-feather" }
        ]
      },
      {
        type: "emotion",
        label: "情感调整",
        icon: "fa fa-heart",
        isActive: false,
        options: [
          { label: "积极正面", value: "positive", icon: "fa fa-sun-o" },
          { label: "温和平静", value: "calm", icon: "fa fa-moon-o" },
          { label: "热情洋溢", value: "enthusiastic", icon: "fa fa-fire" },
          { label: "严肃正式", value: "serious", icon: "fa fa-university" }
        ]
      },
      {
        type: "length",
        label: "长度调整",
        icon: "fa fa-arrows-v",
        isActive: false,
        options: [
          { label: "精简版本", value: "brief", icon: "fa fa-compress" },
          { label: "标准版本", value: "standard", icon: "fa fa-equals" },
          { label: "详细版本", value: "detailed", icon: "fa fa-expand" }
        ]
      },
      {
        type: "more",
        label: "更多",
        icon: "fa fa-ellipsis",
        isActive: false,
        options: [
          { label: "保存草稿", value: "save", icon: "fa fa-floppy-disk" },
          { label: "复制文本", value: "copy", icon: "fa fa-copy" },
          { label: "分享", value: "share", icon: "fa fa-share-alt" }
        ]
      }
    ];
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    function togglePlay() {
      isPlaying.value = !isPlaying.value;
      if (isPlaying.value)
        ;
    }
    function onProgressChange(e) {
      progress.value = e.detail.value;
      currentTime.value = duration.value * progress.value / 100;
    }
    function switchTab(tab) {
      activeTab.value = tab;
      scrollTop.value = 0;
    }
    function handleToolClick(item) {
      currentTool.value = {
        type: item.type,
        label: item.label,
        options: item.options,
        selected: ""
      };
      showPopup.value = true;
    }
    function selectOption(option) {
      currentTool.value.selected = option.value;
      activeTab.value = "ai-preview";
      closePopup();
      common_vendor.index.showToast({
        title: `已应用${option.label}`,
        icon: "none"
      });
    }
    function closePopup() {
      showPopup.value = false;
    }
    function onScroll(e) {
      requestAnimationFrame(() => {
        scrollTop.value = e.detail.scrollTop;
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: messageData.value.image,
        b: common_vendor.n(isPlaying.value ? "fa fa-pause" : "fa fa-play"),
        c: common_vendor.o(togglePlay),
        d: progress.value,
        e: common_vendor.o(onProgressChange),
        f: common_vendor.t(formatTime(currentTime.value)),
        g: common_vendor.t(formatTime(duration.value)),
        h: activeTab.value === "transcript" ? 1 : "",
        i: common_vendor.o(($event) => switchTab("transcript")),
        j: activeTab.value === "ai-preview" ? 1 : "",
        k: common_vendor.o(($event) => switchTab("ai-preview")),
        l: common_vendor.t(activeTab.value === "transcript" ? messageData.value.transcript : messageData.value.aiPreview),
        m: scrollTop.value,
        n: common_vendor.o(onScroll),
        o: common_vendor.f(toolbarItems, (item, index, i0) => {
          return {
            a: common_vendor.n(item.icon),
            b: common_vendor.t(item.label),
            c: index,
            d: common_vendor.n({
              active: item.isActive
            }),
            e: common_vendor.n(`toolbar-item-${item.type}`),
            f: common_vendor.o(($event) => handleToolClick(item), index)
          };
        }),
        p: showPopup.value
      }, showPopup.value ? {
        q: common_vendor.t(currentTool.value.label),
        r: common_vendor.o(closePopup),
        s: common_vendor.f(currentTool.value.options, (option, index, i0) => {
          return common_vendor.e({
            a: common_vendor.n(option.icon),
            b: common_vendor.t(option.label),
            c: currentTool.value.selected === option.value
          }, currentTool.value.selected === option.value ? {} : {}, {
            d: index,
            e: currentTool.value.selected === option.value ? 1 : "",
            f: common_vendor.o(($event) => selectOption(option), index)
          });
        }),
        t: common_vendor.o(() => {
        }),
        v: common_vendor.n(`popup-type-${currentTool.value.type}`),
        w: common_vendor.o(closePopup)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "E:/Project/Front/memhouse_font_new/pages/message/edit.vue"]]);
wx.createPage(MiniProgramPage);
