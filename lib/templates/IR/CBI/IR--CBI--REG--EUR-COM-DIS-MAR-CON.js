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
            await page.waitForSelector(".container-fluid");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const selectTitle = document.querySelector("h1").textContent;
                let rootTitle = selectTitle.substring(selectTitle.indexOf("-") + 1, selectTitle.length);
                wrapElementLevel1(document, rootTitle);

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.container-fluid');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('p');
                for(const element of elements){
                    if(element.textContent.includes("PART") || element.textContent.includes("SCHEDULE") || element.textContent.includes("EXPLANATORY")){
                        wrapElement(document, element, "level2");
                    } 
                }

                const ielements = document.querySelectorAll('i');
                for(const ielement of ielements){
                    if(ielement.textContent.length > 1 && (!ielement.textContent.includes(" interpretation"))){
                        wrapElement(document, ielement, "level3");
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".breadcrumb, .nav, p > img"),function (node) {node.remove();});
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