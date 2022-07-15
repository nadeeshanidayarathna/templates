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
            await page.waitForSelector("main");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }
                const rootTitle = document.querySelectorAll('.biggest');
                try { tags.push("<div class='level1' title='level1'>" + rootTitle[0].outerHTML + "</div>"); } catch (e) { }
                try { tags.push("<div class='issue-date' title='issue-date'>1991-06-13T00:00:00</div>"); } catch (e) { }
                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
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
                let nextLevel = 2;
                const rootTransform = document.querySelectorAll('.module-header > span')[0];
                AddTransform(rootTransform);

                const elements = document.querySelectorAll('.component-document-summary');
                for (const element of elements[0].childNodes) {
                    if (element.tagName == 'DIV') {
                        if (element.className == 'sfstoc') {
                            element.remove();
                        } else {
                            for (const childs of element.childNodes) {
                                if (childs.tagName == 'H3') {
                                    if (childs.textContent.startsWith('2 a') || childs.textContent.startsWith('2 c') || childs.textContent.startsWith('2 b') || childs.textContent.startsWith('5 a')) {
                                        try { tags.push("<div class='level3' title='level3'>" + childs.outerHTML + "</div>"); nextLevel = 4; } catch (e) { }
                                    } else {
                                        try { tags.push("<div class='level2' title='level2'>" + childs.outerHTML + "</div>"); nextLevel = 3; } catch (e) { }
                                    }
                                } else if (childs.tagName == 'H4') {
                                    try { tags.push("<div class='level3' title='level3'>" + childs.outerHTML + "</div>"); nextLevel = 4; } catch (e) { }
                                } else if (childs.childNodes[0] != undefined) {
                                    if (childs.childNodes[0].className == 'paragraf') {
                                        try { tags.push("<div class='level" + nextLevel + "' title='level" + nextLevel + "'>" + childs.childNodes[0].outerHTML + "</div>"); childs.childNodes[0].remove(); } catch (e) { }
                                        AddTransform(childs);
                                    } else {
                                        AddTransform(childs);
                                    }
                                } else {
                                    AddTransform(childs);
                                }
                            }
                        }

                    } else {
                        AddTransform(element);
                    }
                }

                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".small-12.medium-8.large-7.columns", [".sfstoc"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;