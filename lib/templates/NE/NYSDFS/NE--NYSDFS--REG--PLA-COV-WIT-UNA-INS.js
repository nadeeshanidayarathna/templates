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
                const rootTitle = document.querySelector("#clre");
                const level1Element = rootTitle.innerHTML.substring(4,rootTitle.innerHTML.length);
                wrapElementLevel1(document, level1Element, "level1");

                const issueDates = document.querySelectorAll(".clnumdate")[0];
                const issueDate =new Date(issueDates.textContent).getFullYear() + "-" +
                    ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" +
                    ("0" + new Date(issueDates.textContent).getDate()).slice(-2);
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".pub");
                wrapElement(document, contentElement, "ease-content");

                const level3Elements = document.querySelectorAll(".indpre > p");
                for(const contentChild of level3Elements){
                    if(contentChild.textContent.match(/^([A-Z]\.\s)/)){
                        wrapElement(document, contentChild, "level3");
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