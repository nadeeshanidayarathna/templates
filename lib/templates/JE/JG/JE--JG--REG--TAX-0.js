const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("../../../common/base");
const test = require("../../../../tests/common/base.test");

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
            await page.waitForSelector(".law");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }

                const rootTitles = document.querySelectorAll('#breadcrumb .content-margin span');
                for (const rootTitle of rootTitles) {
                    if (rootTitle.textContent.startsWith('Taxation')) {
                        try { tags.push("<div class='level1' title='level1'>" + rootTitle.outerHTML + "</div>"); } catch (e) { }
                    }
                }
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

                const elements = document.querySelectorAll('.law');
                for (const element of elements[0].childNodes) {
                    if (element.className == 'WordSection1') {
                        element.childNodes[1].remove();
                        AddTransform(element);
                    } else if (element.className == 'WordSection3') {
                        for (const childs of element.childNodes) {
                            if (childs.className == 'iLAWS300Article') {
                                try { tags.push("<div class='level2' title='level2'>" + childs.outerHTML + "</div>"); } catch (e) { }
                            } else if (childs.className != 'iLAWS115CrestSmall') {
                                AddTransform(childs);
                            }
                        }
                    } else if (element.className == 'WordSection4') {
                        for (const childs of element.childNodes) {
                            if (childs.className == 'iLAWS400ScheduleHeading') {
                                try { tags.push("<div class='level2' title='level2'>" + childs.outerHTML + "</div>"); } catch (e) { }
                            } else if (childs.className == 'iLAWS401ScheduleSubHeading' && childs.textContent.startsWith('Value')) {
                                try { tags.push("<div class='level3' title='level3'>" + childs.outerHTML + "</div>"); } catch (e) { }
                            } else if (childs.className == 'iLAWS410ScheduleParagraph') {
                                try { tags.push("<div class='level4' title='level4'>" + childs.outerHTML + "</div>"); } catch (e) { }
                            } else if (childs.className == 'iLAWS401ScheduleSubHeading') {
                                try { tags.push("<div class='level5' title='level5'>" + childs.outerHTML + "</div>"); } catch (e) { }
                            } else {
                                AddTransform(childs);
                            }
                        }
                    } else if (element.className == 'WordSection5') {
                        for (const childs of element.childNodes) {
                            if (childs.className == 'iLAWS600EndnotesTitle') {
                                try { tags.push("<div class='level2' title='level2'>" + childs.outerHTML + "</div>"); } catch (e) { }
                            } else if (childs.className == 'iLAWS602EndnotesHeading' && childs.textContent.startsWith('Table')) {
                                try { tags.push("<div class='level3' title='level3'>" + childs.outerHTML + "</div>"); } catch (e) { }
                            } else {
                                AddTransform(childs);
                            }
                        }
                    } else if (element.tagName == 'DIV' && element.className == "") {
                        for (const childs of element.childNodes) {
                            if (childs.tagName == 'DIV') {
                                if (childs.id.startsWith('edn')) {
                                    try { tags.push("<div class='footnote' title='footnote'>" + childs.outerHTML + "</div>"); } catch (e) { }
                                }
                            } else {
                                AddTransform(childs);
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
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".law", [".WordSection2"], "body", [".level1"]);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;