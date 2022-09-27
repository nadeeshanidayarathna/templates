const base = require("../../../common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".field--name-body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1 > span');
                wrapElement(document, level1Element, "level1");

                const issueDates = document.querySelectorAll('.field__item >p:nth-of-type(1)')[11];
                const issueDate = (new Date(issueDates.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates.textContent).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.field--name-body');
                wrapElement(document, contentElement, "ease-content");

                const regex1 = /(^(IX|IV|V?I{0,3})\.\s)/;
                const regex2 = /(^[A-Z]\.\s)/;
                const regex3 = /(^(ix|iv|v?i{0,3})\.\s)/;

                var level2Element = document.querySelector("#content .field__items").innerHTML;
                var temp = level2Element.split("<br><br>");
                temp.forEach( e => {
                    if(e.trim().match(regex1)){
                        var pElement = document.createElement("strong");
                        pElement.innerHTML = e;
                        document.querySelector("#content .field__items").appendChild(pElement);
                    }else{
                        var pElement = document.createElement("p");
                        pElement.innerHTML = e;
                        document.querySelector("#content .field__items").appendChild(pElement);
                    }
                })
                
                const items = document.querySelectorAll("#content .field__item > *");
                for (var i=1; i<items.length; i++) {
                    items[i].remove();
                }

                const elements = document.querySelectorAll("strong");
                for (const contentChild of elements) {
                    if (contentChild.textContent.trim().match(regex1)) {
                        wrapElement(document, contentChild, "level2");
                    }
                    else if (contentChild.textContent.match(regex2)) {
                        wrapElement(document, contentChild, "level3");
                    }
                    else if (contentChild.textContent.match(regex3)) {
                        wrapElement(document, contentChild, "level4");
                    }
                }

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, true);
            await page.close();
        }
        await base.test().runPageTest(browser, url, sp, path);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;