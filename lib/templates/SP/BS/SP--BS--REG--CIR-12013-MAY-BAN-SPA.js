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
            await page.waitForSelector("#contenido");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelector('h3.documento-tit');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2021-01-30" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#contenido');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('.capitulo_num, #textoxslt > h3, .anexo_num, .articulo');
                let nextLevel = 2;
                for (const elements of level2Elements) {
                    if (elements.className == "") {
                        wrapElement(document, elements, "level2");
                        nextLevel = 3;
                    } else if (elements.className == "anexo_num") {
                        let level2Element = [elements, elements.nextElementSibling];
                        wrapElements(document, level2Element, "level2", group = true);
                        nextLevel = 3;
                    } else if (elements.className == "capitulo_num") {
                        let level3Element = [elements, elements.nextElementSibling];
                        wrapElements(document, level3Element, "level3", group = true);
                        nextLevel = 4;
                    } else if (elements.className == "articulo") {
                        wrapElement(document, elements, "level" + nextLevel);
                    }
                }

                const alterText = document.querySelectorAll('.nota_pie');
                for (const elements of alterText) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<span> • </span>" + texts);
                }
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".titulo-wrapper, .redaccion, .enlaces-conso, #barra_dj, .pretexto, .marcadores, .linkSubir, p.bloque, form.lista.formBOE, .subtitMostrado"), function (node) { node.remove(); });

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