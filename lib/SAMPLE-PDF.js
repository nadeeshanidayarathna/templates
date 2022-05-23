const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");
const test = require("../tests/base.test");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { originalHtmlPath, buildHtmlPath, originalTextPath, buildTextPath, metadataPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: true
        });

        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            url = await base.download(originalHtmlPath, metadataPath, page, url);

            // 2.Identify
            // 3.Collect
            await page.waitForSelector("body");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }

                try { tags.push("<div class='level1' title='level1'>Iowa Administrative Code - 05/18/2022</div>"); } catch (e) { }
                try { tags.push("<div class='issue-date' title='issue-date'>2022-05-18T00:00:00</div>"); } catch (e) { }
                // try { tags.push("<div class='effective-date' title='effective-date'></div>"); } catch (e) { }

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

                try { tags.push("<div class='content'>"); } catch (e) { }

                const body = document.getElementsByTagName("body")[0];

                // TODO:
                // try { tags.push("<div class='level2' title='level2'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='level3' title='level3'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='level4' title='level4'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='level5' title='level5'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='level6' title='level6'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='level7' title='level7'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='level8' title='level8'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='level9' title='level9'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='footnote' title='footnote'></div>"); } catch (e) { }

                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        // await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "<TBD>", ["<TBD>"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;