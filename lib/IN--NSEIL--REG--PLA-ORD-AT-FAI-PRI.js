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
            await page.waitForSelector(".c26");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const rootTitles = document.querySelectorAll('.c11')[6];
                wrapElement(document, rootTitles, "level1");
                // wrapElementDate(document, issueDateElement, "issue-date", issueDateElement.textContent + "T00:00:00");
                // wrapElementDate(document, effectiveDateElement, "effective-date", effectiveDateElement.textContent + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelectorAll('.c26')[0];
                wrapElement(document, content, "ease-content");
                // wrapElement(document, level2Element, "level2");
                // wrapElement(document, level3Element, "level3");
                // wrapElement(document, level4Element, "level4");
                // wrapElement(document, level5Element, "level5");
                // wrapElement(document, level6Element, "level6");
                // wrapElement(document, level7Element, "level7");
                // wrapElement(document, level8Element, "level8");
                // wrapElement(document, level9Element, "level9");
                // wrapElement(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                // TODO:

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