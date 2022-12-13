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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const rootTitle = "বিএফআইইউ সার্কুলার নং-১৮ মানিলন্ডারিং ও সন্ত্রাসী কার্ষে অর্থায়ন প্রতিরোধে পুঁজি বাজার সংশ্লিষ্ট প্রতিষ্ঠানসমূহের (TREC Holder, পোর্টফোলিও ম্যানেজার ও মার্চেন্ট ব্যাংকার, সিকিউরিটিজ কাস্টডিয়ান ও সম্পদ ব্যবস্থাপক) জন্য অনুসরণীয় নির্দেশনা সম্পর্কিত মাস্টার সার্কুলার ।";
                wrapElementLevel1(document, rootTitle);
                wrapElementDate(document, "issue-date", "2015-10-19T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelectorAll("h2");
                wrapElements(document, level2Element, "level2");

                const level3Element = document.querySelectorAll("h3");
                wrapElements(document, level3Element, "level3");
                
                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true,false);
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