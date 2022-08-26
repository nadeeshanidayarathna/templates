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
      await page.waitForSelector(".field--name-body");
      await page.evaluate(function process() {
        // #############
        // # root:info #
        // #############
        const level1Element = document.querySelector("h1");
        wrapElement(document, level1Element, "level1");
        wrapElementDate(document, "issue-date", "2006-04-03T00:00:00");

        // ################
        // # content:info #
        // ################
        const contentElement = document.querySelector(".field--name-body > div > div");
        wrapElement(document, contentElement, "ease-content");

        let y=35;
        

        let level2Elements = [];
        for(let x=29 ; x<=y; x++)
        {
            if(x==34 || x==33){
                //do nothing
            }
            else{
                level2Elements.push(document.querySelectorAll("h2")[x]);
            }
        }
       
        wrapElements(document, level2Elements, "level2");

        
        let z=34;
        let level3Elements = [];
        for(let x=33 ; x<=z; x++)
        {

                level3Elements.push(document.querySelectorAll("h2")[x]);
            
        }

    
        wrapElements(document, level3Elements, "level3");


       
        
        let i=59;
        let footnotes = [];
        for(let x=58 ; x<=i; x++)
        {
            footnotes.push(document.querySelectorAll("p")[x]);
        }

        wrapElements(document,footnotes,"footnote");

      
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
