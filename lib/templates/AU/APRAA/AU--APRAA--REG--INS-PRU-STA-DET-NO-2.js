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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                var images = document.querySelectorAll("img");
                images.forEach(e => {
                    var contentType = e.src.replace(/(.*\.)((png|jpg|jpeg|gif))$/, "$2");
                    var canvas = document.createElement("canvas");
                    canvas.width = e.width;
                    canvas.height = e.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(e, 0, 0);
                    var dataURL = canvas.toDataURL("image/" + contentType);
                    e.src = dataURL.replace("image/png", "image/" + contentType);
                })
                const level1Elements = document.querySelectorAll(".MsoNormal>b");
                wrapElements(document, [level1Elements[0], level1Elements[1]], "level1", group = true);
                wrapElementDate(document, "issue-date", "2022-06-22" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-07-01" + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");


                var levelElements = Array.from(document.querySelectorAll("h1"));
                var level2Element = levelElements.slice(5, levelElements.length-7)
                wrapElements(document, level2Element, "level2");
                wrapElements(document, [levelElements[24],levelElements[26],levelElements[28]], "level2");
                wrapElements(document, [levelElements[23],levelElements[25],levelElements[27],levelElements[29]], "level3");

                
                const forFootnoteElements = document.querySelectorAll(".MsoFootnoteText");
                var prevoiuseFnID = ""
                for (contentChild of forFootnoteElements) {
                    if (contentChild.parentElement.id != prevoiuseFnID) {
                        wrapElement(document, contentChild.parentElement, "footnote");
                        prevoiuseFnID = contentChild.parentElement.id
                    }
                }


                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll("h5>img,p>img,.MsoToc1"), function (node) { node.remove(); });
                Array.prototype.forEach.call([document.querySelectorAll(".MsoBodyText>b")[0]], function (node) { node.remove(); });


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