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
                wrapElementDate(document, "issue-date", "2012-03-27" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".tablecontent2")[0];
                wrapElement(document, content, "ease-content");


                const level2And3Elements = document.querySelectorAll("p");
                const regex = /^(\d+\.\s)(.*)/i;
                var isLevel3 = false;
                for (const contentChild of level2And3Elements) {
                    if (contentChild.textContent.match(regex)) {
                        levelText = contentChild.textContent.match(regex)[1];
                        if (isLevel3) {
                            contentChild.outerHTML = contentChild.outerHTML.replace(levelText, "<div title=\"level3\" class=\"level3\">" + levelText + "</div>");
                        } else {
                            contentChild.outerHTML = contentChild.outerHTML.replace(levelText, "<div title=\"level2\" class=\"level2\">" + levelText + "</div>");
                        }
                    } else if (contentChild.textContent.startsWith("GUIDELINES") || contentChild.textContent.startsWith("Annex")) {
                        wrapElement(document, contentChild, "level2");
                        isLevel3 = true;
                    }
                }


                //fixing ol items in the transform
                var letter = 97;
                const olItems = document.querySelectorAll("ol>li");
                for (const contentChild of olItems) {
                    if (contentChild.nextElementSibling == null) {
                        contentChild.outerHTML = "<div>" + String.fromCharCode(letter) + ". " + contentChild.outerHTML + "</div>";
                        letter = 97;
                    } else {
                        contentChild.outerHTML = "<div>" + String.fromCharCode(letter++) + ". " + contentChild.outerHTML + "</div>";
                    }
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