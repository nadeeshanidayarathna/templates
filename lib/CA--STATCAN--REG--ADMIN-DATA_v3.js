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
            async function getStyles() { return base.getStyles(); };
            await page.exposeFunction("getStyles", getStyles);

            var tags = await page.evaluate(async function process() {

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
                const resu = await getStyles();
                console.log("resu:" + resu);
                style.innerHTML = resu;
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