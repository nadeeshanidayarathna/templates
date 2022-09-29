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
            await page.waitForSelector(".doc-content-area");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("#metadata_content_area > h1");
                wrapElement(document, level1Element, "level1");

                const metadataAll = document.querySelectorAll(".metadata_list > *");
                let i = 0;
                for (const item of metadataAll) {
                    if(item.textContent.match(/^Publication\sDate/)){
                        const issueDate = metadataAll[i + 1];
                        wrapElementDate(document, "issue-date", issueDate.textContent);
                    }
                    i++;
                }
                let j = 0;
                for (const item of metadataAll) {
                    if(item.textContent.match(/^Effective\sDate/)){
                        const effectiveDate = metadataAll[j + 1];
                        wrapElementDate(document, "effective-date", effectiveDate.textContent);
                    }
                    j++;
                }
                          
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.doc-content-area');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('#fulltext_content_area > h2:not(#h-7)');
                wrapElements(document, level2Elements, "level2");

                const level3Elements = document.querySelectorAll('#fulltext_content_area > h3');
                wrapElements(document, level3Elements, "level3");

                Array.prototype.forEach.call(document.querySelectorAll("#fulltext_content_area > .flush-paragraph, #fulltext_content_area > #h-7, .footnote > .back"), function (node) { node.remove(); });
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