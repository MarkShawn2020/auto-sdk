chrome.devtools.panels.create(
    "Network Monitor",
    null,
    "panel.html",
    (panel) => {
        panel.onShown.addListener(function(window) {
            // 面板显示时的回调
            console.log("panel shown");
        });
        panel.onHidden.addListener(function() {
            // 面板隐藏时的回调
            console.log("panel hidden");
        });
    }
);
