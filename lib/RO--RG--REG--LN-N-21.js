const { group } = require("yargs");
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
            await page.waitForSelector("#div_Formaconsolidata");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelectorAll('.S_DEN')[0];
                wrapElement(document, level1Element, "level1");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelectorAll('#div_Formaconsolidata')[0];
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('.S_CAP');
                for (const element of elements) {
                    if (element.id != "id_capA755") {
                        let level2Element = [];
                        for (const childs of element.childNodes) {
                            if (childs.className == 'S_CAP_TTL') {
                                level2Element.push(childs);
                            } else if (childs.className == 'S_CAP_DEN') {
                                level2Element.push(childs);
                            }
                        }
                        wrapElements(document, level2Element, "level2", group = true);
                    }
                }

                const elements2 = document.querySelectorAll('.S_SEC');
                for (const element of elements2) {
                        let level3Element = [];
                        for (const childs of element.childNodes) {
                            if (childs.className == 'S_SEC_TTL') {
                                level3Element.push(childs);
                            } else if (childs.className == 'S_SEC_DEN') {
                                level3Element.push(childs);
                            }
                        }
                        wrapElements(document, level3Element, "level3", group = true);
                }

                const level4Element = document.querySelectorAll('.S_ART_TTL');
                wrapElements(document, level4Element, "level4", group = false);

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.getElementsByTagName("li"), function (node) { node.style.listStyleType = 'none'; });
                Array.prototype.forEach.call(document.querySelectorAll(".TAG_COLLAPSED"), function (node) { node.remove(); });

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