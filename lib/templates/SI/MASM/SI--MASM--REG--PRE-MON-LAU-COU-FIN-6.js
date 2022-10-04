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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector("h1");
                wrapElement(document, level1Element, "level1");

                wrapElementDate(document, "issue-date", "2014-07-01" + "T00:00:00");
                //  wrapElementDate(document, "effective-date", "2015-04-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("body")[0];
                wrapElement(document, content, "ease-content");
                // Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });


                const level2Elements = document.querySelectorAll('h2');
                wrapElements(document, level2Elements, 'level2');

                const level3Elements = document.querySelectorAll('h3');
                wrapElements(document, level3Elements, 'level3');


                const level4Elements = document.querySelectorAll('h6');
                for (const level4Element of level4Elements) {
                    if (level4Element.textContent.match(/^\d+\.\d+\s/)) {
                        const level4text = /^\d+\.\d+\s/.exec(level4Element.textContent);
                        level4Element.outerHTML = level4Element.outerHTML.replace(level4text, "<div title=\"level4\" class=\"level4\">" + level4text + "</div>");
                    }

                }

                const level41Elements = document.querySelectorAll("h4");
                for (const level41Element of level41Elements) {
                    if (level41Element.textContent.match(/[^\d+\.\d+]/)) {
                        wrapElement(document, level41Element, "level4");
                    }
                }

                

                const level6Elements = document.querySelectorAll('p');
                for (const level6Element of level6Elements) {
                    if (level6Element.textContent.match(/^\d+\.\d+/)) {
                        const level6text = /^\d+\.\d+/.exec(level6Element.textContent);
                        level6Element.outerHTML = level6Element.outerHTML.replace(level6text, "<div title=\"level5\" class=\"level5\">" + level6text + "</div>");
                    }
                }


                const level5Elements = document.querySelectorAll('#ftn1');
                wrapElements(document, level5Elements, 'footnote');



                // removing unwanted content from ease-content

                // Array.prototype.forEach.call(document.querySelectorAll(".detail_gn"), function (node) { node.remove(); });
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