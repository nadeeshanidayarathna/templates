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
            await page.waitForSelector(".doc-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".c44")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-08-04" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-08-04" + "T00:00:00");
                // ################e
                // # content:info #
                // ################
                const content = document.querySelectorAll(".doc-content")[0];
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll(".cl2");
                wrapElements(document, level2Elements, "level2");


                const level3Elements = document.querySelectorAll(".c3");
                const regexl3pattern = /^(Artículo\s\d+\.\d+\.\d+\.\d+\.\d+)(.*)/i;
                const regexl3pattern2 = /^(Artículo\s\d+\.)(.*)/i;
                for (const contentChild of level3Elements) {
                    if (contentChild.textContent.match(regexl3pattern)) {
                        level3Text = contentChild.textContent.match(regexl3pattern)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level3Text, "<div title=\"level3\" class=\"level3\">" + level3Text + "</div>");
                    } else if (contentChild.textContent.match(regexl3pattern2)) {
                        level3Text = contentChild.textContent.match(regexl3pattern2)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level3Text, "<div title=\"level3\" class=\"level3\">" + level3Text + "</div>");
                    }
                }


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