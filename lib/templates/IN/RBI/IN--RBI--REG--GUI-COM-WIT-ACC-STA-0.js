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
            await page.waitForSelector(".tablecontent2");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".tableheader>b")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2005-03-15" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".tablecontent2")[0];
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelector("u>b>p");
                wrapElement(document, level2Element, "level2");

                const level3Elements1 = document.querySelectorAll("b>p");
                const regex = /^(\d\.\s)/i;
                const insideRegex = /^(\d+)/i;
                for (const contentChild of level3Elements1) {
                    if (contentChild.textContent.match(regex)) {
                        level3Text = contentChild.textContent.match(insideRegex)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level3Text, "<div title=\"level3\" class=\"level3\">" + level3Text + "</div>");
                    }
                }


                const level3Elements2 = document.querySelectorAll("b");
                for (const contentChild of level3Elements2) {
                    if (contentChild.textContent.match(insideRegex)) {
                        level3Text = contentChild.textContent.match(insideRegex)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level3Text, "<div title=\"level3\" class=\"level3\">" + level3Text + "</div>");
                    }
                }


                  //fixing ol items in the transform
                  var letter = 2170;
                  const olItems = document.querySelectorAll("ol>li");
                  for (const contentChild of olItems) {
                      contentChild.outerHTML = "<div>" + String.fromCharCode("0x"+letter++) + ". " + contentChild.outerHTML + "</div>";
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
}
module.exports = scraper;