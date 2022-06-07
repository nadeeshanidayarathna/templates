const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");
const test = require("../tests/UN--FDICF--REG--BASE.test");

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
            await page.waitForSelector("#content");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }
                const elements = document.querySelectorAll("#content > .page_title");
                try { tags.push("<div class='level1' title='level1'>" + elements[0].outerHTML + "</div>"); } catch (e) { }
                const issueDates = document.querySelectorAll("#content em");
                const issueDate = /\w+\s\d+,\s\d{4}/.exec(issueDates[issueDates.length - 1].textContent);
                try { tags.push("<div class='issue-date' title='issue-date'>" + (new Date(issueDate[0]).getFullYear()) + "-" + ("0" + (new Date(issueDate[0]).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDate[0]).getDate())).slice(-2) + "T00:00:00</div>"); } catch (e) { }
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

                try { tags.push("<div class='ease-content'>"); } catch (e) { }
                const rootTransformHeadings = document.querySelectorAll("#content > h2");
                AddTransforms(rootTransformHeadings);
                {
                    const elements = document.querySelectorAll("#content p");
                    for (const element of elements) {
                        if (element.childElementCount != 0) {
                            if (element.children[0].tagName == "STRONG") {
                                const childs = element.childNodes;
                                for (const child of childs) {
                                    if (child.childElementCount == 0) {
                                        AddTransform(child);
                                    }
                                    else {
                                        try { tags.push("<div class='level2' title='level2'>" + child.outerHTML + "</div>"); } catch (e) { }
                                    }
                                }
                            } else {
                                if (element.children[0].tagName == "EM" && element.lastChild.nodeName == "EM" && element.firstChild.nodeType == Node.COMMENT_NODE) {
                                    const childs = element.childNodes;
                                    for (const child of childs) {
                                        if (child.nodeType == Node.COMMENT_NODE) {
                                            child.remove()
                                        }
                                    }
                                    try { tags.push("<div class='level2' title='level2'>" + element.innerHTML + "</div>"); } catch (e) { }
                                } else if (element.align != "center") {
                                    AddTransform(element);
                                }
                            }
                        } else {
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