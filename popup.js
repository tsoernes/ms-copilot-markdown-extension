<!DOCTYPE html>
<html>
<head>
  <title>Microsoft Copilot Markdown Downloader</title>
</head>
<body>
  <button id="extract">Extract Messages</button>
  <script>
    document.getElementById('extract').addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: extractMessages
        });
      });
    });
  </script>
</body>
</html>

