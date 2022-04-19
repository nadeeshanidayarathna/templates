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
            await page.waitForSelector("#viewLegSnippet");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }
                const elements = document.querySelectorAll('#pageTitle');
                try { tags.push("<div class='level1' title='level1'>" + elements[0].outerHTML + "</div>"); } catch (e) { }
                const issueDates = document.querySelectorAll('.LegDate:nth-of-type(1) .LegDateDate');
                const dateStr = issueDates[0].textContent.replaceAll("st", "").replaceAll("nd", "").replaceAll("rd", "").replaceAll("th", "");
                try { tags.push("<div class='issue-date' title='issue-date'>" + (new Date(dateStr).getFullYear()) + "-" + ("0" + (new Date(dateStr).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(dateStr).getDate())).slice(-2) + "T00:00:00</div>"); } catch (e) { }
                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
                Array.prototype.forEach.call(document.querySelectorAll(".LegExtentRestriction"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "/") { node.setAttribute("src", (new URL(url)).origin + src); } } });
                Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "/") { node.setAttribute("href", (new URL(url)).origin + href); } } });

                function AddTransform(node) {
                    if (node != undefined) {
                        try { tags.push("<div>" + ((node.nodeType == Node.TEXT_NODE) ? node.textContent : node.outerHTML) + "</div>"); } catch (e) { }
                    }
                }

                try { tags.push("<div class='content'>"); } catch (e) { }
                //content main iteration
                {
                    const elements = document.querySelectorAll('#viewLegSnippet > *');
                    {
                        for (const element of elements) {
                            if (element.className == 'LegClearFix LegPrelims') {
                                const childs = element.childNodes;
                                for (const child of childs) {
                                    if (Array.prototype.indexOf.call(childs, child) == 2) {
                                        try { tags.push("<div class='level2' title='level2'>" + child.outerHTML + "</div>"); } catch (e) { }
                                    }
                                    else {
                                        AddTransform(child);
                                    }
                                }
                            }
                            else if (element.className == 'LegScheduleFirst' || element.className == 'LegExpNoteTitle') {
                                try { tags.push("<div class='level2' title='level2'>" + element.outerHTML + "</div>"); } catch (e) { }
                            }
                            else if (element.className == 'LegPartFirst' || element.className == 'LegPart' || element.className == 'LegScheduleFirst' || element.className == 'LegSchedule') {
                                try { tags.push("<div class='level3' title='level3'>" + element.outerHTML + "</div>"); } catch (e) { }
                            }
                            else if (element.tagName.toUpperCase() == "H3" || element.tagName.toUpperCase() == "H4") {
                                try { tags.push("<div class='level4' title='level4'>" + element.outerHTML + "</div>"); } catch (e) { }
                            }
                            else {
                                const footNotes = element.querySelectorAll(".LegCommentaryItem");
                                for (footNote of footNotes) {
                                    try { tags.push("<div class='footnote' title='footnote'>" + footNote.outerHTML + "</div>"); footNote.remove(); } catch (e) { }
                                }
                                AddTransform(element);
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
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#pageTitle,#viewLegSnippet", ['.LegExtentRestriction'], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;