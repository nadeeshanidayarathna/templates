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
            await page.waitForSelector(".two-column-layout");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelectorAll('h2')[1];
                wrapElement(document, level1Element, "level1");

                const issueDateElement = document.querySelector(".irp-full__date");
                const issueDate = (new Date(issueDateElement.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDateElement.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDateElement.textContent).getDate())).slice(-2)
                 wrapElementDate(document, "issue-date",issueDate + "T00:00:00");

 
                // ################
                // # content:info #
                // ################

                const content = document.querySelector(".two-column-layout");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelectorAll("h4");
                wrapElements(document, level2Element, "level2");
             
                const footnoteElement = document.querySelectorAll("div[id^='ftn']");
                wrapElements(document, footnoteElement, "footnote");

                const alterTexts = document.querySelectorAll("li");
                for (const elements of alterTexts) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(texts, "<span> • </span>" + texts);
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("h1, .references-wrapper, .tags, .irp-full__file "), function (node) { node.remove(); });

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