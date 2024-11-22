// 存储所有连接的面板端口
const ports = new Set();

// 处理面板连接
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "panel") {
        ports.add(port);
        port.onDisconnect.addListener(() => {
            ports.delete(port);
        });
    }
});

// 监听请求
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (details.type === 'xmlhttprequest') {
            const request = {
                requestId: details.requestId,
                url: details.url,
                method: details.method,
                timestamp: new Date().toISOString(),
                requestBody: details.requestBody,
                type: details.type,
                status: 'pending'
            };
            
            // 广播请求信息到所有连接的面板
            broadcastToDevTools({
                type: 'request',
                data: request
            });
        }
    },
    { urls: ["<all_urls>"] },
    ["requestBody"]
);

chrome.webRequest.onCompleted.addListener(
    (details) => {
        if (details.type === 'xmlhttprequest') {
            const request = {
                requestId: details.requestId,
                url: details.url,
                method: details.method,
                timestamp: new Date().toISOString(),
                statusCode: details.statusCode,
                responseHeaders: details.responseHeaders,
                type: details.type,
                status: 'completed'
            };
            
            broadcastToDevTools({
                type: 'request',
                data: request
            });
        }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);

chrome.webRequest.onErrorOccurred.addListener(
    (details) => {
        if (details.type === 'xmlhttprequest') {
            const request = {
                requestId: details.requestId,
                url: details.url,
                method: details.method,
                timestamp: new Date().toISOString(),
                error: details.error,
                type: details.type,
                status: 'error'
            };
            
            broadcastToDevTools({
                type: 'request',
                data: request
            });
        }
    },
    { urls: ["<all_urls>"] }
);

// 广播消息到所有连接的devtools面板
function broadcastToDevTools(message) {
    ports.forEach(port => {
        try {
            port.postMessage(message);
        } catch (e) {
            console.error('Error posting message to devtools:', e);
        }
    });
}
