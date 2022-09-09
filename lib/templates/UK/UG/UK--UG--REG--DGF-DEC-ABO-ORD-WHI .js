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
            const delayDownload = {
                waitUntil: "networkidle0",
                timeout: 0
            }
            await base.downloadPage(page, url, sp, path,delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".rvts0");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.rvts0>.rvps6>.rvts23');
                wrapElement(document, level1Element, "level1");


                
                const issueDateElement = document.querySelector(".rvps7>.rvts9");
                const issueDate =  issueDateElement.textContent.slice(0, 10);
                var newdate = issueDate.split(".").reverse().join(".");
                 wrapElementDate(document, "issue-date",newdate + "T00:00:00");
                

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.rvts0');
                wrapElement(document, contentElement, "ease-content");

                 const level2Element = document.querySelectorAll(".rvts23");
                 let level2Elements=[level2Element[2],level2Element[3],level2Element[4]];
                  wrapElements(document, level2Elements, "level2",group=true);


                 const newlevel2Element = document.querySelectorAll(".rvps6")[2];
                 wrapElement(document, newlevel2Element, "level2");


                 const level3Element = document.querySelector(".rvps7>.rvts15");
                 wrapElement(document, level3Element, "level3");

                 const level3Elements = document.querySelectorAll(".rvps7")[2];
                 wrapElement(document, level3Elements, "level3");

                 const newlevel3Element = document.querySelectorAll(".rvps7")[3];
                 wrapElement(document, newlevel3Element, "level3");

                // wrapElement(document, level2Element, "level2");
                // wrapElement(document, level3Element, "level3");
                // wrapElement(document, level4Element, "level4");
                // wrapElement(document, level5Element, "level5");
                // wrapElement(document, level6Element, "level6");
                // wrapElement(document, level7Element, "level7");
                // wrapElement(document, level8Element, "level8");
                // wrapElement(document, level9Element, "level9");
                // wrapElement(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll("img"), function (node) { node.remove(); });
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