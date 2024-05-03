async function handleClick() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        function printElement() {
            const element = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
            const listElement = [];
            for (let i = 0; i < element.length; i++) {
                listElement.push(element[i].textContent);
            }

            (async () => {
                chrome.runtime.sendMessage({
                    data: listElement,
                });
            })();
        }

        chrome.scripting
            .executeScript({
                target: { tabId: tab.id },
                func: printElement,
            })
            .then((e) => {
                console.log(e);
            });
    });
}
document.getElementById("button").addEventListener("click", handleClick);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(
        sender.tab
            ? "from a content script: " + sender.tab.url
            : "from the extension"
    );

    function getCSVLinkElement(arr) {
        const link = document.getElementById("save-file");
        link.download = "file.csv";
        const csv = arr.join("\n");
        link.classList.add("save");
        link.href =
            "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csv);
    }

    const resp = [];

    if (request.data && sender.url.includes("https://www.facebook.com")) {
        for (let i = 0; i < request.data.length; i++) {
            resp.push(`<li>${request.data[i]}</li>`);
        }
        document.getElementById("list-tags").innerHTML = resp.join("");
        getCSVLinkElement(request.data);
    } else {
        console.log("get data failed");
        document.getElementById(
            "list-tags"
        ).innerHTML = `<span style="color:red;">Extension can only be used on the Facebook page</span>`;
    }
});
