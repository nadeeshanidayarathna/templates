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
            await page.waitForSelector(".global");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const rootTitle = document.querySelectorAll(".long-title-regulation")[0];
                wrapElement(document, rootTitle, "level1");
                wrapElementDate(document, "issue-date", "1984-07-06T00:00:00");
                wrapElementDate(document, "effective-date", "1983-05-03T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelectorAll(".global")[0];
                wrapElement(document, content, "ease-content");

                const elementCont = document.querySelectorAll(".heading")[0];
                wrapElement(document, elementCont, "level2");

                const contL2 = document.querySelectorAll(".heading");
                for(const cont of contL2){
                    if(cont.outerText.includes("PART")){
                        wrapElement(document, cont, "level2");
                    }
                }

                const generalL2 = document.querySelectorAll(".title-text-group1")[17];
                wrapElement(document, generalL2, "level2");

                const ScheduleL2 = document.querySelectorAll(".label-schedule-heading");
                wrapElements(document, ScheduleL2, "level2", group = false);

                const contL3 = document.querySelectorAll(".section-heading");
                wrapElements(document, contL3, "level3", group = false);

                const formL3 = document.querySelectorAll(".label-form-heading");
                wrapElements(document, formL3, "level3", group = false);

                const levelL3 = document.querySelectorAll(".level-provision-centered");
                wrapElements(document, levelL3, "level3", group = false);

                const levelL4 = document.querySelectorAll(".label-section");
                wrapElements(document, levelL4, "level4", group = false);

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