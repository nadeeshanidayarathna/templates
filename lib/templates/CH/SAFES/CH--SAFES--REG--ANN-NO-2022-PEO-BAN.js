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
                wrapElementDate(document, "effective-date", "2022-06-30" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('.detail_con');
                wrapElement(document, contentElement, "ease-content");

                const level2Text = document.querySelectorAll('p');
                for (const level2Elements of level2Text) {
                    if (level2Elements.textContent.trim().match(/^\W、/)) {
                        let level2Element = /^\W、/.exec(level2Elements.textContent.trim());
                        level2Elements.outerHTML = level2Elements.outerHTML.replace(level2Element, "<div class=\"level2\" title=\"level2\">" + level2Element + "</div>");
                    } else if (level2Elements.textContent.trim().match(/|^\W\W、/)) {
                        let level2Element = /^\W\W、/.exec(level2Elements.textContent.trim());
                        level2Elements.outerHTML = level2Elements.outerHTML.replace(level2Element, "<div class=\"level2\" title=\"level2\">" + level2Element + "</div>");
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".detail_gn, .list_mtit, .dqwz, .attachment, .list_conr"), function (node) { node.remove(); });

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