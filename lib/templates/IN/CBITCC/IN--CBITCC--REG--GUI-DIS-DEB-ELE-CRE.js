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
      await base.downloadPage(page, url, sp, path,null,'utf16le');

      // 2.Identify
      // 3.Wrap
      await page.waitForSelector("body");
      await page.evaluate(function process() {
        // #############
        // # root:info #
        // #############

        var rootTitle = document.querySelector(".title");
        wrapElement(document, rootTitle, "level1");
        wrapElementDate(document, "issue-date", "2021-11-02" + "T00:00:00");
        // ################
        // # content:info #
        // ################

        const contentElement = document.querySelector("body");
        wrapElement(document, contentElement, "ease-content");
 

        const level2Elements = document.querySelectorAll("p b");
        for (const level2Element of level2Elements) {
            if (level2Element.textContent.match(/^[\r\n\s]*\d+\.\s*$/)) {
                wrapElement(document, level2Element, "level2");
            }  
        }

        const level2Element = document.querySelectorAll("h3");
        wrapElements(document, level2Element, "level2");

        const level3Elements = document.querySelectorAll("p b");
        for (const level3Element of level3Elements) {
            if (level3Element.textContent.match(/^[\r\n\s]*\d+\.\d+\.\d+\s*$/)) {
                wrapElement(document, level3Element, "level3");
            }  
        } 
 
        // removing unwanted content from ease-content
        // Array.prototype.forEach.call(
        //   document.getElementsByTagName("li"),
        //   function (node) {
        //     node.style.listStyleType = "none";
        //   }
        // );
        // Array.prototype.forEach.call(
        //   document.querySelectorAll(".list_conr, .detail_gn, .list_mtit"),
        //   function (node) {
        //     node.remove();
        //   }
        // );
 

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
