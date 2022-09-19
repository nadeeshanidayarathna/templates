const { group } = require("yargs");
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
            await page.waitForSelector("#content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".iLAWS120ShortTitleContents")[1];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-08-12" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll("#content")[0];
                wrapElement(document, content, "ease-content");


                const level2ElementHeading = document.querySelectorAll(".iLAWS200PartHeading");
                for (const contentChild of level2ElementHeading) {
                    wrapElements(document, [contentChild, contentChild.nextElementSibling], "level2", group = true);
                }

                const level2Element2 = document.querySelector(".iLAWS600EndnotesTitle");
                wrapElement(document, level2Element2, "level2");


                var level3Elements = document.querySelectorAll(".iLAWS300Article");
                wrapElements(document, level3Elements, "level3");


                // handling footnotes
                const forFootnoteElements = document.querySelectorAll(".MsoEndnoteText");
                const regex = /^\[\d+]\sArticle/i;
                var footnote = forFootnoteElements[0];
                var subFootnotes = []
                for (var i = 1; i <= forFootnoteElements.length; i++) {
                    if (i != forFootnoteElements.length) {
                        if (forFootnoteElements[i].textContent.match(regex)) {
                            if (subFootnotes.length != 0) {
                                subFootnotes.push(footnote);
                                wrapElements(document, subFootnotes, "footnote", group = true);
                                subFootnotes = [];
                            } else {
                                wrapElement(document, footnote, "footnote");
                            }
                        } else {
                            subFootnotes.push(footnote);
                        }
                        footnote = forFootnoteElements[i];
                    } else {
                        if (subFootnotes.length != 0) {
                            subFootnotes.push(footnote);
                            wrapElements(document, subFootnotes, "footnote", group = true);
                            subFootnotes = [];
                        } else {
                            wrapElement(document, footnote, "footnote");
                        }
                    }
                }


                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".iLAWS101CrestLarge,.iLAWS104CoverShortTitle,.iLAWS115CrestSmall,.WordSection2,#ctl00_PlaceHolderMain_DisplayModePanel"),
                    function (node) { node.remove(); });


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