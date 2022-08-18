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
                const rootTitle = 'Computing tax liability and definition of "insurance on alien risks" for premium tax purposes.';
                wrapElementLevel1(document, rootTitle);

                const dates = document.querySelectorAll(".clnumdate");
                const regex = /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2} *, \d{4}/g;
                for (const date of dates) {
                    if (date.textContent.match(regex)) {
                        const issueDate = new Date(date.textContent);
                        const issueDateFormatted = issueDate.getFullYear() + "-" + (issueDate.getMonth() + 1).toString().padStart(2, "0") + "-" + issueDate.getDate().toString().padStart(2, "0") + "" + "T00:00:00";
                        wrapElementDate(document, "issue-date", issueDateFormatted);
                        break;
                    }
                }

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".pub");
                wrapElement(document, contentElement, "ease-content");

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