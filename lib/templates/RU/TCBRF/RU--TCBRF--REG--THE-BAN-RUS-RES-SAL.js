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
            await page.waitForSelector(".page-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // const middleImage = document.querySelector(".media img");
                // middleImage.setAttribute("width","700px");
                // middleImage.setAttribute("height","400px");

                // var images = document.querySelectorAll("img");
                // images.forEach(e => {
                //     var contentType = e.src.replace(/(.*\.)((png|jpg|jpeg|gif))$/, "$2");
                //     var canvas = document.createElement("canvas");
                //     canvas.width = e.width;
                //     canvas.height = e.height;
                //     var ctx = canvas.getContext("2d");
                //     ctx.drawImage(e, 0, 0);
                //     var dataURL = canvas.toDataURL("image/" + contentType);
                //     e.src = dataURL.replace("image/png", "image/" + contentType);
                // })

                const level1Element = document.querySelector('.page-content > h1');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-09-06" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.page-content');
                wrapElement(document, contentElement, "ease-content");

                const img1 = document.querySelector(".media img");
                wrapElement(document, img1, "level2");

                Array.prototype.forEach.call(document.querySelectorAll(".news-info-line, .page-content form, .breadcrumbs"), function (node) { node.remove(); });
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