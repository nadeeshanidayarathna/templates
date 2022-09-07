const base = require("../../../common/base");

const scraper = async function download(url, sp, path) {
  try {
    console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
    const browser = await base.puppeteer().launch({
      headless: false,
      devtools: false,
    });
    {
      // 1.Download
      console.log("getting url:" + url);
      const page = await browser.newPage();
      await base.downloadPage(page, url, sp, path);

      // 2.Identify
      // 3.Wrap
      await page.waitForSelector(".tablecontent2");
      await page.evaluate(function process() {
        // #############
        // # root:info #
        // #############

        const rootTitle = "Guidelines on trading of Currency Futures in Recognised Stock / New Exchanges";
        wrapElementLevel1(document, rootTitle); 
        wrapElementDate(document,"issue-date","2008-08-06" + "T00:00:00");

        // ################
        // # content:info #
        // ################

        const contentElement = document.querySelector(".tablecontent2");
        wrapElement(document, contentElement, "ease-content");
 
        const level2 = document.querySelectorAll('.tablecontent2 p strong');
        for (const level2Element of level2) {
            if (level2Element.textContent.match(/^[\r\n\s]*(\[)?Annex/)) {
                wrapElement(document, level2Element, "level2");
            }  
        }

        
        const level2Ftn = document.querySelectorAll('.tablecontent2 p strong');
        for (const level2Element of level2Ftn) {
            if (level2Element.textContent.match(/^[\r\n\s]*Footnote/)) {
                wrapElement(document, level2Element, "level2");
            }  
        }

        const level3 = document.querySelectorAll('.tablecontent2 p strong');
        for (const level3Element of level3) {
            if (level3Element.textContent.match(/^[\r\n\s]*\d+\.\s*/)) {
                wrapElement(document, level3Element, "level3");
            }  
        }

        const level3num = document.querySelectorAll(".tablecontent2 p");
        for(const level3Element of level3num){
            if(level3Element.innerHTML.includes("<u>") && level3Element.textContent.match(/^[\r\n\s]*\d+\.\s*/)){
                wrapElement(document, level3Element, "level3");
            }
        } 
         
        return Promise.resolve();
      });
      // 4.Write
      await base.writePage(page, url, sp, path, true, true, true);
      await page.close();
    }
    await base.test().runPageTest(browser, url, sp, path);
    await browser.close();
  } catch (e) {
    console.log(e);
    console.log("Failed to scrape!!!");
    process.exit(1);
  }
};
module.exports = scraper;
