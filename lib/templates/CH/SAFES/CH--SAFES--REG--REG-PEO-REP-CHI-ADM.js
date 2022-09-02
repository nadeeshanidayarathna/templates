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
      await page.waitForSelector(".detail_con");
      await page.evaluate(function process() {
        // #############
        // # root:info #
        // #############

        const level1Element = document.querySelectorAll(".detail_tit")[0];
        wrapElement(document, level1Element, "level1");
        const issueDate = document.querySelectorAll("dd")[3];
        wrapElementDate(
          document,
          "issue-date",
          issueDate.textContent + "T00:00:00"
        );

        // ################
        // # content:info #
        // ################

        const contentElement = document.querySelector(".detail_con");
        wrapElement(document, contentElement, "ease-content");
 

        const level2Elements = document.querySelectorAll("p");
        for (const level2Element of level2Elements) {
            if (level2Element.style.textAlign == 'center' && level2Element.textContent.match(/^[\r\n\s]*第.+章/)) {
                wrapElement(document, level2Element, "level2");
            }  
        }

        const level3Text = document.querySelectorAll('p');
            for (const level3Elements of level3Text) {
                if (level3Elements.textContent.trim().charAt(0) == "第" && (level3Elements.textContent.trim().charAt(2) == "条" || level3Elements.textContent.trim().charAt(3) == "条" || level3Elements.textContent.trim().charAt(4) == "条" )) {
                    const level3Element = /第[一二三四五六七八九十一百千]*条/.exec(level3Elements.textContent);
                    level3Elements.outerHTML = level3Elements.outerHTML.replace(level3Element, "<div class=\"level3\" title=\"level3\">" + level3Element + "</div>");
                }  
            }
 
        // removing unwanted content from ease-content
        Array.prototype.forEach.call(
          document.getElementsByTagName("li"),
          function (node) {
            node.style.listStyleType = "none";
          }
        );
        Array.prototype.forEach.call(
          document.querySelectorAll(".list_conr, .detail_gn, .list_mtit"),
          function (node) {
            node.remove();
          }
        );
 

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
