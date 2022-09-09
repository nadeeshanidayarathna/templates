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

            const delayDownload = {
                waitUntil: "networkidle0",
                timeout: 0
            }
            await base.downloadPage(page, url, sp, path, delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".document-details-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.Titel');
                wrapElement(document, level1Element, "level1");

                let dateString = document.querySelector("h5")
                let stringDate = dateString.textContent.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/g);
                let issueDate = stringDate.toString().split("/").reverse().join("-");
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.document-details-content');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll(".PARAGRAF > .Paragraftekst > b");
                for(const element of level2Elements){
                    if(!element.nextSibling.textContent.match(/afskedigelser/)){
                        wrapElement(document, element, "level2");
                    }
                }
                

                const footnoteElement = document.querySelectorAll(".MsoFootnoteText");
                wrapElements(document, footnoteElement, "footnote");
        
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".col-5, .row > .col-md-6 > .my-2, .row > .col-md-6 > .py-2, .py-2"), function (node) { node.remove(); });
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