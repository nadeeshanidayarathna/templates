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
            await page.waitForSelector(".avisoContenido");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('h1')[1];
                wrapElement(document, level1Element, "level1");
                // const issueDates = document.querySelectorAll('#cuerpoDetalleAviso p')[1];
                // let regex = issueDates.textContent.match(/(\d+\/)(\d+\/)(\d+)/);
                // const dateFormat = (new Date(JSON.stringify(regex[0])).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", "2022-10-06" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-10-07" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelectorAll('.avisoContenido')[1];
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('#cuerpoDetalleAviso p');
                for(const child of elements){
                    if(child.textContent.match(/^CONSIDERANDO:/) || (child.textContent.match(/^DECRETA:/))){
                        wrapElement(document, child, "level2");
                    } else if(child.textContent.match(/^CAPÍTULO/)){
                        wrapElement(document, child, "level3");
                    } else if(child.textContent.match(/^ARTÍCULO/)){
                        if(child.textContent.match(/^ARTÍCULO \d\°.-/)){
                            const txtContent = child.textContent.match(/^ARTÍCULO \d\°.-/);
                            child.outerHTML = child.outerHTML.replace(txtContent, "<div title=\"level4\" class=\"level4\">" + txtContent + "</div>");
                        } else if(child.textContent.match(/^ARTÍCULO \d+.-/)){
                            const txtContent = child.textContent.match(/^ARTÍCULO \d+.-/);
                            child.outerHTML = child.outerHTML.replace(txtContent, "<div title=\"level4\" class=\"level4\">" + txtContent + "</div>");
                        }

                    }  
                }

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