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
            await page.waitForSelector(".page_textes > table tbody tbody > tr:nth-of-type(2) > td");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.LVL_0');
                wrapElement(document, level1Element.childNodes[0], "level1");
                wrapElementDate(document, "issue-date", "2022-09-09" + "T00:00:00");
                wrapElementDate(document, "effective-date", "1945-01-25" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.page_textes > table tbody tbody > tr:nth-of-type(2) > td');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.ARTFT')[18];
                let level2Text = /Art\..*20.*\..*—/s.exec(level2Element.outerHTML);
                level2Element.outerHTML = level2Element.outerHTML.replace(level2Text, "<div class=\"level2\" title=\"level2\">" + level2Text + "</div>")
                const level2Elements = document.querySelectorAll('.ARTFT');
                for (const elements of level2Elements) {
                    let level2ElementArr = [];
                    for (const element of elements.childNodes) {
                        if (element.className == 'NUMART1_GEN' || element.className == 'NUMART1') {
                            level2ElementArr.push(element);
                        }
                    }
                    wrapElements(document, level2ElementArr, 'level2', group = true);
                }
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("a[shape='rect']"), function (node) { node.remove(); });
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