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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("h1");
                 wrapElement(document, level1Element, "level1");
                // wrapElementDate(document, issueDateElement, "issue-date", issueDateElement.textContent + "T00:00:00");
                // wrapElementDate(document, effectiveDateElement, "effective-date", effectiveDateElement.textContent + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelectorAll("body");
                 wrapElements(document, contentElement, "ease-content");

                 const level2Element = document.querySelectorAll('h2');
                  for (let i = 0; i < level2Element.length; i++) {
                    wrapElement(document, level2Element[i], "level2");
                  }

                  const level3Element = document.querySelectorAll('h3');
                  for (let i = 0; i < level3Element.length; i++) {
                    wrapElement(document, level3Element[i], "level3");
                  }
                
                  const level4Element = document.querySelectorAll('h4');
                  for (let i = 0; i < level4Element.length; i++) {
                    wrapElement(document, level4Element[i], "level4");
                  }
                // wrapElement(document, level5Element, "level5");
                // wrapElement(document, level6Element, "level6");
                // wrapElement(document, level7Element, "level7");
                // wrapElement(document, level8Element, "level8");
                // wrapElement(document, level9Element, "level9");
                // wrapElement(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                
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