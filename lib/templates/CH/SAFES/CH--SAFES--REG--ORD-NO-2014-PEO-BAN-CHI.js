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
  
        const level2Element = document.querySelectorAll('p')[4];
        if (level2Element.style.textAlign == 'center'){
            wrapElement(document, level2Element, "level2");
        }

        const level3Elements = document.querySelectorAll("p");
        for (const level3Element of level3Elements) {
            if (level3Element.style.textAlign == 'center' && level3Element.textContent.match(/^[\r\n\s]*第.+章/)) {
                wrapElement(document, level3Element, "level3");
            }  
        }

        const level4Text = document.querySelectorAll('p');
            for (const level4Elements of level4Text) {
                if (level4Elements.textContent.trim().charAt(0) == "第") {
                    const level4Element = /^[\r\n\s]*第[一二三四五六七八九十一百千]*条/.exec(level4Elements.textContent);
                    level4Elements.outerHTML = level4Elements.outerHTML.replace(level4Element, "<div class=\"level4\" title=\"level4\">" + level4Element + "</div>");
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
