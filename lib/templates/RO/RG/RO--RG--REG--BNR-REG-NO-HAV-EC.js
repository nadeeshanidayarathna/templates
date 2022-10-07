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
            await page.waitForSelector(".contentDiv");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Text = "Regulament nr. 28 din 15.dec.2009 privind supravegherea modului de punere în aplicare a sancţiunilor internaţionale de blocare a fondurilor";
                wrapElementLevel1(document, level1Text);
                wrapElementDate(document, "issue-date", "2009-12-15" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".contentDiv")[0];
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll(".ln2capitol");
                const level2Elements2 = document.querySelectorAll(".ln2tcapitol");
                for (var i = 0; i < level2Elements.length; i++) {
                    wrapElements(document, [level2Elements[i], level2Elements2[i]], "level2", group = true);
                }


                const level3Element = document.querySelectorAll(".ln2articol");
                const level3Transform = document.querySelectorAll(".ln2tarticol");
                for (var i = 0; i < level3Element.length; i++) {
                    level3Element[i].textContent = level3Element[i].textContent + " - "
                    wrapElement(document, level3Element[i], "level3");
                    textCharArray = Array.from(level3Transform[i].textContent)
                    level3Transform[i].textContent = textCharArray.slice(2, textCharArray.length).join("");
                }



                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".sharing"), function (node) { node.remove(); });


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