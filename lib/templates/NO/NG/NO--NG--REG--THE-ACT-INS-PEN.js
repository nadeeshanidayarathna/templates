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
            await page.waitForSelector("#lovdataDocument");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.metaTitleText h1');
                wrapElement(document, level1Element, "level1");
                const issueDates = document.querySelector('#metaField_rettet');
                const issueDateText = /\d{2}\.\d{2}\.\d{4}/.exec(issueDates.textContent);
                const issueDate = issueDateText[0].slice(6,10) + "-" + issueDateText[0].slice(3,5) + "-" + issueDateText[0].slice(0,2); 
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");
                const effectiveDates = document.querySelector('#metaField_ikraft');
                const effectiveDateText = /\d{2}\.\d{2}\.\d{4}$/.exec(effectiveDates.textContent);
                const effectiveDate = effectiveDateText[0].slice(6,10) + "-" + effectiveDateText[0].slice(3,5) + "-" + effectiveDateText[0].slice(0,2);
                wrapElementDate(document, "effective-date", effectiveDate + "T00:00:00");
                console.log(issueDateText[0])
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#lovdataDocument');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h2');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('h3');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelectorAll('h4');
                wrapElements(document, level4Element, "level4");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".lt-ajour-varsel, .chapter-index-title, ul.chapter-index,.share-paragraf-title, .share-paragraf > i"), function (node) { node.remove(); });
                
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