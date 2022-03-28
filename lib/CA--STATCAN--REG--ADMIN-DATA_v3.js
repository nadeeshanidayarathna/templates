// version that we will wrap the original text using text match

const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { downloadPath, buildPath, annotatedPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false
        });

        // 1.Download
        console.log("getting url:" + url);
        const page = await browser.newPage();
        await base.download(downloadPath, page, url);

        // 2.Identify
        // 3.Collect
        {
            await page.waitForSelector('.region-laurier-first');
            page.on('console', (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process() {

                function wrap(document, element, level) {
                    const span = document.createElement("span");
                    span.classList.add(level);
                    span.innerHTML = element.innerHTML;
                    element.innerHTML = "";
                    element.appendChild(span);
                }

                var tags = [];

                // adding styles to the head
                const headElement = document.querySelectorAll("head")[0];
                const style = document.createElement("style");
                style.setAttribute("id", "spider-ease");
                style.innerHTML = ""
                    + ".level1 {font-size: 32px;border-style: solid;border-radius: 10px;border-color: #B2BEB5;background-color: #B2BEB5;text-decoration-color: #B2BEB5;border: 5px solid #B2BEB5;}"
                    + ".issue-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}"
                    + ".effective-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #899b8d;background-color: #899b8d;text-decoration-color: #899b8d;}"
                    + ".level2 {font-size: 24px;font-weight: bold;background-color: #a3d7ff;border: 5px solid #a3d7ff;}"
                    + ".level3 {font-size: 18.72px;font-weight: bold;background-color: #72ffb6;border: 5px solid #72ffb6;}"
                    + ".level4 {font-size: 16px;font-weight: bold;background-color: #f49fa6;border: 5px solid #f49fa6;}"
                    + ".level5 {font-size: 13.28px;font-weight: bold;background-color: #f7df8a;border: 5px solid #f7df8a;}"
                    + ".level6 {font-size: 12px;font-weight: bold;background-color: #eab3f9;border: 5px solid #eab3f9;}"
                    + ".level7 {font-size: 11px;font-weight: bold;background-color: #17DEEE;border: 5px solid #17DEEE;}"
                    + ".level8 {font-size: 10px;font-weight: bold;background-color: #21B20C;border: 5px solid #21B20C;}"
                    + ".level9 {font-size: 9px;font-weight: bold;background-color: #FF4162;border: 5px solid #FF4162;}"
                    + ".level10 {font-size: 8px;font-weight: bold;background-color: #FF7F50;border: 5px solid #FF7F50;}"
                headElement.appendChild(style);

                // ################
                // # root:heading #
                // ################
                const level1Element = document.querySelectorAll(".region-laurier-first h1")[0];
                wrap(document, level1Element, "level1");

                const issueDateElement = document.querySelectorAll("dd")[0];
                wrap(document, issueDateElement, "issue-date");

                // ################
                // # main:content #
                // ################
                const level2TopElement = Array.from(document.querySelectorAll(".region-laurier-first .field-item.even > *:not(section,ul)"))[0];
                wrap(document, level2TopElement, "level2");

                return Promise.resolve(tags);
            });

            // 4.Build
            await base.build(buildPath, tags);

            // 5.Annotate
            await base.annotate(annotatedPath, page);
        }
        await page.close();
        await browser.close();
    } catch (e) {
        console.log(e.message);
        console.log('Failed to scrape!!!');
        process.exit(1);
    }
}

module.exports = scraper;