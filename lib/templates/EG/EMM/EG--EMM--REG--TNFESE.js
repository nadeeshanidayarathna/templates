const { group } = require("yargs");
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
            await page.waitForSelector(".aboutinner");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".MsoNormal")[1]
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2003-07-21" + "T00:00:00");
                // ################e
                // # content:info #
                // ################
                const content = document.querySelectorAll(".aboutinner")[0];
                wrapElement(document, content, "ease-content");


                var level2Element = Array.from(document.querySelectorAll("strong"));
                level2Element = level2Element.slice(1, level2Element.length - 1);
                level2Element.splice(12, 1);
                wrapElements(document, level2Element, "level2");


                //fixing li items in the transform

                const olItems = document.querySelectorAll("ol");
                for (const ol of olItems) {
                    var letter = 661;
                    const liItems = ol.children;
                    for (const li of liItems) {
                        if (letter == 670) {
                            li.outerHTML = "<div>" + li.outerHTML + String.fromCharCode("0x661") + String.fromCharCode("0x660") + ". "  +  "</div>";
                            //TODO: improve the logic
                        } else {
                            li.outerHTML = "<div>" + li.outerHTML + String.fromCharCode("0x" + letter++) + ". " + "</div>";
                        }
                    }
                }

                const ulItems = document.querySelectorAll("ul>li");
                for (const contentChild of ulItems) {
                    contentChild.outerHTML = "<div>• " + contentChild.outerHTML + "</div>";
                }


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