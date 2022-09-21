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
            await page.waitForSelector("#contenido");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.documento-tit');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2021-12-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#contenido');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelector('#textoxslt h3');
                wrapElement(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('#textoxslt .bloque > h5');
                wrapElements(document, level3Element, "level3");

                const level4Element = document.querySelector('.sangrado > h5');
                wrapElement(document, level4Element, "level4");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".redaccion, .enlaces-conso, #barra_dj, .pretexto, .marcadores, p.bloque, p.linkSubir, .puntoAyuda, .caja"), function (node) { node.remove(); });

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