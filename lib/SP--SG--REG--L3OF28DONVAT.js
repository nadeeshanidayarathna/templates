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
            await page.waitForSelector(".documento-tit,#textoxslt");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }
                const rootElements = document.querySelectorAll(".documento-tit");
                try { tags.push("<div class='level1' title='level1'>" + rootElements[0].outerHTML + "</div>"); } catch (e) { }
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
                Array.prototype.forEach.call(document.querySelectorAll(".marcadores,.linkSubir,.subtitMostrado,form,p[class='bloque']"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "/") { node.setAttribute("src", (new URL(url)).origin + src); } } });
                Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "/") { node.setAttribute("href", (new URL(url)).origin + href); } } });

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
                const elements = document.querySelectorAll("#textoxslt");
                const mainContent = elements[0];
                const rootTransform = mainContent.querySelectorAll("h3,#preambulo");
                AddTransforms(rootTransform, true);

                var nextLevel;
                for (const mainContentChild of mainContent.childNodes) {
                    if (mainContentChild.id != undefined && mainContentChild.id == "tpreliminar") {
                        try { tags.push("<div class='level2' title='level2'>" + mainContentChild.outerHTML + "</div>"); } catch (e) { }
                        nextLevel = 3;
                    } else if (mainContentChild.id != undefined && mainContentChild.id == "pr") {
                        const prChilds = mainContentChild.childNodes;
                        var centroRedondaCount = 0;
                        var previousPrNumberChild;
                        for (const prChild of prChilds) {
                            if (prChild.classList != undefined && Array.from(prChild.classList).includes("centro_redonda")) {
                                if (centroRedondaCount == 0) {
                                    try { tags.push("<div class='level2' title='level2'>" + prChild.outerHTML + "</div>"); } catch (e) { }
                                } else {
                                    if (isNaN(prChild.textContent)) {
                                        if (previousPrNumberChild != null) {
                                            try { tags.push("<div class='level3' title='level3'>" + previousPrNumberChild.outerHTML + prChild.outerHTML + "</div>"); } catch (e) { }
                                            previousPrNumberChild = null;
                                        } else {
                                            AddTransform(prChild, false);
                                        }
                                    } else {
                                        previousPrNumberChild = prChild;
                                    }
                                }
                                centroRedondaCount++;
                            } else if (prChild.classList != undefined && Array.from(prChild.classList).includes("articulo")) {
                                try { tags.push("<div class='level4' title='level4'>" + prChild.outerHTML + "</div>"); } catch (e) { }
                            } else if (prChild.classList != undefined && Array.from(prChild.classList).includes("parrafo_2") && prChild.querySelectorAll("strong").length > 0) {
                                try { tags.push("<div class='level4' title='level4'>" + prChild.outerHTML + "</div>"); } catch (e) { }
                            } else {
                                AddTransform(prChild, false);
                            }
                        }
                    } else if (mainContentChild.id != undefined && mainContentChild.id == "an") {
                        const anexoHeadingElement = mainContentChild.querySelectorAll("h4")[0];
                        try { tags.push("<div class='level2' title='level2'>" + anexoHeadingElement.outerHTML + "</div>"); anexoHeadingElement.remove(); } catch (e) { }
                        AddTransform(mainContentChild);
                    } else if (mainContentChild.id != undefined && mainContentChild.id.startsWith("t")) {
                        try { tags.push("<div class='level2' title='level2'>" + mainContentChild.outerHTML + "</div>"); } catch (e) { }
                        nextLevel = 3;
                    } else if (mainContentChild.id != undefined && mainContentChild.id.startsWith("c")) {
                        const chapterHeadingElement = mainContentChild.querySelectorAll("h4")[0];
                        try { tags.push("<div class='level3' title='level3'>" + chapterHeadingElement.outerHTML + "</div>"); chapterHeadingElement.remove(); } catch (e) { }
                        nextLevel = 4;
                        AddTransform(mainContentChild);
                    } else if (mainContentChild.id != undefined && mainContentChild.id.startsWith("s")) {
                        const sectionHeadingElement = mainContentChild.querySelectorAll("h4")[0];
                        try { tags.push("<div class='level4' title='level4'>" + sectionHeadingElement.outerHTML + "</div>"); sectionHeadingElement.remove(); } catch (e) { }
                        nextLevel = 5;
                        AddTransform(mainContentChild);
                    } else if (mainContentChild.id != undefined && mainContentChild.id.startsWith("a")) {
                        const articleHeadingElement = mainContentChild.querySelectorAll("h5")[0];
                        try { tags.push("<div class='level" + nextLevel + "' title='level" + nextLevel + "'>" + articleHeadingElement.outerHTML + "</div>"); articleHeadingElement.remove(); } catch (e) { }
                        AddTransform(mainContentChild, false);
                    } else if (mainContentChild.id != undefined && mainContentChild.id.startsWith("d")) {
                        const disposicionHeadingElement = mainContentChild.querySelectorAll("h5")[0];
                        try { tags.push("<div class='level" + nextLevel + "' title='level" + nextLevel + "'>" + disposicionHeadingElement.outerHTML + "</div>"); disposicionHeadingElement.remove(); } catch (e) { }
                        AddTransform(mainContentChild);
                    } else {
                        AddTransform(mainContentChild, false);
                    }
                }

                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".documento-tit,#textoxslt", [".marcadores,.linkSubir,.subtitMostrado,form,p[class='bloque']"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;