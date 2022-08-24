const { group } = require("yargs");
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
            await page.waitForSelector(".act-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('td > p > b')[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2010-05-05" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.act-content');
                wrapElement(document, contentElement, "ease-content");

                const Elements = document.querySelectorAll('.act-content > table > tbody > tr > td:nth-of-type(3) a');
                for(const Element of Elements){
                    if(Element.textContent.includes("PART ")){
                        wrapElement(document, Element, "level2");
                    } else if((Element.textContent.includes("Chapter") && (!Element.textContent.includes(".")))){
                        wrapElement(document, Element, "level3");
                    } else if((Element.textContent.includes("SCHEDULE") || (Element.textContent.includes(".")))){
                        wrapElement(document, Element, "level4");
                    }
                }


                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("td > p > img"), function (node) { node.remove(); });
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