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
            await base.downloadPage(page, url, sp, path, null , encoding = 'utf16le');
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('h1');
                wrapElements(document, level1Element, "level1", group= "true");
                wrapElementDate(document, "issue-date", "2005-07-02" + "T00:00:00");
                
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.WordSection1');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll(".MsoNormal");
                const regex1 = /(^[A-Z]\.\s)/;
                for(const contentChild of level2Elements){
                    if(contentChild.textContent.match(regex1)){
                        wrapElement(document, contentChild, "level2");
                    }
                }

                const level3Elements = document.querySelectorAll(".MsoNormal");
                const regex2 = /(^\d\.)/i;
                for (const contentChild of level3Elements) {
                    if (contentChild.textContent.match(regex2)) {
                            level3Text = contentChild.textContent.match(regex2)[1];
                            contentChild.innerHTML = contentChild.innerHTML.replace(level3Text, "<div title=\"level3\" class=\"level3\">" + level3Text + "</div>");
                    }
                }

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