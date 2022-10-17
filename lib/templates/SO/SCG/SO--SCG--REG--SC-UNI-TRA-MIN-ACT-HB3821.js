const { group } = require("yargs");
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
                const level1Element = document.querySelector("center>b");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-03-29" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-04-04" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");


                var level2Elements = Array.from(document.querySelectorAll("p>b"));
                level2Elements.splice(4, 1);
                level2Elements.splice(0, 1);
                wrapElements(document, level2Elements, "level2");


                const level3Element = document.querySelectorAll("p");
                var sectionRegex = /^(\n?\r?\s?)(SECTION\s+\d\.)(.*)/i
                for (contentChild of level3Element) {
                    if (contentChild.textContent.match(sectionRegex)) {
                        text = contentChild.textContent.match(sectionRegex)[2]
                        var sectionElement = document.createElement("p")
                        sectionElement.textContent = text
                        contentChild.parentElement.insertBefore(sectionElement, contentChild)
                        wrapElement(document, sectionElement, "level3");

                        var innerRegex = /^[\n\r\s]?(.*)(SECTION(&nbsp;\s+)+\d+\.)(.*)/i
                        contentChild.innerHTML = contentChild.innerHTML.replace(innerRegex, "$1$4");

                    }
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