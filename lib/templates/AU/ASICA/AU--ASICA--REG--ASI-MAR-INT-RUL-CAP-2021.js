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

                const rootTitle = document.querySelector('.WordSection1 > .MsoNormal > a[name="_Hlk102638443"]');
                wrapElement(document, rootTitle, "level1");
                
                wrapElementDate(document, "issue-date", "2022-04-06" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2022-04-06" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('div[class*="WordSection"] > p[class*="MIRHeading1Chapter"]');
                for(const level2Element of level2Elements){
                    wrapElement(document, level2Element, "level2");
                }

                const level2Element = document.querySelector('.WordSection19 .MIRHeading1');
                wrapElement(document, level2Element, "level2");

                const level3Elements = document.querySelectorAll('div[class*="WordSection"] > p[class*="MIRHeading2Part"]');
                for(const level3Element of level3Elements){
                    wrapElement(document, level3Element, "level3");
                }

                const level3ElementsType2 = document.querySelectorAll('div[class*="WordSection"] > h2');
                for(const level3Element of level3ElementsType2){
                    wrapElement(document, level3Element, "level3");
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 > .MsoNormal > img, .WordSection2"), function (node) { node.remove(); });

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