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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("body");
            await page.evaluate(function process() {

                // #############
                // # root:info #
                // #############

                const rootTitle = "Reglamento de Clasificación y Valorización de las Inversiones de las Empresas del Sistema Financiero";
                wrapElementLevel1(document, rootTitle);

                wrapElementDate(document, "issue-date", "2012-09-19" + "T00:00:00");

                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('body');
                wrapElement(document, contentElement, "ease-content");

                // level2 auto-captured

                // Level3

                const level3ElementsType1 = document.querySelectorAll("h2");
                for(const element of level3ElementsType1){
                    if(element.textContent.match(/^Artículo\s\d{1,}/)){
                        wrapElement(document, element, "level3");
                    }
                }

                // Footnotes auto-captured

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