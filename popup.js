document.addEventListener('DOMContentLoaded', () => {
  const requestList = document.getElementById('requestList');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');

  function updateRequestList() {
    chrome.storage.local.get(null, (items) => {
      requestList.innerHTML = '';
      const requests = Object.entries(items)
        .filter(([key]) => key.startsWith('request_'))
        .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));

      requests.forEach(([key, request]) => {
        const requestElement = document.createElement('div');
        requestElement.className = 'request-item';
        
        const statusClass = `status-${request.status}`;
        requestElement.innerHTML = `
          <div>
            <strong class="${statusClass}">${request.method}</strong> 
            ${request.url}
          </div>
          <div class="request-details">
            <strong>Status:</strong> ${request.statusCode || 'N/A'}<br>
            <strong>Timestamp:</strong> ${request.timestamp}<br>
            <strong>Type:</strong> ${request.type}<br>
            ${request.requestBody ? `
              <strong>Request Body:</strong>
              <pre>${JSON.stringify(request.requestBody, null, 2)}</pre>
            ` : ''}
            ${request.responseHeaders ? `
              <strong>Response Headers:</strong>
              <pre>${JSON.stringify(request.responseHeaders, null, 2)}</pre>
            ` : ''}
            ${request.error ? `
              <strong>Error:</strong>
              <pre>${request.error}</pre>
            ` : ''}
          </div>
        `;

        requestElement.addEventListener('click', () => {
          const details = requestElement.querySelector('.request-details');
          details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });

        requestList.appendChild(requestElement);
      });
    });
  }

  clearBtn.addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      updateRequestList();
    });
  });

  exportBtn.addEventListener('click', () => {
    chrome.storage.local.get(null, (items) => {
      const requests = Object.entries(items)
        .filter(([key]) => key.startsWith('request_'))
        .map(([_, request]) => request);

      const blob = new Blob([JSON.stringify(requests, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `network_requests_${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // Update the list initially and every second
  updateRequestList();
  setInterval(updateRequestList, 1000);
});
