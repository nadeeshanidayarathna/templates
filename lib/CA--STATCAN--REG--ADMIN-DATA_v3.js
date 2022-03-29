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

        // 1.Download
        console.log("getting url:" + url);
        const page = await browser.newPage();
        await base.download(downloadPath, page, url);

        // 2.Identify
        // 3.Collect
        {
            await page.waitForSelector('.region-laurier-first');
            page.on('console', (msg) => console.log(msg.text()));

            // add it manually and expose to window
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

                // ################
                // # root:heading #
                // ################

                const elements = document.querySelectorAll(".region-laurier-first h1");
                await xpath(elements[0], xPaths);
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