const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");
const test = require("../tests/UN--FDICF--REG--BASE.test");

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
            await page.waitForSelector("#content");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }
                const elements = document.querySelectorAll("#content > .page_title");
                try { tags.push("<div class='level1' title='level1'>" + elements[0].outerHTML + "</div>"); } catch (e) { }
                const dates = document.querySelectorAll("#content em");
                const issueDate = /\w+\s\d+,\s\d{4}/.exec(dates[2].textContent);
                try { tags.push("<div class='issue-date' title='issue-date'>" + (new Date(issueDate[0]).getFullYear()) + "-" + ("0" + (new Date(issueDate[0]).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDate[0]).getDate())).slice(-2) + "T00:00:00</div>"); } catch (e) { }
                const effectiveDateStr = /\w+\s\d+,\s\d{4}]/.exec(dates[2].textContent);
                const effectiveDate = effectiveDateStr[0].slice(0, effectiveDateStr[0].length - 1);
                try { tags.push("<div class='effective-date' title='effective-date'>" + (new Date(effectiveDate).getFullYear()) + "-" + ("0" + (new Date(effectiveDate).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(effectiveDate).getDate())).slice(-2) + "T00:00:00</div>"); } catch (e) { }
                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "/") { node.setAttribute("src", (new URL(url)).origin + src); } } });
                Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "/") { node.setAttribute("href", (new URL(url)).origin + href); } } });

                function AddTransform(node) {
                    if (node != undefined) {
                        try { tags.push("<div>" + ((node.nodeType == Node.TEXT_NODE) ? node.textContent : node.outerHTML) + "</div>"); node.remove(); } catch (e) { }
                    }
                }
                function AddTransforms(nodes) {
                    for (node of nodes) {
                        AddTransform(node);
                    }
                }

                try { tags.push("<div class='content'>"); } catch (e) { }

                const rootTransformHeadings = document.querySelectorAll("#content > h2");
                AddTransforms(rootTransformHeadings);
                {
                    const elements = document.querySelectorAll("#content p")
                    let a = 0, i = 0;
                    for (const element of elements) {
                        if (element.tagName == "P" && element.childElementCount != 0) {
                            const childs = element.childNodes;
                            for (const child of childs) {
                                if (child.tagName == "STRONG") {
                                    if (i == 0) {
                                        AddTransform(child);
                                    }
                                    else {
                                        try { tags.push("<div class='level2' title='level2'>" + child.outerHTML + "</div>"); } catch (e) { }
                                    } i++;
                                }
                                else if (child.tagName == "EM") {
                                    if (a == 2) {
                                        AddTransform(child);
                                    }
                                    else {
                                        try { tags.push("<div class='level3' title='level3'>" + child.outerHTML + "</div>"); } catch (e) { }
                                    } a++;
                                }
                                else if (child.nodeType != Node.COMMENT_NODE) {
                                    AddTransform(child);
                                }
                            }

                        } else if (element.tagName == "P" && element.nodeType != Node.COMMENT_NODE && element.outerText != "") {
                            AddTransform(element);
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
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#content", [], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;