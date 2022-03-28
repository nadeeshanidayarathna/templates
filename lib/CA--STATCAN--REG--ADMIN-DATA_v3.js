const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");
const getXPath = require("get-xpath");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { downloadPath, buildPath, metaDataPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false
        });

        // ######################
        // 1. Download Cache File
        // ######################
        console.log("getting url:" + url);
        const page = await browser.newPage();
        await base.download(downloadPath, page, url);

        // ########################
        // 2. Identify DOM Elements
        // 3. Wrap DOM Elements
        // ########################
        {
            // TODO: [Template Specific]
            await page.waitForSelector('.region-laurier-first');

            page.on('console', (msg) => console.log(msg.text()));
            async function getStyles() { return base.getStyles(); };
            await page.exposeFunction("getStyles", getStyles);

            var xPaths = await page.evaluate(async function process() {
                function wrap(document, element, level, xPaths) {
                    const span = document.createElement("span");
                    span.classList.add(level);
                    span.innerHTML = element.innerHTML;
                    element.innerHTML = "";
                    element.appendChild(span);
                    xPaths.push(element.textContent);
                }
                var xPaths = [];
                {
                    const headElement = document.querySelectorAll("head")[0];
                    const style = document.createElement("style");
                    style.setAttribute("id", "spider-ease");
                    style.innerHTML = await getStyles();
                    headElement.appendChild(style);
                }

                // TODO: [Template Specific Root Level Info]
                const level1Element = document.querySelectorAll(".region-laurier-first h1")[0];
                wrap(document, level1Element, "level1", xPaths);
                const issueDateElement = document.querySelectorAll("dd")[0];
                wrap(document, issueDateElement, "issue-date", xPaths);

                // TODO: [Template Specific Main Content Info]
                const level2TopElement = Array.from(document.querySelectorAll(".region-laurier-first .field-item.even > *:not(section,ul)"))[0];
                wrap(document, level2TopElement, "level2", xPaths);

                return Promise.resolve(xPaths);
            });

            // ######################
            // 4. Write Metadata File
            // ######################
            await base.writeMetaData(metaDataPath, xPaths);

            // ########################
            // 5. Write Annotated Cache
            // ########################
            await base.annotate(buildPath, page);
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