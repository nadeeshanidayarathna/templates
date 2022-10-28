const { group } = require("yargs");
const base = require("../../../common/base");
const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false,
            ignoreHTTPSErrors: true
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path);
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("#contenido");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".documento-tit")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2014-05-06" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll("#contenido")[0];
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll("h5");
                wrapElements(document, level2Element, "level2");

                const level2Element2 = document.querySelectorAll("h4");
                wrapElements(document, [level2Element2[0], level2Element2[1]], "level2");


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".puntoAyuda,.redaccion,.enlaces-conso,#barra_dj,.navlist,.marcadores,.linkSubir,p.bloque"), function (node) { node.remove(); });


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