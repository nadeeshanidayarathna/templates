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
                const rootTitle = document.querySelector(".tbltore tr:nth-of-type(2) > td:nth-of-type(2)");
                wrapElement(document, rootTitle, "level1");

                const issueDates = document.querySelectorAll(".clnumdate")[1];
                const issueDate =new Date(issueDates.textContent).getFullYear() + "-" +
                    ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" +
                    ("0" + new Date(issueDates.textContent).getDate()).slice(-2);
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".pub");
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll(".cltext > p");
                const regex = /^(IX|IV|V?I{0,3})\.\s/;
                for(const contentChild of level2Elements){
                    if(contentChild.textContent.match(regex)){
                        wrapElement(document, contentChild, "level2");
                    }
                }

                const level3Elements = document.querySelectorAll(".cltext > p > span");
                for(const contentChild of level3Elements){
                    wrapElement(document, contentChild.parentElement, "level3");
                }
                
                const footnoteElement1 = document.querySelector("#ftn1");
                wrapElement(document, footnoteElement1, "footnote");

                const footnoteElement2 = document.querySelector("#ftn2");
                wrapElement(document, footnoteElement2, "footnote");

                const footnoteElement3 = document.querySelector("#ftn3");
                wrapElement(document, footnoteElement3, "footnote");

                const footnoteElement4 = document.querySelector("#ftn4");
                wrapElement(document, footnoteElement4, "footnote");
                
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