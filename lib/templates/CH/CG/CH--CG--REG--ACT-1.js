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
            await page.waitForSelector(".texto_norma");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll("div.p")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-06-20" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".texto_norma")[0];
                wrapElement(document, content, "ease-content");


                const level2And3Element = document.querySelectorAll("div.p");
                wrapElement(document, level2And3Element[2], "level2");


                const level3Element = document.querySelectorAll("div.p");
                const regex = /^(\s+?)(\"?Artículo \d°.- )(.*)/i
                for (const contentChild of level3Element) {
                    if (contentChild.textContent.match(regex)) {
                        console.log(contentChild.textContent);
                        var text = contentChild.textContent.match(regex)[2]
                        console.log(text);
                        contentChild.innerHTML = contentChild.innerHTML.replace(text, "<div title=\"level3\" class=\"level3\">" + text + "</div>")
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