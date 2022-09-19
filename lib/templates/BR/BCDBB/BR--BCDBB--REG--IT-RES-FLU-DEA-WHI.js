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
            await page.waitForSelector(".row-fluid");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".row-fluid > div > .ementa");
                wrapElement(document, level1Element, "level1");
        
           
                wrapElementDate(document, "issue-date", "2021-07-29" + "T00:00:00");
               wrapElementDate(document, "effective-date", "2022-02-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".row-fluid")[0];
                wrapElement(document, content, "ease-content");
               // Array.prototype.forEach.call(document.querySelectorAll("#MainConent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });

             
                const level2Elements = document.querySelectorAll("p");
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.match(/^CAPÍTULO\s[IV]+/)) {
                        wrapElement(document, level2Element, "level2");
                    }  
                }
                
                const level4Elements = document.querySelectorAll("p");
                for (const level4Element of level4Elements) {
                    if (level4Element.textContent.match(/^Seção\s[IV]+/)) {
                        wrapElement(document, level4Element, "level3");
                    }  
                }

             
            const level3Text = document.querySelectorAll('p');
            for (const level3Elements of level3Text) {
                if (level3Elements.textContent.trim().charAt(0) == "Art.") {
                    const level3Element = /^Art.\s\d+[º.]/.exec(level3Elements.textContent);
                    level3Elements.outerHTML = level3Elements.outerHTML.replace(level3Element, "<div class=\"level4\" title=\"level4\">" + level3Element + "</div>");
                }  
            }

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true);
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