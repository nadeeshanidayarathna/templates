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
            await page.waitForSelector(".col-md-8");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:

                const level1Element = document.querySelectorAll('.col-md-8  > article > div:first-of-type')[0];
                const level1Element2 = document.querySelectorAll('.col-md-8  > article > div > span:first-of-type')[0];
                const level1Element3 = document.querySelectorAll('.col-md-8  > article > div > span:nth-child(5)')[0];


                let i = 0;
                let level1Element4 = [];
               for (const level1Element11 of level1Element.childNodes) {
                     if (i > 1) {
                    level1Element4.push(level1Element11.values);
                    }i++;
                }
                for (const level1Element22 of level1Element2.childNodes) {
                    if (i > 1) {
                    level1Element4.push(level1Element22);
                    }i++;
                }
                for (const level1Element33 of level1Element3.childNodes) {
                    if (i > 1) {
                    level1Element4.push(level1Element33);
                    }i++;
                }
                //console.log("array" + level1Element4)
                wrapElements(document, level1Element4, "level1", group = true);


                wrapElementDate(document, "issue-date", "2022-10-12" + "T00:00:00");
                // wrapElementDate(document, "effective-date", "2022-08-17" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll(".col-md-8")[0];
                wrapElement(document, content, "ease-content");
                // Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });


                const level2Elements = document.querySelectorAll('article > div');
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.match(/CONSIDERANDO:/)) {
                        const level2text = /CONSIDERANDO:/.exec(level2Element.textContent);
                        level2Element.outerHTML = level2Element.outerHTML.replace(level2text, "<div title=\"level2\" class=\"level2\">" + level2text + "</div>");
                    }
                }

                const level3Elements = document.querySelectorAll('article > div');
               for (const level3Element of level3Elements) {
                   if (level3Element.textContent.match(/RESUELVE:/)) {
                       const level3text = /RESUELVE:/.exec(level3Element.textContent);
                       level3Element.outerHTML = level3Element.outerHTML.replace(level3text, "<div title=\"level2\" class=\"level2\">" + level3text + "</div>");
                   }
               }

               const level4Elements = document.querySelectorAll('article > div');
               for (const level4Element of level4Elements) {
                   if (level4Element.textContent.match(/ARTÍCULO\s\d[°º]\.-/)) {
                       const level4text = /ARTÍCULO\s\d[°º]\.-/.exec(level4Element.textContent);
                       level4Element.outerHTML = level4Element.outerHTML.replace(level4text, "<div title=\"level4\" class=\"level4\">" + level4text + "</div>");
                   }
               }

               const level5Elements = document.querySelectorAll('article > div');
               for (const level5Element of level5Elements) {
                   if (level5Element.textContent.match(/ARTÍCULO\s2[°º]\.-/)) {
                       const level5text = /ARTÍCULO\s2[°º]\.-/.exec(level5Element.textContent);
                       level5Element.outerHTML = level5Element.outerHTML.replace(level5text, "<div title=\"level4\" class=\"level4\">" + level5text + "</div>");
                   }
               }

               const level6Elements = document.querySelectorAll('article > div');
               for (const level6Element of level6Elements) {
                   if (level6Element.textContent.match(/ARTÍCULO\s3[°º]\.-/)) {
                       const level6text = /ARTÍCULO\s3[°º]\.-/.exec(level6Element.textContent);
                       level6Element.outerHTML = level6Element.outerHTML.replace(level6text, "<div title=\"level4\" class=\"level4\">" + level6text + "</div>");
                   }
               }






                // removing unwanted content from ease-content

                // Array.prototype.forEach.call(document.querySelectorAll(".detail_gn"), function (node) { node.remove(); });
                // TODO:

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