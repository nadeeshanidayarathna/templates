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
                wrapElementLevel1(document, "Orden HFP/1351/2021, de 1 de diciembre, por la que se modifican la Orden de 20 de noviembre de 2000, por la que se aprueban los modelos 180, en pesetas y en euros, del resumen anual de retenciones e ingresos a cuenta sobre determinadas rentas o rendimientos procedentes del arrendamiento o subarrendamiento de inmuebles urbanos; la Orden HAC/3580/2003, de 17 de diciembre, por la que se aprueba el modelo 156 de declaración informativa anual de las cotizaciones de afiliados y mutualistas a efectos de la deducción por maternidad; la Orden EHA/3895/2004, de 23 de noviembre.");
                wrapElementDate(document, "issue-date", "2021-12-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#contenido');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelector('#textoxslt h3');
                wrapElement(document, level2Element, "level2");

                const level3Element = document.querySelectorAll('#textoxslt .bloque:not(#df) > h5');
                for (const elements of level3Element) {
                    let level3Title = /^Art\S+\s\S+\./.exec(elements.innerHTML);
                    let level3Text = elements.innerHTML.replace(level3Title, "");
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, "<div class=\"level3\" title=\"level3\">" + level3Title + "</div><span>" + level3Text + "</span>");
                }

                const level3Elements = document.querySelector('#df > h5');
                wrapElement(document, level3Elements, "level3");

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