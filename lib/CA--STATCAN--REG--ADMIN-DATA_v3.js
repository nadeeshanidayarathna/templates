const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { downloadPath, buildPath, metaDataPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: true
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
            await page.evaluate(() => {
                window.xpath = function xpath(element, xPaths) {
                    var fullXpath = "";
                    let XDATA = [];
                    xpath(element);
                    xPaths.push(fullXpath);

                    function xpath(element, pseudo = false) {
                        fullXpath = "";
                        getXPath(element, XDATA, pseudo);
                        XDATA.reverse();
                        fullXpath = XDATA.join('>');
                        XDATA = [];
                    }

                    function getXPath(element, xpath, pseudo = false) {
                        var xp = "";
                        if (element.tagName == "HTML") {
                            return;
                        }
                        if (element.parentElement != null) {
                            xp = xp + element.tagName;
                            if (pseudo && element.classList.length > 0) {
                                xp = xp + '.' + element.classList.value.replaceAll(' ', '.');
                            }
                            if (element.parentElement.childElementCount > 1 && element.tagName != "BODY") {
                                var nth = Nthelement(element, element.parentElement);
                                if (nth > 0 && !pseudo) {
                                    xp = xp + ":nth-of-type(" + nth + ")";
                                }
                            }
                            xpath.push(xp);
                            getXPath(element.parentElement, xpath, pseudo);
                        }
                        else {
                            xpath.push(element.tagName);
                            return;
                        }
                    }

                    function Nthelement(element, parent) {
                        var count = 0;
                        for (i = 0; i < parent.childElementCount; i++) {
                            var ele = parent.children[i];
                            if (ele.tagName == element.tagName) {
                                count++;
                                if (ele == element) {
                                    return count;
                                }
                            }
                        }
                        return count;
                    }
                }
            });

            var xPaths = await page.evaluate(async function process() {
                var xPaths = [];

                function wrapElementLevel(document, element, level, xPaths) {
                    const span = document.createElement("span");
                    span.classList.add(level);
                    span.innerHTML = element.innerHTML;
                    element.innerHTML = "";
                    element.appendChild(span);
                    xpath(span, xPaths)
                }

                function wrapTextLevel(document, parent, text, level, xPaths) {
                    const span = document.createElement("span");
                    span.classList.add(level);
                    span.innerHTML = text;
                    parent.appendChild(span);
                    xpath(span, xPaths)
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

                {
                    const headElement = document.querySelectorAll("head")[0];
                    const style = document.createElement("style");
                    style.setAttribute("id", "spider-ease");
                    style.innerHTML = await getStyles();
                    headElement.appendChild(style);
                }

                // TODO: [Template Specific Root Level Info]
                const level1Element = document.querySelectorAll(".region-laurier-first h1")[0];
                wrapElementLevel(document, level1Element, "level1", xPaths);
                const issueDateElement = document.querySelectorAll("dd")[0];
                wrapElementLevel(document, issueDateElement, "issue-date", xPaths);

                // TODO: [Template Specific Main Content Info]
                const pTransforms = Array.from(document.querySelectorAll(".region-laurier-first .field-item.even > *:not(section,ul)"));
                wrapElementLevel(document, pTransforms[0], "level2", xPaths);

                const elements = document.querySelectorAll(".region-laurier-first section")
                for (const element of elements) {
                    const h2 = element.getElementsByTagName("H2")[0];
                    wrapElementLevel(document, h2, "level2", xPaths);
                    const innerElements = element.querySelectorAll("section > p, section > ul, section > ol");
                    for (const innerElement of innerElements) {
                        if (innerElement.tagName == "P") {
                            // handling main iteration P tags
                            if (innerElement.firstChild.tagName == "STRONG") {
                                const result = innerElement.textContent.match("^\\d+.\\d+.");
                                if (result != null) {
                                    const headingText = result[0];
                                    const paraText = innerElement.textContent.replace(headingText, '');
                                    resetElement(innerElement);
                                    wrapTextLevel(document, innerElement, headingText, "level3", xPaths);
                                    wrapText(document, innerElement, paraText);
                                }
                            }
                        } else if (innerElement.tagName == "OL") {
                            const listElements = innerElement.getElementsByTagName("LI");
                            var index = 0;
                            for (const listElement of listElements) {
                                index++;
                                wrapElementLevel(document, listElement, "level3", xPaths);
                            }
                        }
                    }
                }

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
        console.log(e);
        console.log('Failed to scrape!!!');
        process.exit(1);
    }
}

module.exports = scraper;