let isPaused = false;
let requests = new Map();
let selectedRequestId = null;

// 连接到background script
const port = chrome.runtime.connect({ name: "panel" });

// 监听来自background的消息
port.onMessage.addListener((message) => {
    if (message.type === 'request') {
        updateRequest(message.data);
    }
});

function updateRequest(request) {
    if (isPaused) return;
    
    requests.set(request.requestId, request);
    updateRequestList();
    
    if (selectedRequestId === request.requestId) {
        showRequestDetails(request);
    }
}

function updateRequestList() {
    const filterValue = document.getElementById('filterInput').value.toLowerCase();
    const requestList = document.getElementById('requestList');
    const filteredRequests = Array.from(requests.values())
        .filter(request => {
            return request.url.toLowerCase().includes(filterValue) ||
                   request.method.toLowerCase().includes(filterValue);
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    requestList.innerHTML = filteredRequests.length === 0 
        ? `<div class="empty-state">
             <div class="empty-state-icon">🔍</div>
             <h3>No Requests Found</h3>
             <p>${requests.size === 0 ? 'Start browsing to capture network requests' : 'Try adjusting your filter'}</p>
           </div>`
        : '';

    filteredRequests.forEach(request => {
        const requestElement = document.createElement('div');
        requestElement.className = 'request-item' + (request.requestId === selectedRequestId ? ' selected' : '');
        
        const statusClass = `status-${request.status}`;
        const statusText = request.statusCode || (request.status === 'error' ? 'ERR' : '...');
        
        requestElement.innerHTML = `
            <div class="method">${request.method}</div>
            <div class="url" title="${request.url}">${request.url}</div>
            <div class="status ${statusClass}">${statusText}</div>
        `;

        requestElement.addEventListener('click', () => {
            document.querySelectorAll('.request-item').forEach(item => item.classList.remove('selected'));
            requestElement.classList.add('selected');
            selectedRequestId = request.requestId;
            showRequestDetails(request);
        });

        requestList.appendChild(requestElement);
    });
}

function showRequestDetails(request) {
    const detailsDiv = document.getElementById('requestDetails');
    detailsDiv.style.display = 'block';
    
    let detailsHtml = `
        <div class="detail-section">
            <h3>General Information</h3>
            <pre>
URL: ${request.url}
Method: ${request.method}
Status: ${request.statusCode || 'N/A'}
Timestamp: ${new Date(request.timestamp).toLocaleString()}
Type: ${request.type}
            </pre>
        </div>
    `;

    if (request.requestHeaders) {
        detailsHtml += `
            <div class="detail-section">
                <h3>Request Headers</h3>
                <pre>${JSON.stringify(request.requestHeaders, null, 2)}</pre>
            </div>
        `;
    }

    if (request.requestBody) {
        detailsHtml += `
            <div class="detail-section">
                <h3>Request Body</h3>
                <pre>${JSON.stringify(request.requestBody, null, 2)}</pre>
            </div>
        `;
    }

    if (request.responseHeaders) {
        detailsHtml += `
            <div class="detail-section">
                <h3>Response Headers</h3>
                <pre>${JSON.stringify(request.responseHeaders, null, 2)}</pre>
            </div>
        `;
    }

    if (request.error) {
        detailsHtml += `
            <div class="detail-section">
                <h3>Error Details</h3>
                <pre>${request.error}</pre>
            </div>
        `;
    }

    detailsDiv.innerHTML = detailsHtml;
}

// 事件监听器
document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all requests?')) {
        requests.clear();
        selectedRequestId = null;
        document.getElementById('requestDetails').style.display = 'none';
        updateRequestList();
    }
});

document.getElementById('exportBtn').addEventListener('click', () => {
    const requestsArray = Array.from(requests.values());
    const exportData = {
        timestamp: new Date().toISOString(),
        metadata: {
            totalRequests: requestsArray.length,
            exportedBy: 'CS Magic Network Monitor',
            version: '1.0'
        },
        requests: requestsArray
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network_requests_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('filterInput').addEventListener('input', (e) => {
    updateRequestList();
});

document.getElementById('pauseBtn').addEventListener('click', (e) => {
    isPaused = !isPaused;
    e.target.innerHTML = `<span>${isPaused ? '▶️' : '⏸'}</span>${isPaused ? 'Resume' : 'Pause'}`;
    e.target.style.backgroundColor = isPaused ? '#ffebee' : '#fff';
});
