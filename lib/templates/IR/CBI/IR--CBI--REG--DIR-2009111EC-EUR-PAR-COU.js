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
            await page.waitForSelector("#document1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Elements = document.querySelectorAll('.doc-ti');
                wrapElementLevel1(document, level1Elements[0].textContent + " " + level1Elements[1].textContent + " " + level1Elements[2].textContent);
                wrapElementDate(document, "issue-date", "2009-11-17" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#document1');
                wrapElement(document, contentElement, "ease-content");

                const level1Element = document.querySelectorAll('.doc-ti');
                let i = 0;
                for (const elements of level1Element) {
                    if (i < 3) {
                        elements.remove();
                    } else if (i == 4) {
                        wrapElement(document, elements, "level2");
                    } i++;
                }

                const level2Element = document.querySelectorAll('p.normal')
                for (const element of level2Element) {
                    if (element.textContent.match(/^\w+\:$/)) {
                        wrapElement(document, element, "level2");
                    }
                }

                const level2Elements = document.querySelectorAll('.ti-section-1, .ti-art');
                var nextLevel = 2;
                for (const element of level2Elements) {
                    if (element.className == 'ti-section-1') {
                        let elements = [element, element.nextElementSibling];
                        wrapElements(document, elements, "level2", group = true);
                        nextLevel = 3;
                    } else {
                        if (element.nextElementSibling.className == 'sti-art') {
                            let level3Elements = [element, element.nextElementSibling];
                            wrapElements(document, level3Elements, "level" + nextLevel, group = true);
                        } else {
                            wrapElement(document, element, "level" + nextLevel);
                        }
                    }
                }

                const footnoteElement = document.querySelectorAll('p.note');
                wrapElements(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("div[lang] > table:nth-child(1), .linkToTop"), function (node) { node.remove(); });

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