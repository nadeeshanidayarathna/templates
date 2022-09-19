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
                const level1Element = document.querySelectorAll(".tableheader")[1];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2018-07-02" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelectorAll(".tablecontent2")[0];
                wrapElement(document, content, "ease-content");


                const level2Element = document.querySelectorAll("p.head")[3];
                wrapElement(document, level2Element, "level2");


                const level3Elements = document.querySelectorAll("p.head");

                const regexPara1 = /(^Para\s\d*\s-)(.*)/i;
                const regexPara2 = /(^Para\s\d*-)(.*)/i;
                const regexAnnex1 = /(^Annex [IXV]*)(.*)/i;
                const regexAnnex2 = /(^Annex- [IXV]*)(.*)/i;

                for (const contentChild of level3Elements) {
                    var level3Text = '';
                    if (contentChild.textContent.match(regexPara1)) {
                        level3Text = contentChild.textContent.match(regexPara1)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level3Text, "<div title=\"level3\" class=\"level3\">" + level3Text + "</div>");

                    } else if (contentChild.textContent.match(regexPara2)) {
                        level3Text = contentChild.textContent.match(regexPara2)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level3Text, "<div title=\"level3\" class=\"level3\">" + level3Text + "</div>");

                    } else if (contentChild.textContent.match(regexAnnex1)) {
                        level3Text = contentChild.textContent.match(regexAnnex1)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level3Text, "<div title=\"level3\" class=\"level3\">" + level3Text + "</div>");

                    } else if (contentChild.textContent.match(regexAnnex2)) {
                        level3Text = contentChild.textContent.match(regexAnnex2)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level3Text, "<div title=\"level3\" class=\"level3\">" + level3Text + "</div>");

                    }

                }


                // removing unwanted content from ease-content           
                Array.prototype.forEach.call([document.querySelectorAll("td>.tablebg")[0],
                document.querySelectorAll("p.head")[1],
                document.querySelectorAll("p.head")[2]], function (node) { node.remove(); });


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