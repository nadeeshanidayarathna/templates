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
             const level1Element = document.querySelector("#MainContent_pnlHtmlControls > div > .WordSection1 > p:nth-child(2)");
                wrapElement(document , level1Element , "level1");
        
                wrapElementDate(document, "issue-date", "2015-12-10" + "T00:00:00");
              //  wrapElementDate(document, "effective-date", "2015-04-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("#MainContent_pnlHtmlControls > div")[0];
                wrapElement(document, content, "ease-content");

                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 > p>a> span > img"), function (node) { node.remove(); });
               Array.prototype.forEach.call(document.querySelectorAll(".WordSection2 > p> img"), function (node) { node.remove(); });

                //  const level2Elements = document.querySelectorAll('h1');
                // wrapElements(document, level2Elements, 'level2');
  
                const level2Elements = document.querySelectorAll(".WordSection1 >.AS");
                for (const level2Element of level2Elements) {
                    if (level2Element.textContent.match(/^Schedule/)) {
                        wrapElement(document, level2Element, "level2");
                    }  
                }

                const level23Elements = document.querySelectorAll('.WordSection4 > h1:last-of-type');
                wrapElements(document, level23Elements, 'level2');

                const level24Elements = document.querySelectorAll(".WordSection4 >h1");
                for (const level24Element of level24Elements) {
                    if (level24Element.textContent.match(/^Reporting level/)) {
                        wrapElement(document, level24Element, "level2");
                    }  
                }
                const level25Elements = document.querySelectorAll(".WordSection4 >h1");
                for (const level25Element of level25Elements) {
                    if (level25Element.textContent.match(/^Specific instructions/)) {
                        wrapElement(document, level25Element, "level2");
                    }  
                }

                const level22Elements = document.querySelectorAll(".WordSection4 > p > b >span");
                for (const level22Element of level22Elements) {
                    if (level22Element.textContent.match(/^Instructions/)) {
                        wrapElement(document, level22Element, "level2");
                    }  
                }
                const level21Elements = document.querySelectorAll(".WordSection4 > p > b >span");
            for (const level21Element of level21Elements) {
            if (level21Element.style.fontSize == '16pt') {
                wrapElement(document, level21Element, "level2");
            }  
        }
                // const level3Elements = document.querySelectorAll('.WordSection2 > p > b >span[lang="X-NONE"]');
                // for (const level3Element of level3Elements) {
                //     if (level3Element.style.fontSize == '12pt') {
                //         wrapElement(document, level3Element, "level3");
                //     }  
                // } 

                const level31Elements = document.querySelectorAll('.WordSection2 >h3');
                wrapElements(document, level31Elements, 'level3');

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