const { group } = require("yargs");
const base = require("../../../common/base");
const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false,
            ignoreHTTPSErrors: true
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path);
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll(".regtitle-e")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2001-09-04" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".WordSection1")[0];
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll("h3");
                for (contentChild of level2Elements) {
                    contentChild.textContent = contentChild.textContent.toUpperCase();
                    wrapElement(document, contentChild, "level2");
                }

                const level2Element = document.querySelectorAll(".section-e>b")[0]
                headerL2 = level2Element.parentNode.previousElementSibling
                headerL2.outerHTML = "<div title=\"level2\" class=\"level2\">" + level2Element.textContent + headerL2.outerHTML + "</div>";
                level2Element.textContent = "";


                var level3Elements = Array.from(document.querySelectorAll(".section-e>b"));
                level3Elements = level3Elements.slice(1, level3Elements.length);
                for (contentChild of level3Elements) {
                    var regex = /(\d+\.)/i;
                    if (contentChild.textContent.match(regex)) {
                        header = contentChild.parentNode.previousElementSibling
                        if (header != null && header.tagName == "H4") {
                            header.outerHTML = "<div title=\"level3\" class=\"level3\">" + contentChild.textContent + header.outerHTML + "</div>";
                            contentChild.textContent = "";
                        } else {
                            wrapElement(document, contentChild.parentNode, "level3");
                        }
                    }
                }




                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".MsoNormal>a"), function (node) { node.remove(); });


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