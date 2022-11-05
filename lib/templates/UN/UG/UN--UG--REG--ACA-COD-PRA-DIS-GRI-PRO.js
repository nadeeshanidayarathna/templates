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
            await page.waitForSelector(".row");
            await page.evaluate(function process() {

                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector("h1");
                wrapElement(document, level1Element, "level1");

                
                const metadataAll = document.querySelectorAll(".field--item");
                for (const DateElement of metadataAll) {
                    if (DateElement.outerText.trim().startsWith('Published')) {
                        let fullText = DateElement.outerText;
                        let check = (fullText.indexOf(" ") + 1)
                        let part2 = fullText.substring(check, fullText.length);
                        const dateFormat = (new Date(part2).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                    }
                }
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".row")[2];
                wrapElement(document, content, "ease-content");

                const level2Elements = document.querySelectorAll('h2');
                wrapElements(document, level2Elements, 'level2');

                
                const alterTexts = document.querySelectorAll(".article__wrapper li");
                for (const elements of alterTexts) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(texts, "<span> • </span>" + texts);
                }

            
                // removing unwanted content from ease-content
               Array.prototype.forEach.call(document.querySelectorAll(".breadcrumb, .sr-only, form, #social-share"), function (node) { node.remove(); });
                // TODO:

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true);
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