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
            await page.waitForSelector(".status-row");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const rootTitle = "SECURITIES AND FUTURES (EXEMPTION FROM REQUIREMENT TO HOLD CAPITAL MARKETS SERVICES LICENCE) REGULATIONS";
                wrapElementLevel1(document, rootTitle);
                  
                const issueDate = document.querySelectorAll('.status-row')[1];
                console.log("Date : "+issueDate.textContent.match(/(?<=at\s)(.*)/m)[0])
                const dateFormat = (new Date(issueDate.textContent.match(/(?<=at\s)(.*)/m)[0]).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector("#legisContent");
                wrapElement(document, content, "ease-content");

                const elements = document.querySelectorAll("div");
                for(const element of elements){
                    let arrList = [];
                    if(element.className == "partNo"){
                        arrList.push(element);
                        arrList.push(element.nextElementSibling);
                        wrapElements(document, arrList, "level2", group = true);
                    }
                }
               const level2Element = document.querySelectorAll(".prov1Hdr");
               wrapElements(document, level2Element, "level3");

               const level3Element = document.querySelectorAll("strong");
               wrapElements(document, level3Element, "level4");

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, false, false);
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