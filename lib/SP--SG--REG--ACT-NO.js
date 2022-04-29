const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");
const test = require("../tests/base.test");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { originalHtmlPath, buildHtmlPath, originalTextPath, buildTextPath, urlTextPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false
        });

        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            url = await base.download(originalHtmlPath, urlTextPath, page, url);

            // 2.Identify
            // 3.Collect
            await page.waitForSelector("#contenido");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }
                const elements = document.querySelectorAll(".documento-tit");
                try { tags.push("<div class='level1' title='level1'>" + elements[0].outerHTML + "</div>"); } catch (e) { }
                const issueDates = document.querySelectorAll('.conso > dd:first-of-type');
                const issueDateStr = /\d+\/\d+\/\d{4}/.exec(issueDates[0].textContent);
                const issueDateDay = /\d+\//.exec(issueDateStr); const issueDateMonth = /\/\d+\//.exec(issueDateStr); const issueDateYear = /\d{4}/.exec(issueDateStr);
                const issueDate = issueDateMonth[0].slice(1, issueDateMonth[0].length - 1) + "-" + issueDateDay[0].slice(0, issueDateDay[0].length - 1) + "-" + issueDateYear;
                try { tags.push("<div class='issue-date' title='issue-date'>" + (new Date(issueDate).getFullYear()) + "-" + ("0" + (new Date(issueDate).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDate).getDate())).slice(-2) + "T00:00:00</div>"); } catch (e) { }
                try { tags.push("</div>"); } catch (e) { }
                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
                Array.prototype.forEach.call(document.querySelectorAll(".subtitMostrado"), function (node) { node.remove(); });
                // Array.prototype.forEach.call(document.querySelectorAll("input"), function (node) { node.remove(); });
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
                const rootTransformHeadings = document.querySelectorAll(".conso, .redaccion .etiqDoc, .version-actual, .enlaces-conso");
                AddTransforms(rootTransformHeadings);
                const title2 = document.querySelectorAll("#textoxslt > h3");
                try { tags.push("<div class='level2' title='level2'>" + title2[0].outerHTML + "</div>"); } catch (e) { }
                {
                    const elements = document.querySelectorAll("div.bloque");
                    let i = 0;
                    for (const element of elements) {
                        const childs = element.childNodes;
                        for (const child of childs) {
                            if (child.className == "subseccion") {
                                if (i < 2) {
                                    AddTransform(child);
                                } else if (i == 2) {
                                    try { tags.push("<div class='level3' title='level3'>" + child.outerHTML + "</div>"); } catch (e) { }
                                } else if (i > 2) {
                                    try { tags.push("<div class='level4' title='level4'>" + child.outerHTML + "</div>"); } catch (e) { }
                                }i++;
                            } else if (child.className == "titulo_num"){
                                try { tags.push("<div class='level3' title='level3'>" + child.textContent + " " + child.nextElementSibling.textContent + "</div>"); } catch (e) { }
                            } else if (child.className == "capitulo_num") {
                                try { tags.push("<div class='level4' title='level4'>" + child.textContent + " " + child.nextElementSibling.textContent + "</div>"); } catch (e) { }
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
        // await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".documento-tit ,.conso, .redaccion .etiqDoc, .version-actual, .enlaces-conso, #textoxslt > h3, div.bloque", [".subtitMostrado","p.bloque", "input"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;