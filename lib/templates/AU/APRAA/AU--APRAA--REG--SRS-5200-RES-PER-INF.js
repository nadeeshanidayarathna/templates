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
            await page.waitForSelector("#MainContent_pnlHtmlControls > div ");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
             const level1Element = document.querySelector("#MainContent_pnlHtmlControls > div > .Section1 > p:nth-child(2)");
        
                wrapElement(document , level1Element , "level1");
        
                wrapElementDate(document, "issue-date", "2014-03-21" + "T00:00:00");
              //  wrapElementDate(document, "effective-date", "2015-04-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("#MainContent_pnlHtmlControls > div")[0];
                wrapElement(document, content, "ease-content");

                Array.prototype.forEach.call(document.querySelectorAll(".Section1 > p> span > img"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll(".Section2 > p> img"), function (node) { node.remove(); });

                 const level23Elements = document.querySelectorAll('.Section4 > h1:last-of-type');
                wrapElements(document, level23Elements, 'level2');

                const level2Elements = document.querySelectorAll('.Section1 > p > .CharSchNo');
                wrapElements(document, level2Elements, 'level2');
  
                // const level2Elements = document.querySelectorAll(".Section1 > p > b >span");
                // for (const level2Element of level2Elements) {
                //     if (level2Element.textContent.match(/^Schedule/)) {
                //         wrapElement(document, level2Element, "level2");
                //     }  
                // }

                const level22Elements = document.querySelectorAll(".Section4 > p > b >span");
                for (const level22Element of level22Elements) {
                    if (level22Element.textContent.match(/^Instructions/)) {
                        wrapElement(document, level22Element, "level2");
                    }  
                }
                const level24Elements = document.querySelectorAll(".Section4 >h1");
                for (const level24Element of level24Elements) {
                    if (level24Element.textContent.match(/^Reporting level/)) {
                        wrapElement(document, level24Element, "level2");
                    }  
                }
                const level25Elements = document.querySelectorAll(".Section4 >h1");
                for (const level25Element of level25Elements) {
                    if (level25Element.textContent.match(/^Specific instructions/)) {
                        wrapElement(document, level25Element, "level2");
                    }  
                }
                const level21Elements = document.querySelectorAll(".Section4 > p > b >span");
            for (const level21Element of level21Elements) {
            if (level21Element.style.fontSize == '16pt') {
                wrapElement(document, level21Element, "level2");
            }  
             }
                // const level3Elements = document.querySelectorAll('.Section2 > p > b >span[lang="X-NONE"]');
                // wrapElements(document, level3Elements, 'level3');

                // const level31Elements = document.querySelectorAll('.Section2 > p > a >b> span[lang="X-NONE"]');
                // wrapElements(document, level31Elements, 'level3');

                const level31Elements = document.querySelectorAll(".Section2 > p");
                for (const level31Element of level31Elements) {
                if (level31Element.style.margin == '6pt 0cm 12pt') {
                    wrapElement(document, level31Element, "level3");
                }  
                 }

                const level4Elements = document.querySelectorAll('div > div >.MsoFootnoteText');
                wrapElements(document, level4Elements, 'footnote');

               

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