const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");
const test = require("../tests/base.test");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { id, originalHtmlPath, buildHtmlPath, originalTextPath, buildTextPath, metadataPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false
        });

        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            url = await base.download(id, originalHtmlPath, metadataPath, page, url);

            // 2.Identify
            // 3.Collect
            await page.waitForSelector(".full-chapter");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }

                const rootElement = document.querySelectorAll('.breadcrumbs li:last-of-type');
                try { tags.push("<div class='level1' title='level1'>" + rootElement[0].textContent + "</div>"); } catch (e) { }
                try { tags.push("<div class='issue-date' title='issue-date'>2016-09-14T00:00:00</div>"); } catch (e) { }

                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
                Array.prototype.forEach.call(document.getElementsByTagName("ul"), function (node) { node.style.listStyleType = 'none'; });
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "/") { node.setAttribute("src", (new URL(url)).origin + src); } } });
                Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "/") { node.setAttribute("href", (new URL(url)).origin + href); } } });

                function AddTransform(node) {
                    if (node != undefined) {
                        try { tags.push("<div>" + ((node.nodeType == Node.TEXT_NODE) ? node.textContent : node.outerHTML) + "</div>"); } catch (e) { }
                    }
                }
                function AddTransforms(nodes) {
                    for (node of nodes) {
                        AddTransform(node);
                    }
                }

                try { tags.push("<div class='ease-content'>"); } catch (e) { }
                const elements = document.querySelectorAll('.full-chapter');
                for (const element of elements[0].childNodes) {
                    if (element.tagName == 'ARTICLE') {
                        for (const childs of element.childNodes) {
                            if (childs.className == 'handbook-content') {
                                for (const child of childs.childNodes) {
                                    if (child.tagName == 'HEADER') {
                                        try { tags.push("<div class='level2' title='level2'>" + child.textContent + "</div>"); } catch (e) { }
                                    } else if (child.tagName == 'SECTION') {
                                        for (const childLevel2 of child.childNodes) {
                                            if (childLevel2.tagName == 'DIV') {
                                                for (const childLevel3 of childLevel2.childNodes) {
                                                    if (childLevel3.className == 'section-content-table') {
                                                        let i = 0;
                                                        for (const childLevel4 of childLevel3.childNodes) {
                                                            if (childLevel4.tagName == 'P' && i == 1) {
                                                                try { tags.push("<div class='level3' title='level3'>" + childLevel4.textContent + "</div>"); } catch (e) { }
                                                            } else {
                                                                AddTransform(childLevel4);
                                                            } i++;
                                                        }
                                                    } else { AddTransform(childLevel3); }
                                                }
                                            } else { AddTransform(childLevel2); }
                                        }
                                    } else { AddTransform(child); }
                                }
                            }
                        }
                    }
                }

                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "body", [".cookie-consent", ".manage-cookies", "#skip", ".header", "#dialog-favourite", "footer", "script", ".breadcrumbs > div > div > div > ul > *:not(li:last-of-type)", ".content > div >div > div  > *:not(.col_cx)", "button", "#glossaryPageLoading"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;