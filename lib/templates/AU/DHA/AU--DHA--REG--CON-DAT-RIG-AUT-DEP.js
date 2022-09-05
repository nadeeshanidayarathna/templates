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
            await page.waitForSelector(".right");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.ShortT');
                wrapElement(document, level1Element, "level1");

                const issueDates = document.querySelector(".WordSection1 > p:nth-of-type(4) > span");
                const issueDate = (new Date(issueDates.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates.textContent).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".right");
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll(".ActHead5 a");
                // wrapElements(document, level2Elements, "level2");
                for(const level2Element of level2Elements){
                    if(level2Element.nodeName == "A" && level2Element.textContent != ""){
                        wrapElement(document, level2Element, "level2");
                    }
                  
                }

                

                // removing unwanted content from ease-content
               // const deleteElement = document.querySelectorAll('.ActHead5 a')[1]
                //Array.prototype.forEach.call(deleteElement, function (node) { node.remove(); });

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