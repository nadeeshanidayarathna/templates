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
            await page.waitForSelector("#HTA2");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = "Nasdaq Futures, Inc. Rulebook - Reference Guides & Alerts - Futures Regulatory Alerts #2009 - 2";
                wrapElementLevel1(document, rootTitle);
                const issueDates = document.querySelector('#NewsHeader > p > strong');
                const issueDate = (new Date(issueDates.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates.textContent).getDate())).slice(-2) 
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#HTA2');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelector('#NewsHeader > h2');
                const level2Element = level2Elements.childNodes[4].textContent;
                level2Elements.outerHTML = level2Elements.outerHTML.replace(level2Element , "<div title=\"level2\" class = \"level2\">" + level2Element + "</div>");

                const level3Elements = document.querySelectorAll('h3');
                wrapElements(document, level3Elements, "level3", group = false);

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".footnote2, hr, .newscontentbox"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll("th"), function (node) { if (node.textContent.trim().startsWith('Category')) { node.remove(); } });
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