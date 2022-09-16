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
            await page.waitForSelector(".tablecontent2");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".tableheader>b")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2002-09-18" + "T00:00:00");
                // ################e
                // # content:info #
                // ################
                const content = document.querySelectorAll(".tablecontent2")[0];
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll("p");
                const regexL2 = /(^\d\.\s)/i;
                const regexL3 = /(^\d\.\d)/i;
                for (const contentChild of level2Elements) {

                    if (contentChild.textContent.match(regexL2)) {

                        const regexInside = /(^\d\.)/i;
                        level2Text = contentChild.textContent.match(regexInside)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level2Text, "<div title=\"level2\" class=\"level2\">" + level2Text + "</div>");

                    } else if (contentChild.textContent.match(regexL3)) {

                        level3Text = contentChild.textContent.match(regexL3)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level3Text, "<div title=\"level3\" class=\"level3\">" + level3Text + "</div>");

                    } else if (contentChild.textContent.startsWith("Annexure")) {

                        wrapElement(document, contentChild, "level2");

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