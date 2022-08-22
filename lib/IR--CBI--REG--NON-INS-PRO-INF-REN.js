const base = require("./common/base");

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
            await page.waitForSelector(".container-fluid");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const selectTitle = document.querySelector(".content-title").textContent;
                let rootTitle = selectTitle.substring(selectTitle.indexOf("-") + 1, selectTitle.length);
                wrapElementLevel1(document, rootTitle);

                const dateElements = document.querySelector(".t1 td:nth-child(2)").textContent.trim().replace("    ,","");
                const dateFormat = new Date(dateElements.substring(0, 2) + " " + dateElements.substring(12, 20) + " " + dateElements.substring(26, 30)).toLocaleDateString("fr-CA");
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
            
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".container-fluid");
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("p");
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.trim().startsWith("EXPLANATORY NOTE")) {
                        wrapElement(document, level2Element, "level2");
                    }
                };

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".document-toolbar"),function (node) {node.remove();});
                Array.prototype.forEach.call(document.querySelectorAll(".breadcrumb"),function (node) {node.remove();});
                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, false);
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