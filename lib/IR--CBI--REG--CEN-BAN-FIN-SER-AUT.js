const base = require("./common/base");

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
      await page.waitForSelector(".container-fluid");
      await page.evaluate(function process() {
        // #############
        // # root:info #
        // #############
        const selectTitle = document.querySelector(".content-title").textContent;
        let rootTitle = selectTitle.substring(selectTitle.indexOf("-") + 1, selectTitle.length);
        wrapElementLevel1(document, rootTitle);

        const dateElement = document.querySelector(".t1 td:nth-child(2)").textContent.trim().replace("    ,","");
        let tempText = dateElement.substring(dateElement.indexOf("this") + 5, dateElement.length).slice(0, -1);  
        const dateFormat = new Date(tempText.substring(0, 2) + " " + tempText.substring(12, 16) + " " + tempText.substring(17, 21)).toLocaleDateString("fr-CA");
        wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
          
        // ################
        // # content:info #
        // ################
        const contentElement = document.querySelector(".container-fluid");
        wrapElement(document, contentElement, "ease-content");

        const level2Elements = document.querySelectorAll("p");
        for (const level2Element of level2Elements) {
          if (level2Element.textContent.trim().startsWith("EXPLANATORY NOTE.")) {
            wrapElement(document, level2Element, "level2");
          }
        };

        // removing unwanted content from ease-content
        Array.prototype.forEach.call(document.querySelectorAll(".document-toolbar"),function (node) {node.remove();});
        Array.prototype.forEach.call(document.querySelectorAll(".breadcrumb"),function (node) {node.remove();});
        Array.prototype.forEach.call(document.querySelectorAll(".act-content>table>tbody>tr:nth-child(2)>td:last-child>table>tbody>tr:nth-child(1)>td:first-child>p>img"),function (node) {node.remove();});
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
};
module.exports = scraper;
