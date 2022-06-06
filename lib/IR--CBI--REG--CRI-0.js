const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");
const test = require("../tests/IR--CBI--REG--CRI-0.test");

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
                try { tags.push("<div class='root'>"); } catch (e) { }

                const rootTitle = document.querySelectorAll('#content h1');
                try { tags.push("<div class='level1' title='level1'>" + rootTitle[0].outerHTML + "</div>"); } catch (e) { }
                const dateStrings = document.querySelectorAll('.coverpage > p > b');
                for (const dateString of dateStrings) {
                    if (dateString.textContent.startsWith('Updated')) {
                        const date = /\d+\s+\w+/.exec(dateString.textContent);
                        const year = /\d{4}/.exec(dateString.textContent);
                        const issueDate = date[0] + "," + year[0];
                        try { tags.push("<div class='issue-date' title='issue-date'>" + (new Date(issueDate).getFullYear()) + "-" + ("0" + (new Date(issueDate).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDate).getDate())).slice(-2) + "T00:00:00</div>"); } catch (e) { }
                    }
                }

                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "h") { node.setAttribute("src", /\S*en\//.exec((new URL(url)).href) + src); } } });
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
                {
                    const coverTransform = document.querySelectorAll('.frontmatter .coverpage');
                    AddTransform(coverTransform[0]);

                    const elementNarratives = document.querySelectorAll('.narrative');
                    for (const elementNarrative of elementNarratives) {
                        for (const elements of elementNarrative.childNodes) {
                            if (elements.tagName == 'P' && elements.className == 'heading') {
                                try { tags.push("<div class='level2' title='level2'>" + elements.outerHTML + "</div>"); } catch (e) { }
                            } else {
                                AddTransform(elements);
                            }
                        }
                    }

                    let scrape = false;
                    const elements = document.querySelectorAll('.frontmatter');
                    for (const element of elements[0].childNodes) {
                        if (element.className == 'actsreferredto') {
                            scrape = true;
                        }
                        if (scrape == true) {
                            if (element.tagName == 'P' && element.childNodes[1] != undefined) {
                                if (element.childNodes[1].textContent.startsWith('REVISED')) {
                                    try { tags.push("<div class='level2' title='level2'>" + element.previousElementSibling.textContent + " " + element.textContent + "</div>"); } catch (e) { }
                                } else if (element.nextElementSibling.childNodes[1] != undefined) {
                                    if (element.nextElementSibling.childNodes[1].textContent.startsWith('REVISED')) {

                                    } else {
                                        AddTransform(element);
                                    }
                                } else {
                                    AddTransform(element);
                                }
                            } else if (element.className != 'actsreferredto') {
                                AddTransform(element);
                            }
                        }
                    }

                    const bodyElements = document.querySelectorAll('.body > .part');
                    for (const bodyElement of bodyElements) {
                        for (const elements of bodyElement.childNodes) {
                            if (elements.className == 'title') {
                                try { tags.push("<div class='level2' title='level2'>" + elements.textContent + "</div>"); } catch (e) { }
                            } else if (elements.className == 'sect') {
                                for (const element of elements.childNodes) {
                                    if (element.className == 'title') {
                                        try { tags.push("<div class='level3' title='level3'>" + element.outerHTML + "</div>"); } catch (e) { }
                                    } else if (element.className != 'number') {
                                        AddTransform(element);
                                    }
                                }
                            } else if (elements.className == 'chapter') {
                                for (const element of elements.childNodes) {
                                    if (element.className == 'title') {
                                        if (element.outerText.startsWith('Chapter')) {
                                            try { tags.push("<div class='level3' title='level3'>" + element.textContent + "</div>"); } catch (e) { }
                                        } else {
                                            try { tags.push("<div class='level3' title='level3'>" + element.childNodes[1].textContent + " " + element.childNodes[3].textContent + "</div>"); } catch (e) { }
                                            AddTransform(element.childNodes[5]);
                                        }
                                    } else if (element.className == 'sect') {
                                        for (const childs of element.childNodes) {
                                            if (childs.className == 'title') {
                                                try { tags.push("<div class='level4' title='level4'>" + childs.textContent + "</div>"); } catch (e) { }
                                            } else if (childs.className != 'number') {
                                                AddTransform(childs);
                                            }
                                        }
                                    } else if (element.className == 'annotations') {
                                        AddTransform(element);
                                    } else if (element.tagName == 'FOOTER') {
                                        try { tags.push("<div class='footnote' title='footnote'>" + element.outerHTML + "</div>"); } catch (e) { }
                                    }
                                }
                            } else if (elements.tagName == 'FOOTER') {
                                try { tags.push("<div class='footnote' title='footnote'>" + elements.outerHTML + "</div>"); } catch (e) { }
                            } else if (elements.className == 'annotations') {
                                AddTransform(elements);
                            }
                        }
                    }

                    const scheduleElements = document.querySelectorAll('.backmatter');
                    for (const scheduleElement of scheduleElements[0].childNodes) {
                        if (scheduleElement.tagName == 'SECTION') {
                            for (const elements of scheduleElement.childNodes) {
                                if (elements.nodeType != 3) {
                                    if (elements.className == 'title') {
                                        try { tags.push("<div class='level2' title='level2'>" + elements.textContent + "</div>"); } catch (e) { }
                                    } else if (elements.outerText.startsWith('LIST OF ACTIVITIES')) {
                                        try { tags.push("<div class='level3' title='level3'>" + elements.textContent + "</div>"); } catch (e) { }
                                    } else {
                                        AddTransform(elements);
                                    }
                                }
                            }
                        } else if (scheduleElement.tagName == 'FOOTER') {
                            try { tags.push("<div class='footnote' title='footnote'>" + scheduleElement.outerHTML + "</div>"); } catch (e) { }
                        }
                    }

                    try { tags.push("</div>"); } catch (e) { }
                }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#content", [".actsreferredto", "style", ".number", "ul.nav-tabs", ".acttoc"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;