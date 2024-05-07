chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {},
    });
});
chrome.runtime.onInstalled.addListener(function (
    request,
    sender,
    sendResponse
) {
    chrome.identity.getAuthToken(
        {
            interactive: true,
        },
        async function (token) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
            } else {
                await chrome.storage.sync.set({
                    googleApiKey: token,
                });
            }
        }
    );
});
