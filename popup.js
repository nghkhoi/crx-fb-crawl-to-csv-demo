async function handleGetData() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        function printElement() {
            const text = document.querySelectorAll(
                "[role=feed] > div > div.x1lliihq"
            );
            if (text.length < 10) {
                window.scrollTo(0, document.body.scrollHeight);
                setTimeout(() => printElement(), 3000);
            }
            const listElement = [];
            for (let i = 0; i < text.length; i++) {
                // const checkBtnMore = text[i].querySelector("[role=button]");

                const subtext = text[i].querySelector(
                    "[data-ad-comet-preview=message]"
                )?.textContent;
                if (subtext) {
                    listElement.push(subtext);
                }
            }

            if (listElement.length < 10) {
                window.scrollTo(0, document.body.scrollHeight);
                setTimeout(() => printElement(), 3000);
            }
            (async () => {
                chrome.runtime.sendMessage({
                    data: listElement,
                });
            })();
            return listElement;
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
function getCSVLinkElement(arr) {
    const link = document.getElementById("save-file");
    link.download = "file.csv";
    const csv = arr.join("\n");
    link.classList.add("save");
    link.href =
        "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csv);
}
function getGoogleSheetElement(data) {
    chrome.storage.sync.get(["googleApiKey"], async (token) => {
        if (token) {
            const res = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/1Zg_Szge-pwy5oqtTeGh5QLh7xbmfv5BA3kdIIVWcnIU/?key=AIzaSyD5pl-SKDnIS59PHBRDHNGAEVFCk-5Kbqc&includeGridData=true`
            );
            const result = await res.json();
            let sheetLength = result.sheets[0].data[0].rowData?.length || 0;

            data = data.map((item) => {
                return [new Date(), item];
            });
            for (let item in data) {
                sheetLength += 1;
                let fetchURL = `https://sheets.googleapis.com/v4/spreadsheets/1Zg_Szge-pwy5oqtTeGh5QLh7xbmfv5BA3kdIIVWcnIU/values/A${sheetLength}:B${sheetLength}:append?valueInputOption=RAW&key=AIzaSyD5pl-SKDnIS59PHBRDHNGAEVFCk-5Kbqc`;
                let valueRange = {
                    majorDimension: "rows",
                    range: `A${sheetLength}:B${sheetLength}`,
                    values: [data[item]],
                };
                let fetchOptions = {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + token.googleApiKey,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(valueRange),
                };
                await fetch(fetchURL, fetchOptions)
                    .then((response) => response.json())
                    .then((obj) => console.log(obj));
            }
        } else {
            console.log("token: ", token);
        }
    });

    // });
}
document.getElementById("button").addEventListener("click", handleGetData);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(
        sender.tab
            ? "from a content script: " + sender.tab.url
            : "from the extension"
    );
    const dataArray = request.data;
    if (dataArray && sender.url.includes("https://www.facebook.com")) {
        const resp = [];
        for (let i = 0; i < dataArray.length; i++) {
            resp.push(`<li>${dataArray[i]}</li>`);
        }
        document.getElementById("list-tags").innerHTML = resp.join("");
        const saveSheetBtn = document.getElementById("save-sheet");
        saveSheetBtn.classList.add("save");
        saveSheetBtn.addEventListener("click", async () => {
            getGoogleSheetElement(dataArray);
        });
        getCSVLinkElement(request.data);
    } else {
        document.getElementById(
            "list-tags"
        ).innerHTML = `<span style="color:red;">Extension can only be used on the Facebook page</span>`;
    }
});
