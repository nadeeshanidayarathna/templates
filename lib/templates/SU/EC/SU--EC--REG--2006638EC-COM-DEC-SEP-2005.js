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
                const rootTitle = document.querySelectorAll('.doc-ti');
                wrapElementLevel1(document, rootTitle[0].textContent + " " + rootTitle[1].textContent + " "+ rootTitle[2].textContent);
        
               wrapElementDate(document, "issue-date", "2005-09-06" + "T00:00:00");
               wrapElementDate(document, "effective-date", "2006-09-27" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector("#textTabContent");
                wrapElement(document, content, "ease-content");

                const level3Element = document.querySelectorAll('.ti-grseq-1, #d1e32-11-1');
                let lvlNo = 2;
                for(const child of level3Element){
                    
                    if(child.className == "ti-grseq-1"){
                        wrapElement(document, child, "level"+lvlNo);
                    } else {
                        wrapElement(document, child, "level2");
                        lvlNo = 3;
                    }
                }

                const level3ElementN = document.querySelectorAll(".ti-art");
                wrapElements(document, level3ElementN, "level3");
                

                const footnoteElement = document.querySelectorAll('p');
                for(const child of footnoteElement){
                    if(child.className=="note"){
                        wrapElement(document, child, "footnote");
                    }
                }

                Array.prototype.forEach.call(document.querySelectorAll(".linkToTop, .oj-hd-date, .oj-hd-lg, .oj-hd-ti, .oj-hd-oj"), function (node) { node.remove(); });

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