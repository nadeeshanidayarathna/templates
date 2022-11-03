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
            await page.waitForSelector("#content");
            await page.evaluate(function process() {

                Array.prototype.forEach.call(document.querySelectorAll(".contents-list-container"),function (node) {node.remove();});
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('h1');
                wrapElement(document, level1Element, "level1");   
                
                const issueDate = document.querySelector('.publication-header__last-changed');
                const isdate = /\d\d +.*/.exec(issueDate.textContent);
                const dateFormat = (new Date(isdate).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                wrapElementDate(document, "effective-date", dateFormat + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#content');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h2');
                wrapElements(document, level2Element, "level2");

                const level3Elements = document.querySelectorAll("h3");
                wrapElements(document, level3Elements, "level3");

                const level4Elements = document.querySelectorAll("h4");
                wrapElements(document, level4Elements, "level4");

                const liItems = document.querySelectorAll("li");
                for (const contentChild of liItems) {
                        contentChild.innerHTML ="<div>" +"•" + contentChild.innerHTML + "</div>";
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".dont-print, .print-meta-data-licence, .print-meta-data, .publication-external"),function (node) {node.remove();});
                
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