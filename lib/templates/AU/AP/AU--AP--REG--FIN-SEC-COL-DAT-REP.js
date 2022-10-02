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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('.WordSection1 > p.MsoNormal > b > span')[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2017-06-22" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2017-06-22" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level3Element = document.querySelectorAll('.WordSection2 > p.MsoNormal > b > span, .WordSection2 > p.MsoNormal > a > b > span');
                for (const elements of level3Element) {
                    if (elements.style.fontSize != '20pt') {
                        wrapElement(document, elements, "level3");
                    }
                }

                const level2Element2 = document.querySelectorAll('.WordSection1 > p.MsoNormal > b > span');
                for (const elements of level2Element2) {
                    if ((elements.style.fontSize == '12pt' || elements.style.fontSize == '16pt') && elements.textContent.trim() != "") {
                        wrapElement(document, elements, "level2");
                    } 
                }

                const level2Element3 = document.querySelector(".WordSection3 p.MsoNormal[align='center'] > b > span");
                wrapElement(document, level2Element3, "level2");

                const level2Element4 = document.querySelectorAll(".WordSection4 > p.MsoNormal > b > span");
                let i = 0;
                for (const elements of level2Element4) {
                    if (i > 1 && elements.textContent.trim() != "") {
                        if (elements.style.fontSize == '12pt') {
                            wrapElement(document, elements, "level4");
                        } else {
                            wrapElement(document, elements, "level3");
                        }
                    } i++;
                }

                let alter1 = level2Element4[1].innerHTML;
                let alter2 = level2Element4[0].innerHTML;
                level2Element4[1].outerHTML = level2Element4[1].outerHTML.replace(level2Element4[1].innerHTML, "");
                level2Element4[0].outerHTML = level2Element4[0].outerHTML.replace(level2Element4[0].innerHTML, "<div class=\"level2\" title4=\"level2\">" + alter2 + " " + alter1 + "</div>");

                const footnoteElement = document.querySelectorAll("div[id^='ftn']");
                wrapElements(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls img, div[lang='EN-US'] > span"), function (node) { node.remove(); });

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