const base = require("./common/base");

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
            await page.waitForSelector(".portlet");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("h2");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", document.querySelector("#shijian").textContent.split(" ")[0] + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".portlet");
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("p");
                for (const level2Element of level2Elements) {
                    if (level2Element.style.textAlign == 'center') {
                        wrapElement(document, level2Element, "level2");
                    } else if (level2Element.textContent.match(/^[\r\n\s]?第.+条/)) {
                        // wrapping level3 using text manipulation as all the content is inside the same tag
                        const articleLevelText = level2Element.textContent.split(" ")[0];
                        level2Element.outerHTML = level2Element.outerHTML.replace(articleLevelText, "<div title=\"level3\" class=\"level3\">" + articleLevelText + "</div>");
                    }
                }

                // removing unwanted content from ease-content
                document.querySelector(".hui12").remove();
                Array.prototype.forEach.call(document.querySelectorAll(".hui12[align='left']"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".huiUnderline"), function (node) { node.remove(); });

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