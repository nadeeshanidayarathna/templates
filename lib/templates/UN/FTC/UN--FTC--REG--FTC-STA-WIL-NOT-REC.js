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
      await page.waitForSelector("body");
      await page.evaluate(function process() {
        // #############
        // # root:info #
        // #############
        const level1Element = document.querySelector("h1");
        wrapElement(document, level1Element, "level1"); 
        wrapElementDate(document, "issue-date", "2010-09-16" + "T00:00:00");

        // ################
        // # content:info #
        // ################
        const contentElement = document.querySelector("body");
        wrapElement(document, contentElement, "ease-content");

        

        const level2Element = document.querySelectorAll("p > strong");
        wrapElements(document, level2Element, "level2");
  
 
        // removing unwanted content from ease-content
        Array.prototype.forEach.call(
          document.querySelectorAll(".field--name-field-tags-view, .field.field-social-icons, ._acs, .region.region-header, .group-breadcrumb, .usa-sr-only, .usa-skipnav ,.banner, .usa-header, .block-system-breadcrumb-block,.field--name-field-press-release-type, .usa-footer, .usa-layout-docs__sidenav, .at-share-btn-elements"),
          function (node) {
            node.remove();
          }
        );

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
