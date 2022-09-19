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
                wrapElementDate(document, "issue-date", "2008-10-24" + "T00:00:00");
                // ################e
                // # content:info #
                // ################
                const content = document.querySelectorAll(".tablecontent2")[0];
                wrapElement(document, content, "ease-content");


                const level2Elements = document.querySelectorAll("p");
                const regexL2 = /(\d\.\s)(.*)/i;
                for (const contentChild of level2Elements) {
                    if (contentChild.textContent.match(regexL2)) {

                        if (contentChild.childNodes.length > 1) {
                            //several levels and transforms inside a one tag
                            textReplace = "";
                            const childNodes = contentChild.childNodes;
                            for (const childNode of childNodes) {

                                if (childNode.textContent.match(regexL2)) {
                                    textReplace += "<div title=\"level2\" class=\"level2\">" + childNode.textContent.match(regexL2)[1] + "</div>" + childNode.textContent.match(regexL2)[2];

                                } else {
                                    if (childNode.outerHTML != null)
                                        textReplace += childNode.outerHTML
                                    else
                                        textReplace += childNode.textContent

                                }
                            }
                            contentChild.outerHTML = textReplace
                        } else {
                            level2Text = contentChild.textContent.match(regexL2)[1];
                            contentChild.outerHTML = contentChild.outerHTML.replace(level2Text, "<div title=\"level2\" class=\"level2\">" + level2Text + "</div>");
                        }

                    }
                    else if (contentChild.textContent.startsWith("Annex")) {
                        wrapElement(document, contentChild, "level2");
                    }

                }



                // wrapping ordered list index
                const orderedList = document.querySelectorAll("ol>li");
                var convertedList;
                var letter = 97;
                for (const listElement of orderedList) {
                    listElement.outerHTML = "<div class='level3' title='level3'>" + String.fromCharCode(letter++) + ". </div><div>" + listElement.outerHTML + "</div>";
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