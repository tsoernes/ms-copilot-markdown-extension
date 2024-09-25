console.log("Background script loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  chrome.contextMenus.create({
    id: "downloadMarkdown",
    title: "Download Conversation to Markdown",
    contexts: ["all"],
    documentUrlPatterns: ["https://copilot.microsoft.com/*"]
  });

  chrome.contextMenus.create({
    id: "copyMarkdown",
    title: "Copy Conversation to Markdown",
    contexts: ["all"],
    documentUrlPatterns: ["https://copilot.microsoft.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu item clicked:", info.menuItemId);
  if (info.menuItemId === "downloadMarkdown") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractAndDownloadMessages
    });
  } else if (info.menuItemId === "copyMarkdown") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractAndCopyMessages
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request.action);
  if (request.action === "download") {
    const blob = new Blob([request.data], { type: "text/markdown" });
    createObjectURL(blob).then(url => {
      const now = new Date();
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      };
      const localTime = new Intl.DateTimeFormat('sv-SE', options).format(now).replace(/:/g, '-').replace(' ', 'T').slice(0, 16);
      const filename = `copilot_${localTime}.md`;
      chrome.downloads.download({
        url: url,
        filename: filename,
        conflictAction: 'overwrite',
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("Download failed:", chrome.runtime.lastError);
        } else {
          console.log("Download started with ID:", downloadId);
        }
      });
    }).catch(error => {
      console.error("Failed to create object URL:", error);
    });
  } else if (request.action === "copy") {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      function: copyToClipboard,
      args: [request.data]
    });
  }
});

function createObjectURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function extractAndDownloadMessages() {
  const messages = extractMessages();
  if (messages) {
    chrome.runtime.sendMessage({ action: "download", data: messages });
  }
}

function extractAndCopyMessages() {
  const messages = extractMessages();
  if (messages) {
    chrome.runtime.sendMessage({ action: "copy", data: messages });
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log("Conversation copied to clipboard");
  }).catch(err => {
    console.error("Failed to copy: ", err);
  });
}

