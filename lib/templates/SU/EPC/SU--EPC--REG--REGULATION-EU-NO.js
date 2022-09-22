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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".tabContent");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                Array.prototype.forEach.call(document.querySelectorAll(".tabContent table"), function (node) { node.remove(); });

                const rootTitle = document.querySelectorAll("p");
                let arrList = [];
                for(const element of rootTitle){
                    if(element.className == "title-doc-first"){
                        arrList.push(element)
                    } else if(element.className == "title-doc-last"){
                        arrList.push(element)
                    }
                }
                wrapElements(document, arrList, "level1", group = true);
                wrapElementDate(document, "issue-date", "2022-08-12T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector(".tabContent");
                wrapElement(document, content, "ease-content");

                let levelNo = 3;

                const elements = document.querySelectorAll("p");
                for(const element of elements){
                    let arrElementList = [];
                    if(element.textContent.match(/^CHAPTER\s+.*$/)){
                        arrElementList.push(element);
                        arrElementList.push(element.nextElementSibling);
                        wrapElements(document, arrElementList, "level2", group = true);
                    } else if(element.textContent.match(/^Article\s+.*$/)){
                        arrElementList.push(element);
                        if(element.nextElementSibling.className == "modref"){
                            arrElementList.push(element.nextElementSibling.nextElementSibling)
                        } else {
                            arrElementList.push(element.nextElementSibling);
                        }
                        wrapElements(document, arrElementList, "level" + levelNo, group = true);
                    } else if(element.textContent.match(/^SECTION\s+.*$/)){
                        arrElementList.push(element);
                        arrElementList.push(element.nextElementSibling);
                        wrapElements(document, arrElementList, "level3", group = true);
                        levelNo = 4;
                    }
                }



                Array.prototype.forEach.call(document.querySelectorAll(".linkToTop, .reference, hr, .hd-modifiers, .disclaimer, .arrow, .modref"), function (node) { node.remove(); });
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