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
            await page.waitForSelector("div.act");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }
                const rootElements = document.querySelectorAll('#contentCell > div.hcontainer');
                let a = 0;
                for (const element of rootElements) {
                    if (a == 18) {
                        for (const childs of element.childNodes) {
                            if (childs.className == "heading-part") {
                                try { tags.push("<div class='level1' title='level1'>" + childs.outerHTML + "</div>"); } catch (e) { }
                            }
                        }
                    } a++;
                }
                try { tags.push("<div class='issue-date' title='issue-date'>2016-03-04T00:00:00</div>"); } catch (e) { }
                try { tags.push("</div>"); } catch (e) { }

                // removing all hidden & unwanted content
                Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "/" || href.charAt(0) == "a") { node.setAttribute("href", /\S*kenyalex\//.exec(new URL(url).href) + href); } } });
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "/") { node.setAttribute("src", (new URL(url)).origin + src); } } });

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

                // ################
                // # main:content #
                // ################
                try { tags.push("<div class='content'>"); } catch (e) { } let nextLevel = 2;
                const elements = document.querySelectorAll('#contentCell > div.hcontainer');
                let b = 0;
                for (const element of elements) {
                    if (b == 18) {
                        for (const childs of element.childNodes) {
                            if (childs.className == "heading-part") {
                                childs.remove();
                            } else if (childs.className == 'part') {
                                for (const child of childs.childNodes) {
                                    if (child.className == 'heading-part') {
                                        if (child.textContent.startsWith('PART')) {
                                            try { tags.push("<div class='level2' title='level2'>" + child.outerHTML + "</div>"); nextLevel = 3; } catch (e) { }
                                        } else {
                                            try { tags.push("<div class='level3' title='level3'>" + child.outerHTML + "</div>"); nextLevel = 4; } catch (e) { }
                                        }
                                    } else if (child.className == 'hcontainer') {
                                        try { tags.push("<div class='level3' title='level3'>" + child.textContent + "</div>"); nextLevel = 4; } catch (e) { }
                                    } else if (child.className == 'section') {
                                        for (const childLevel1 of child.childNodes) {
                                            if (childLevel1.className == 'heading-section') {
                                                for (const childLevel2 of childLevel1.childNodes) {
                                                    if (childLevel2.tagName == 'TABLE') {
                                                        for (const childLevel3 of childLevel2.childNodes) {
                                                            if (childLevel3.tagName == 'TBODY') {
                                                                for (const childLevel4 of childLevel3.childNodes) {
                                                                    if (childLevel4.tagName == 'TR') {
                                                                        try { tags.push("<div class='level" + nextLevel + "' title='level" + nextLevel + "'>" + childLevel4.childNodes[1].textContent + " " + childLevel4.childNodes[3].childNodes[1].textContent + "</div>"); childLevel4.childNodes[3].childNodes[1].remove(); childLevel4.childNodes[1].remove(); } catch (e) { }
                                                                        AddTransforms(childLevel4.childNodes);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } else if (child.className == 'subpart') {
                                        try { tags.push("<div class='level3' title='level3'>" + child.textContent + "</div>"); nextLevel = 4; } catch (e) { }
                                    }
                                }
                            } else if (childs.className == 'hcontainer') {
                                for (const child of childs.childNodes) {
                                    if (child.tagName == 'P' && child.textContent != "") {
                                        try { tags.push("<div class='level2' title='level2'>" + child.textContent + "</div>"); } catch (e) { }
                                    } else if (child.tagName == 'DIV' && child.className == "" && child.textContent.startsWith('PART')) {
                                        try { tags.push("<div class='level3' title='level3'>" + child.textContent + "</div>"); } catch (e) { }
                                    } else if (child.tagName == 'DIV' && child.className == 'part') {
                                        for (const childLevel1 of child.childNodes) {
                                            if (childLevel1.className == "heading-part" && childLevel1.textContent != "") {
                                                try { tags.push("<div class='level3' title='level3'>" + childLevel1.textContent + "</div>"); childLevel1.remove(); } catch (e) { }
                                            }
                                        } AddTransform(child);
                                    } else {
                                        AddTransform(child);
                                    }
                                }
                            }
                        }
                    } b++;
                }
                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#contentCell > div:nth-of-type(150)", [], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;