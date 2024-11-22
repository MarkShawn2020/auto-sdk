# Network Request Monitor Chrome Extension

This Chrome extension allows you to monitor and analyze network requests made during page interactions.

## Features

- Captures XMLHttpRequest (XHR) and Fetch API requests
- Shows request details including method, URL, status, and timestamps
- Displays request and response headers
- Allows exporting captured requests to JSON
- Real-time updates of network activity
- Clear request history functionality

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension directory

## Usage

1. Click the extension icon in Chrome's toolbar to open the monitoring panel
2. Browse websites normally - the extension will automatically capture network requests
3. Click on any request in the list to view its details
4. Use the "Clear All" button to reset the request history
5. Use the "Export" button to download the captured requests as a JSON file

## Request Information Captured

- URL
- HTTP Method
- Timestamp
- Request Body (if available)
- Response Headers
- Status Code
- Error Information (if any)

## Notes

- The extension only captures XMLHttpRequest (XHR) requests
- Requests are stored in Chrome's local storage
- The popup window refreshes every second to show new requests