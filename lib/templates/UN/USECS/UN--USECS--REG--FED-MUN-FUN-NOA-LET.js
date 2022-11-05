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
            await page.waitForSelector("table");
            await page.evaluate(function process() {
                Array.prototype.forEach.call(document.querySelectorAll("tr > .footer"), function (node) { node.remove(); });
                // #############
                // # root:info #
                // #############
                wrapElementLevel1(document, "Federated Municipal Funds No-Action Letter");
                
                const issueDate = document.querySelector('h3');
                const dateFormat = (new Date(issueDate.textContent).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelectorAll('table')[2];
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h2');
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('h3');
                for(const child of level3Element){
                    if(child.previousElementSibling.nodeName == "P"){
                        wrapElement(document, child, "level3");
                    }
                }

                const footnoteElement = document.querySelectorAll(".footer");
                
                for(const child of footnoteElement){
                    let arrList = [];
                    if(child.nextElementSibling.className == "" && child.nextElementSibling.nextElementSibling.nodeName == "BLOCKQUOTE" && child.nextElementSibling.nextElementSibling.nextElementSibling.nodeName == "P"){
                        arrList.push(child);
                        arrList.push(child.nextElementSibling)
                        arrList.push(child.nextElementSibling.nextElementSibling)
                        arrList.push(child.nextElementSibling.nextElementSibling.nextElementSibling)
                        wrapElements(document, arrList, "footnote", group = true);
                    } else if(child.nextElementSibling.className == "" && child.nextElementSibling.nextElementSibling.nodeName == "P"){
                        arrList.push(child);
                        arrList.push(child.nextElementSibling)
                        wrapElements(document, arrList, "footnote", group = true);
                    } else {
                        wrapElement(document, child, "footnote");
                    }
                }
                

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("td img"), function (node) { node.remove(); });
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