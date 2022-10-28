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
            await page.waitForSelector("#textTabContent");
            await page.evaluate(function process() {

                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelectorAll(".oj-doc-ti");
                wrapElements(document, level1Element, "level1", group=true);
        
                wrapElementDate(document, "issue-date", "2022-06-14" + "T00:00:00");
               wrapElementDate(document, "effective-date", "2022-12-15" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector("#textTabContent");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelectorAll('.oj-ti-section-1');
                for(const child of level2Element){
                    if(child.textContent.match(/^CHAPTER/)){
                        wrapElement(document, child, "level2");
                    } else if(child.textContent.match(/Section/)){
                        wrapElement(document, child, "level3");
                    }
                }

                const level3Element = document.querySelectorAll('.oj-ti-art');
                wrapElements(document, level3Element, "level4");

                const footnoteElement = document.querySelectorAll('p');
                for(const child of footnoteElement){
                    if(child.className=="oj-note"){
                        wrapElement(document, child, "footnote");
                    }
                }

                Array.prototype.forEach.call(document.querySelectorAll(".linkToTop, .oj-hd-date, .oj-hd-lg, .oj-hd-ti, .oj-hd-oj"), function (node) { node.remove(); });

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