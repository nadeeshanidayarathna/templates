const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { downloadPath, buildPath } = await base.createFolder(url, sp, path);
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
        // 3. wrapElementLevel DOM Elements
        // ########################
        {
            // TODO: [Template Specific]
            await page.waitForSelector('.region-laurier-first');

            page.on('console', (msg) => console.log(msg.text()));
            async function getStyles() { return base.getStyles(); };
            await page.exposeFunction("getStyles", getStyles);

            var tags = await page.evaluate(async function process() {
                var tags = [];

                function wrapElementLevel(document, element, level) {
                    const span = document.createElement("span");
                    span.classList.add(level);
                    span.innerHTML = element.innerHTML;
                    element.innerHTML = "";
                    element.appendChild(span);
                }

                function wrapTextLevel(document, parent, text, level) {
                    const span = document.createElement("span");
                    span.classList.add(level);
                    span.innerHTML = text;
                    parent.appendChild(span);
                }

                function wrapText(document, parent, text) {
                    const span = document.createElement("span");
                    span.innerHTML = text;
                    parent.appendChild(span);
                }

                function resetElement(element) {
                    Array.prototype.forEach.call(element.querySelectorAll("*"), function (node) { node.remove(); });
                    element.innerHTML = "";
                }

                function breakElement(document, parent) {
                    const br = document.createElement("br");
                    parent.appendChild(br);
                }

                {
                    const headElement = document.querySelectorAll("head")[0];
                    const style = document.createElement("style");
                    style.setAttribute("id", "spider-ease");
                    style.innerHTML = await getStyles();
                    headElement.appendChild(style);
                }

                // TODO: [Template Specific Root Level Info]
                const level1Element = document.querySelectorAll(".region-laurier-first h1")[0];
                wrapElementLevel(document, level1Element, "level1");
                const issueDateElement = document.querySelectorAll("dd")[0];
                wrapElementLevel(document, issueDateElement, "issue-date");

                // TODO: [Template Specific Main Content Info]
                const pTransforms = Array.from(document.querySelectorAll(".region-laurier-first .field-item.even > *:not(section,ul)"));
                wrapElementLevel(document, pTransforms[0], "level2");

                const h2s = document.querySelectorAll(".region-laurier-first section h2");
                for (h2 of h2s) {
                    wrapElementLevel(document, h2, "level2");
                }

                const strongs = document.querySelectorAll(".region-laurier-first section > p > strong");
                for (strong of strongs) {
                    const result = strong.textContent.match("^\\d+.\\d+.");
                    if (result != null) {
                        const headingText = result[0];
                        const paraText = strong.textContent.replace(headingText, '');
                        resetElement(strong);
                        wrapTextLevel(document, strong, headingText, "level3");
                        wrapText(document, strong, paraText);
                    }
                }

                const ols = document.querySelectorAll(".region-laurier-first section > ol");
                for (ol of ols) {
                    const listElementContents = [];
                    const listElementParent = ol.parentElement;
                    const listElements = ol.getElementsByTagName("LI");
                    for (const listElement of listElements) {
                        listElementContents.push(listElement.innerHTML);
                    }
                    ol.remove();
                    var index = 0;
                    for (listElementContent of listElementContents) {
                        index++;
                        const headingText = index + ".";
                        const paraText = listElementContent;
                        wrapTextLevel(document, listElementParent, headingText, "level3");
                        wrapText(document, listElementParent, paraText);
                        breakElement(document, listElementParent);
                    }
                }

                // simplify
                tags.push("test123");

                return Promise.resolve(tags);
            });

            // ########################
            // 4.Build
            // ########################
            await base.build(buildPath, tags);
        }
        await page.close();
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log('Failed to scrape!!!');
        process.exit(1);
    }
}

module.exports = scraper;