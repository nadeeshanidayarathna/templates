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
            const delayDownload = {
                waitUntil: "networkidle0",
                timeout: 0
            }

            await base.downloadPage(page, url, sp, path, delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("#lawArea");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('#lawArea #lawTitle');
                wrapElement(document, level1Element, "level1");
                // const issueDates = document.querySelector("#detailsArea > dd:nth-of-type(3)");
                // const issueDate = (new Date(issueDates.textContent).getFullYear()) + "-" + ("0" + (new Date(issueDates.textContent).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDates.textContent).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", "2022-03-31" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-10-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#lawArea');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('.ChapterTitle, .SectionTitle, .SupplProvisionLabel,#MainProvision ._div_ArticleTitle');
                let nextLevel = 2;
                for (const element of elements) {
                    if (element.classList.contains('ChapterTitle') || (element.classList.contains('SupplProvisionLabel') && element.textContent.trim().match(/則$/))) {
                        wrapElement(document, element, "level2");
                        nextLevel = 3;
                    } else if (element.classList.contains('SectionTitle')) {
                        wrapElement(document, element, "level3");
                        nextLevel = 4;
                    } else if (element.classList.contains('_div_ArticleTitle') && element.childNodes[1].textContent.trim().match(/^第\W+条$/)) {
                        if (element.previousElementSibling) {
                            if (element.previousElementSibling.classList.contains('_div_ArticleCaption')) {
                                let childs = [element.childNodes[1], element.previousElementSibling];
                                wrapElements(document, childs, "level" + nextLevel, group = true);
                            }
                        }
                        else {
                            wrapElement(document, element.childNodes[1], "level" + nextLevel);
                        }

                    }
                }
                // wrapElement(document, level2Element, "level2");
                // wrapElement(document, level3Element, "level3");
                // wrapElement(document, level4Element, "level4");
                // wrapElement(document, level5Element, "level5");
                // wrapElement(document, level6Element, "level6");
                // wrapElement(document, level7Element, "level7");
                // wrapElement(document, level8Element, "level8");
                // wrapElement(document, level9Element, "level9");
                // wrapElement(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("#TOC"), function (node) { node.remove(); });

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