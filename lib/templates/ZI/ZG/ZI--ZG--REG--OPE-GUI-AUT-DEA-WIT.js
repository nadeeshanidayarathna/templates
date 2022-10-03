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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector("h3");
                wrapElement(document, level1Element, "level1");
        
                wrapElementDate(document, "issue-date", "2021-12-01" + "T00:00:00");
              //  wrapElementDate(document, "effective-date", "2015-04-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelectorAll("body")[0];
                wrapElement(document, content, "ease-content");
               // Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });

               const level2Elements = document.querySelectorAll('h1');
               wrapElements(document, level2Elements, 'level2');
  
               
               const level3lements = document.querySelectorAll("p>span>span");
               for (const level3Element of level3lements) {
                   if (level3Element.textContent.match(/^\d+\.\d[^\.]/)) {
                       wrapElement(document, level3Element, "level3");
                   }  
               }

               const level32lements = document.querySelectorAll("p>span>span");
               for (const level32Element of level32lements) {
                   if (level32Element.textContent.match(/^\d+\.\d\.[^\d]/)) {
                       wrapElement(document, level32Element, "level3");
                   }  
               }

               const level31lements = document.querySelectorAll("p>b");
               for (const level31Element of level31lements) {
                   if (level31Element.textContent.match(/^\d\.\d[^\.]/)) {
                       wrapElement(document, level31Element, "level3");
                   }  
               }
               const level41lements = document.querySelectorAll("p>span>span");
               for (const level41Element of level41lements) {
                   if (level41Element.textContent.match(/^\d+.\d+.\d+/)) {
                       wrapElement(document, level41Element, "level4");
                   }  
               }
               const level5Elements = document.querySelectorAll('p');
               for (const level5Element of level5Elements) {
                   if (level5Element.textContent.match(/^\d+.\d+.\d+/)) {
                       const level5text = /^\d+.\d+.\d+/.exec(level5Element.textContent);
                       level5Element.outerHTML = level5Element.outerHTML.replace(level5text, "<div title=\"level4\" class=\"level4\">" + level5text + "</div>");
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