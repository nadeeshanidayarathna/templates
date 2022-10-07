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
            await page.waitForSelector("main");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll("h2.Title-of-Act")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2021-04-02" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-04-02" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll("main")[0];
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll(".scheduleTitleText");
                wrapElements(document, level2Element, "level2");


                const level2Elements = document.querySelectorAll("h2");
                for (const contentChild of level2Elements) {
                    if (contentChild.querySelector(".HTitleText1") != null) {
                        if(contentChild.querySelector(".HLabel1") != null){
                            hLabel1 = contentChild.querySelector(".HLabel1");
                            level3Text = hLabel1.textContent;
                            hLabel1.outerHTML = hLabel1.outerHTML.replace(level3Text,  "<p>"+level3Text+" <p/>" );
                        }
                            wrapElement(document, contentChild, "level2");
                        
                    }
                }


                const level3Elements = document.querySelectorAll("h3>.HTitleText2");
                wrapElements(document, level3Elements, "level3");


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".legisHeader,.FCSelector,.wb-invisible,.PITLink,.mfp-hide"), function (node) { node.remove(); });


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
}
module.exports = scraper;