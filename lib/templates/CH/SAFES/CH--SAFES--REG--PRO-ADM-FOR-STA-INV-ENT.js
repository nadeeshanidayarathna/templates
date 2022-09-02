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
            await page.waitForSelector(".detail_con");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelector('.detail_tit');
                wrapElement(document, level1Element, "level1");
                const issueDate = document.querySelectorAll('dd')[3];
                wrapElementDate(document, "issue-date", issueDate.textContent + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('.detail_con');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('p');
                for (const level3Elements of elements) {
                    if (level3Elements.textContent.trim().charAt(0) == "第" && level3Elements.textContent.trim().charAt(2) == "章") {
                        wrapElement(document, level3Elements, "level2");
                    } else if (level3Elements.textContent.trim().charAt(0) == "第" && level3Elements.textContent.trim().charAt(2) == "条") {
                        const level4Element = /第\W条/.exec(level3Elements.textContent);
                        level3Elements.outerHTML = level3Elements.outerHTML.replace(level4Element, "<div class=\"level3\" title=\"level3\">" + level4Element + "</div>");
                    } else if (level3Elements.textContent.trim().charAt(0) == "第" && level3Elements.textContent.trim().charAt(3) == "条") {
                        const level4Element = /第\W\W条/.exec(level3Elements.textContent);
                        level3Elements.outerHTML = level3Elements.outerHTML.replace(level4Element, "<div class=\"level3\" title=\"level3\">" + level4Element + "</div>");
                    } else if (level3Elements.textContent.trim().charAt(0) == "第" && level3Elements.textContent.trim().charAt(4) == "条") {
                        const level4Element = /第\W\W\W条/.exec(level3Elements.textContent);
                        level3Elements.outerHTML = level3Elements.outerHTML.replace(level4Element, "<div class=\"level3\" title=\"level3\">" + level4Element + "</div>");
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".detail_gn, .list_mtit, .dqwz, .attachment"), function (node) { node.remove(); });

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