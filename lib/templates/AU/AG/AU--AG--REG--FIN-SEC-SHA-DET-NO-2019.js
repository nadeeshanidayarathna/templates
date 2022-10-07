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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector("#MainContent_pnlHtmlControls > div > .WordSection1  > p:nth-child(2)");
                wrapElement(document, level1Element, "level1");

                wrapElementDate(document, "issue-date", "2019-08-22" + "T00:00:00");
               // wrapElementDate(document, "effective-date", "2022-11-28" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("#MainContent_pnlHtmlControls")[0];
                wrapElement(document, content, "ease-content");
                Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls>div > div >p img"), function (node) { node.remove(); });
     


                const level21Elements = document.querySelectorAll('.WordSection1  > p:nth-child(24)');
                wrapElements(document, level21Elements, 'level2');

                
              
              
                const level2Elements = document.querySelectorAll(".WordSection1  > h4 > span");
        for (const level2Element of level2Elements) {
            if (level2Element.style.fontSize == '12pt') {
                wrapElement(document, level2Element, "level3");
            }  
        }

        const level22Elements = document.querySelectorAll(".WordSection1  > h4 > span");
        for (const level22Element of level22Elements) {
            if (level22Element.textContent.match(/^Interpretation/)) {
                wrapElement(document, level22Element, "level3");
            }  
        }
               
                // removing unwanted content from ease-content

                // Array.prototype.forEach.call(document.querySelectorAll(".detail_gn"), function (node) { node.remove(); });
                // TODO:

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true);
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