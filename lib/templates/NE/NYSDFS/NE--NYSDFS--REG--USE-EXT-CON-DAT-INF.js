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
            await page.waitForSelector(".page-body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = document.querySelector("h1 > strong");
                wrapElement(document, rootTitle, "level1");

                const issueDates = document.querySelectorAll("p")[0];
                const issueDate = new Date(issueDates.textContent).getFullYear() + "-" + 
                    ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" +
                    ("0" + new Date(issueDates.textContent).getDate()).slice(-2);
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".page-body");
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll("p");
                for(const contentChild of level2Element){
                    if(contentChild.textContent.includes("I.")){
                        wrapElement(document, contentChild, "level2");
                    }
                }

                const level3Element = document.querySelectorAll("p > strong");
                for(const contentChild of level3Element){
                    if(contentChild.textContent.includes("A.") || contentChild.textContent.includes("B.")){
                        wrapElement(document, contentChild, "level3");
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