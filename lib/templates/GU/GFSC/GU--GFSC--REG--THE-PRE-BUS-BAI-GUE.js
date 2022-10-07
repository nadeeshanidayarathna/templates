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
            await page.waitForSelector("#content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll("p")[5];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-07-04" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2019-03-31" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll("#content")[0];
                wrapElement(document, content, "ease-content");

                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll("#breadCrumbs,h1,.docDownload"), function (node) { node.remove(); });
                Array.prototype.forEach.call([document.querySelectorAll("p")[0]], function (node) { node.remove(); });
                Array.prototype.forEach.call(Array.from(document.querySelectorAll("p")).slice(7, 90), function (node) { node.remove(); });

                const levels = document.querySelectorAll("p");
                regexPart = /^PART\s[IVX]+/i
                regexLevel4 = /^(\n?\s?\r?)(\d+\.\s)(.*)/i

                for (var i = 0; i < levels.length; i++) {

                    if (levels[i].textContent.match(regexPart)) {
                        wrapElements(document, [levels[i], levels[i + 1]], "level2", group = true);
                    } else if (levels[i].textContent.match(regexLevel4)) {
                        var numberText = levels[i].textContent.match(regexLevel4)[2]
                        levels[i - 1].outerHTML = "<div title=\"level4\" class=\"level4\">" + numberText + levels[i - 1].outerHTML + "</div>";
                        levels[i].textContent = levels[i].textContent.replace(numberText, "")

                    }
                    
                    else if (levels[i].textContent.startsWith("SCHEDULE")) {
                        wrapElement(document, levels[i], "level2");
                        break;
                    }
                }


                const level3Elements = document.querySelectorAll("p>em");
                for (var i = 0; i < level3Elements.length; i++) {
                    if (level3Elements[i].nextElementSibling != null && level3Elements[i].nextElementSibling.tagName == "EM") {
                        wrapElements(document, [level3Elements[i], level3Elements[++i]], "level3", group = true);
                    } else {
                        wrapElement(document, level3Elements[i], "level3");
                    }
                }


                const forFootnoteElements = document.querySelectorAll("tbody>tr");
                wrapElements(document, forFootnoteElements, "footnote");


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