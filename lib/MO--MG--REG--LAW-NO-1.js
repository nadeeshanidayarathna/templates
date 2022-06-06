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
            await page.waitForSelector(".page_textes");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }
                const rootElements = document.querySelectorAll(".LVL_0");
                try { tags.push("<div class='level1' title='level1'>" + rootElements[0].childNodes[0].textContent + "</div>"); } catch (e) { }
                try { tags.push("</div>"); } catch (e) { }
                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
                Array.prototype.forEach.call(document.querySelectorAll(".NUMART1 > a"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "/") { node.setAttribute("src", (new URL(url)).origin + src); } } });
                Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == ".") { node.setAttribute("href", /\S*.nsf/.exec(new URL(url).href) + href.slice(2, href.length)); } } });

                function AddTransform(node, remove) {
                    if (node != undefined) {
                        try { tags.push("<div>" + ((node.nodeType == Node.TEXT_NODE) ? node.textContent : node.outerHTML) + "</div>"); if (remove) { node.remove() } } catch (e) { }
                    }
                }
                function AddTransforms(nodes, remove) {
                    for (node of nodes) {
                        AddTransform(node, remove);
                    }
                }

                try { tags.push("<div class='content'>"); } catch (e) { }
                AddTransform(rootElements[0].childNodes[1]);
                const elements = document.querySelectorAll("#content > *");
                for (const element of elements) {
                    if (element.hasChildNodes() && Array.from(element.classList).includes('DINTER')) {
                        for (const childs of element.childNodes) {
                            if (childs.hasChildNodes() && Array.from(childs.classList).includes('DINTER_TI')) {
                                for (const child of childs.childNodes) {
                                    if (child.className == "LVL_1") {
                                        try { tags.push("<div class='level2' title='level2'>" + child.outerHTML + "</div>"); child.remove(); } catch (e) { }
                                    }
                                }
                            } else if (childs.hasChildNodes() && Array.from(childs.classList).includes('DINTER')) {
                                for (const child of childs.childNodes) {
                                    if (child.hasChildNodes() && Array.from(child.classList).includes('DINTER_TI')) {
                                        for (const lvl2Child of child.childNodes) {
                                            if (lvl2Child.className == "LVL_2") {
                                                try { tags.push("<div class='level3' title='level3'>" + child.outerHTML + "</div>"); child.remove(); } catch (e) { }
                                            }
                                        }
                                    } else if (child.className == 'HISTO' || child.className == "ARTFT") {
                                        AddTransform(child, true);
                                    }
                                }
                            } else if (childs.className == 'ARTFT' || childs.className == 'HISTO') {
                                AddTransform(childs, true);
                            }
                        }
                    } else if (element.className == 'ARTFT') {
                        AddTransform(element, true);
                    }
                }


                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#content", [], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;