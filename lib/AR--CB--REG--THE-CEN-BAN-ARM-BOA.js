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
            await page.waitForSelector("#divDocPlaceHolder");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }
                const rootTitle = document.querySelectorAll('#Title');
                try { tags.push("<div class='level1' title='level1'>" + rootTitle[0].outerHTML + "</div>"); } catch (e) { }
                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "A") { node.setAttribute("src", (new URL(url)).origin + "/" + src); } } });
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
                const elements = document.querySelectorAll('#Body');
                let i = 0;
                for (const element of elements[0].childNodes) {
                    if (i == 15) {
                        try { tags.push("<div class='level2' title='level2'>" + element.outerHTML + " " + elements[0].childNodes[21].outerHTML + "</div>"); } catch (e) { }
                    } else if (i == 71) {
                        try { tags.push("<div class='level2' title='level2'>" + element.outerHTML + " " + elements[0].childNodes[75].outerHTML + "</div>"); } catch (e) { }
                    } else if (i == 35) {
                        try { tags.push("<div class='level3' title='level3'>" + element.outerHTML + " " + elements[0].childNodes[39].outerHTML + "</div>"); } catch (e) { }
                    } else if (element.textContent.startsWith('Գ Լ Ո Ւ Խ') || element.textContent.startsWith('Գ Լ ՈՒ Խ')) {
                        try { tags.push("<div class='level3' title='level3'>" + element.outerHTML + " " + elements[0].childNodes[i + 4].outerHTML + "</div>"); } catch (e) { }
                    } else if (i != 21 && i != 75 && i != 39 && i > 5) {
                        if (!(elements[0].childNodes[i - 4].textContent.startsWith('Գ Լ Ո Ւ Խ') || elements[0].childNodes[i - 4].textContent.startsWith('Գ Լ ՈՒ Խ'))) {
                            AddTransform(element);
                        }
                    } else if (i < 6) {
                        AddTransform(element);
                    }
                    i++;
                }
                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#Body", [], "body", [".level1"]);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;