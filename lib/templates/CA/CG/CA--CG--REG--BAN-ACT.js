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
            await page.waitForSelector(".col-md-9");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelectorAll(".Title-of-Act")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-08-08" + "T00:00:00");
                // wrapElementDate(document, "effective-date", "2022-02-08" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                const content = document.querySelectorAll(".col-md-9")[0];
                wrapElement(document, content, "ease-content");

                // const remover = document.querySelectorAll('.mfp-hide');
                // for (const element of remover) {
                //     element.remove();
                // }

                const level2Elements21 = document.querySelectorAll(".col-md-9 > div > div > section > section > h6");
                wrapElements(document, level2Elements21, "level2");

                const level2Elements22 = document.querySelectorAll(".col-md-9 > div > div > section > section > div > header > h2 > span.scheduleLabel");
                wrapElements(document, level2Elements22, "level2");

                const level2Elements1 = document.querySelectorAll(".col-md-9 > div > div > section > h2");
                wrapElements(document, level2Elements1, "level2");

                const level2Elements2 = document.querySelectorAll(".col-md-9 > section > div > h2");
                wrapElements(document, level2Elements2, "level2");

                const level2Elements4 = document.querySelectorAll(".col-md-9 > div > div > section > h3");
                wrapElements(document, level2Elements4, "level3");

                const level2Elements3 = document.querySelectorAll(".col-md-9 > div > div > section > .MarginalNote");
                wrapElements(document, level2Elements3, "level4");

                const bulletText = document.querySelectorAll('ul.HistoricalNote');
                for (const elements of bulletText) {
                    let i = 0;
                    for (const element of elements.childNodes) {
                        if (element.tagName == 'LI' && i == (elements.childNodes.length-1)) {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.outerHTML, "<span>" + texts + ". </span>");
                        } else if (element.tagName == 'LI' && i < (elements.childNodes.length-1)) {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.outerHTML, "<span>" + texts + "; </span>");
                        }i++;
                    }
                }

                const alterSpace = document.querySelectorAll('.HLabel1, .HLabel2');
                for (const elements of alterSpace) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, texts + "<span>  </span>");
                }

                const remover = document.querySelectorAll('.mfp-hide');
                for (const element of remover) {
                    element.remove();
                }

                // const level2Elements1 = document.querySelectorAll("h1");
                // wrapElements(document, level2Elements1, "level2");

          
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".legisHeader, div.PITLink, .wb-invisible, .mfp-hide, #right-panel"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".FCSelector"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > div > ul > li > section "), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > dl > dt"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > .MarginalNote > span"), function (node) { node.remove(); });

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