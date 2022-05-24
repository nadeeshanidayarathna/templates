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
            devtools: false
        });

        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            url = await base.download(originalHtmlPath, metadataPath, page, url);

            // 2.Identify
            // 3.Collect
            await page.waitForSelector(".col-md-9.col-md-push-3");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                const docContent = document.querySelectorAll(".docContents")[0];
                const headingSection = docContent.querySelectorAll("section")[0];
                const rootTitle = headingSection.querySelectorAll(".Title-of-Act")[0];
                rootTitle.remove();

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }
                try { tags.push("<div class='level1' title='level1'>" + rootTitle.outerHTML + "</div>"); } catch (e) { }
                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // removing all hidden content
                Array.prototype.forEach.call(document.querySelectorAll(".wb-invisible, .mfp-hide, .PITLink"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll("dt div.DefinedTerm"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.getElementsByTagName("ul"), function (node) { node.style.listStyleType = 'none'; });
                Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "/" || href.charAt(0) == "s") { node.setAttribute("href", (new URL(url)).origin + href); } } else { node.setAttribute("href", (new URL(url)).origin + href); } });
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "/") { node.setAttribute("src", (new URL(url)).origin + src); } } });

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

                // contentSection1
                const contentSection1 = docContent.querySelectorAll("section")[1];
                try { tags.push("<div class='content'>"); } catch (e) { }
                try { tags.push("<div>" + headingSection.outerHTML + "</div>"); } catch (e) { }
                const transformElement = docContent.querySelectorAll(".order")[0];
                AddTransform(transformElement, true);

                const sectionChilds = contentSection1.childNodes;
                var previousPreviousTagName = "";
                var previousTagName = "";
                var nextTagName = "";
                var index = 0;
                var h2MultiTags = false;
                for (const sectionChild of sectionChilds) {
                    if (index == sectionChilds.length - 1) {
                        nextTagName = "";
                    } else {
                        nextTagName = sectionChilds[index + 1].tagName;
                    }

                    if (sectionChild.tagName == "H2") {
                        h2MultiTags = sectionChild.childNodes.length > 1;
                        if (h2MultiTags == false && nextTagName == "H3") {
                            // building multi heading level2
                            try { tags.push("<div class='level2' title='level2'>" + sectionChild.outerHTML); } catch (e) { }
                        } else {
                            if (sectionChild.childNodes.length == 2) {
                                try { tags.push("<div class='level2' title='level2'>" + sectionChild.childNodes[0].outerHTML + " " + sectionChild.childNodes[1].outerHTML + "</div>"); } catch (e) { }
                            } else {
                                try { tags.push("<div class='level2' title='level2'>" + sectionChild.outerHTML + "</div>"); } catch (e) { }
                            }

                        }
                    } else if (h2MultiTags == false && previousTagName == "H2" && sectionChild.tagName == "H3") {
                        // finishing multi heading level2
                        try { tags.push(" " + sectionChild.outerHTML + "</div>"); } catch (e) { }
                    } else if (sectionChild.tagName == "SECTION") {
                        const schedules = sectionChild.querySelectorAll(".Schedule");
                        for (const schedule of schedules) {
                            const scheduleChilds = schedule.childNodes;
                            for (const scheduleChild of scheduleChilds) {
                                if (scheduleChild.tagName == "HEADER") {
                                    const headerChilds = scheduleChild.childNodes;
                                    for (const headerChild of headerChilds) {
                                        if (headerChild.tagName == "H2") {
                                            const h2Childs = headerChild.childNodes
                                            var scheduleLabel;
                                            for (const h2Child of h2Childs) {
                                                if (Array.from(h2Child.classList).includes("scheduleLabel")) {
                                                    scheduleLabel = h2Child.outerHTML;
                                                    try { tags.push("<div class='level2' title='level2'>" + scheduleLabel + "</div>"); } catch (e) { }
                                                } else if (!scheduleLabel.startsWith("FORM") && Array.from(h2Child.classList).includes("scheduleTitleText")) {
                                                    try { tags.push("<div class='level3' title='level3'>" + h2Child.outerHTML + "</div>"); } catch (e) { }
                                                } else {
                                                    AddTransform(h2Child);
                                                }
                                            }
                                        } else {
                                            AddTransform(headerChild);
                                        }
                                    }
                                } else if (scheduleChild.tagName == "H2") {
                                    try { tags.push("<div class='level2' title='level2'>" + scheduleChild.outerHTML + "</div>"); } catch (e) { }
                                } else if (Array.from(scheduleChild.classList).includes("ProvisionList") && scheduleChild.tagName != 'UL') {
                                    const footNoteElements = scheduleChild.querySelectorAll(".Footnote > .Footnote");
                                    if (footNoteElements.length == 1) {
                                        try { tags.push("<div class='level3' title='footnote'>" + footNoteElements[0].outerHTML + "</div>"); } catch (e) { }
                                    }
                                } else {
                                    AddTransform(scheduleChild);
                                }
                            }
                        }
                    } else if ((h2MultiTags == false && previousTagName == "H2" && sectionChild.tagName == "P") || (h2MultiTags == false && previousPreviousTagName == "H2" && previousTagName == "H3" && sectionChild.tagName == "P") || (sectionChild.tagName == "H3")) {
                        if (sectionChild.textContent != "") {
                            try { tags.push("<div class='level3' title='level3'>" + sectionChild.outerHTML + "</div>"); } catch (e) { }
                        }
                    } else if (sectionChild.tagName == "H4") {
                        try { tags.push("<div class='level4' title='level4'>" + sectionChild.outerHTML + "</div>"); } catch (e) { }
                    } else {
                        AddTransform(sectionChild);
                    }
                    previousPreviousTagName = previousTagName;
                    previousTagName = sectionChild.tagName;
                    index++;
                }

                // contentSection2
                const contentSection2s = document.querySelectorAll(".ScheduleRP,.ScheduleNIF");
                for (const contentSection2 of contentSection2s) {
                    const contentSection2Childs = contentSection2.childNodes;
                    for (const contentSection2Child of contentSection2Childs) {
                        if (contentSection2Child.tagName == "H2") {
                            try { tags.push("<div class='level2' title='level2'>" + contentSection2Child.outerHTML + "</div>"); } catch (e) { }
                        } else {
                            AddTransform(contentSection2Child);
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
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "main", [".legisHeader", ".FCSelector", "#right-panel", ".wb-invisible", "dt div.DefinedTerm", ".mfp-hide", "#wb-dtmd", ".PITLink"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;