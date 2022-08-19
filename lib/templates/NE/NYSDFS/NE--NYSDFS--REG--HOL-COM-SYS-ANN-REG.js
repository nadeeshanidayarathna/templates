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
            await page.waitForSelector(".pub");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const rootTitle = "Holding Company System Annual Registration Statements Filed with other States and Reporting of Planned Transactions";
                wrapElementLevel1(document, rootTitle);
                wrapElementDate(document, "issue-date", "2009-07-30" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2010-10-08" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".pub");
                wrapElement(document, contentElement, "ease-content");

                const footnotes = document.querySelectorAll('.cltext > p');
                for (const footnoteElement of footnotes) {
                    if (footnoteElement.textContent.trim().startsWith('[')) {
                        wrapElement(document, footnoteElement, "footnote");
                    }
                }

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