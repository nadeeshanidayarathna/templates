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

                const level1Element = document.querySelectorAll('p')[4];
                wrapElement(document, level1Element, "level1");
                const issueDates = document.querySelectorAll('p')[8];
                    let fullText = issueDates.textContent;
                    let check = (fullText.indexOf(" ") + 1)
                    let part2 = fullText.substring(check, fullText.length);
                const dateFormat = (new Date(part2.replace(/(\d+)(st|nd|rd|th)/, "$1")).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('.right');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('.WordSection2 > p > b');
                for(const element of level2Element){
                    if(element.textContent.match(/^([0-1])/)){  
                        let arrList = [];
                        arrList.push(element);
                        arrList.push(element.nextElementSibling);
                        wrapElements(document, arrList, "level2", group = true);  

                    } else if(element.textContent.match(/^([2-9])/)){
                        wrapElement(document, element, "level2"); 
                    }
                }
                const footnoteElement = document.querySelector('#ftn1');
                wrapElement(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 img"), function (node) { node.remove(); });
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