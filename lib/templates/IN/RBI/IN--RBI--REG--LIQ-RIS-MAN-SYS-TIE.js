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

        const rootTitle = "Liquidity Risk Management System in Tier I UCBs- Guidelines";
        wrapElementLevel1(document, rootTitle); 
        wrapElementDate(document,"issue-date","2008-09-17" + "T00:00:00");

        // ################
        // # content:info #
        // ################

        const contentElement = document.querySelector("#doublescroll");
        wrapElement(document, contentElement, "ease-content");

        $('body').html($('body').html().replace(/<br>\\*/g,"</p><p>"));
        
      
        
        const level2 = document.querySelectorAll('.tablecontent2 p strong');
        for (const level2Element of level2) {
            if (level2Element.textContent.match(/^[\r\n\s]*Guidelines on Liquidity Risk Management-Tier I UCBs/)) {
                wrapElement(document, level2Element, "level2");
            }  
        }

        
        const level2Annex = document.querySelectorAll('.tablecontent2 p strong');
        for (const level2Element of level2Annex) {
            if (level2Element.textContent.match(/^[\r\n\s]*(Annex|Appendix)/)) {
                wrapElement(document, level2Element, "level2");
            }  
        }
 

        const level3Text = document.querySelectorAll('.tablecontent2  > td >  table > tbody > tr > td > p');
        for (const level3Elements of level3Text) {
                if (level3Elements.textContent.match(/^[\r\n\s]*\d+\.\s*/)) {
                        const level3Element = /^[\r\n\s]*\d+\.\s*/.exec(level3Elements.textContent);
                        level3Elements.outerHTML = level3Elements.outerHTML.replace(level3Element, "<div class=\"level3\" title=\"level3\">" + level3Element + "</div>");
                    }
        } 

        // removing unwanted content from ease-content 
        Array.prototype.forEach.call(document.querySelectorAll(".tableheader"), function (node) { node.remove(); });
      
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
