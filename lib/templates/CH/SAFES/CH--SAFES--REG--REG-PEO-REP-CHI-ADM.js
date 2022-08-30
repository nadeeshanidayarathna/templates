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
                    else if (level2Element.textContent.match(/^[\r\n\s]*第.+条/)) { 
                        const articleLevelText = level2Element.textContent.split(" ")[0];
                        level2Element.outerHTML = level2Element.outerHTML.replace(articleLevelText, "<div title=\"level3\" class=\"level3\">" + articleLevelText + "</div>");
                    }
                }

                // const level2Elements = document.querySelectorAll("p");
                //  const regex = /^[\r\n\s]*(第.+条)(\s)/i;
                //  for(const contentChild of level2Elements){
                //     if(contentChild.textContent.match(regex)){
                //         var level2Element = contentChild
                //         level2Element.textContent = contentChild.textContent.match(regex)[1];  
                //          wrapElement(document, level2Element, "level2");;
                //     }
                //  } 
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
