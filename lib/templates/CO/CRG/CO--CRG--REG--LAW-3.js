const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("../../../common/base");
const test = require("../../../../tests/CO--CRG--REG--LAW-3.test");

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
            await page.waitForSelector("#divTextoPrincipal");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }
                const rootTitle1 = document.querySelectorAll('.texto_documento10 > table > tbody > tr:first-of-type');
                const rootTitle2 = document.querySelectorAll('div > div:first-of-type > .MsoNormal:first-of-type > b > span');
                try { tags.push("<div class='level1' title='level1'>" + rootTitle1[0].textContent + " " + rootTitle2[0].textContent + "</div>"); } catch (e) { }
                try { tags.push("<div class='issue-date' title='issue-date'>2004-10-06T00:00:00</div>"); } catch (e) { }
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
                const elements = document.querySelectorAll('.style1 > font > div');
                for (const element of elements[0].childNodes) {
                    if (element.className == 'Section1') {
                        let a = 0;
                        for (const childs of element.childNodes) {
                            if (childs.tagName == 'P') {
                                if (childs.textContent.includes('CAPÍTULO')) {
                                    try { tags.push("<div class='level2' title='level2'>" + childs.outerHTML + element.childNodes[a + 4].outerHTML + "</div>"); nextLevel = 3; } catch (e) { }
                                } else if (a > 3) {
                                    if (!(element.childNodes[a - 4].textContent.includes('CAPÍTULO'))) {
                                        AddTransform(childs);
                                    }
                                }
                            } a++;
                        }
                    } else if (element.tagName == 'SPAN') {
                        for (const childs of element.childNodes) {
                            if (childs.className == 'WordSection1') {
                                let b = 0;
                                for (const child of childs.childNodes) {
                                    if (child.textContent.includes('CAPÍTULO')) {
                                        try { tags.push("<div class='level2' title='level2'>" + child.outerHTML + childs.childNodes[b + 4].outerHTML + "</div>"); nextLevel = 3; } catch (e) { }
                                    } else if (b > 3) {
                                        if (!(childs.childNodes[b - 4].textContent.includes('CAPÍTULO'))) {
                                            AddTransform(child);
                                        }
                                    } else {
                                        AddTransform(child);
                                    } b++;
                                }
                            } else if (childs.className == 'Section1') {
                                let c = 0;
                                for (const child of childs.childNodes) {
                                    if (child.textContent.includes('CAPÍTULO') || child.textContent.includes('CAPITULO')) {
                                        try { tags.push("<div class='level2' title='level2'>" + child.outerHTML + childs.childNodes[c + 4].outerHTML + "</div>"); nextLevel = 3; } catch (e) { }
                                    } else if (c > 3) {
                                        if (!(childs.childNodes[c - 4].textContent.includes('CAPÍTULO') || childs.childNodes[c - 4].textContent.includes('CAPITULO'))) {
                                            AddTransform(child);
                                        }
                                    } else {
                                        AddTransform(child);
                                    } c++;
                                }
                            }
                        }
                    } else if (element.nodeType == 3 && !(element.textContent.startsWith('Fecha'))) {
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
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".style1 > font > div", [".text","title","comment","style","div > div:first-of-type > .MsoNormal:first-of-type > b > span"], "body", [".level1"]);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;