const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { originalHtmlPath, buildHtmlPath, originalTextPath, buildTextPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false
        });

        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.download(originalHtmlPath, page, url);

            // 2.Identify
            // 3.Collect
            await page.waitForSelector(".region-laurier-first");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process() {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }
                const elements = document.querySelectorAll(".region-laurier-first h1");
                try { tags.push("<div class='level1' title='level1'>" + elements[0].outerHTML + "</div>"); } catch (e) { }
                const issueDates = document.querySelectorAll("dd");
                try { tags.push("<div class='issue-date' title='issue-date'>" + issueDates[0].textContent + "T00:00:00</div>"); } catch (e) { }
                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

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
                // content between root and main iteration
                {
                    const pTransforms = Array.from(document.querySelectorAll(".region-laurier-first .field-item.even > *:not(section,ul)"));
                    try { tags.push("<div class='level2' title='level2'>" + pTransforms[0].outerHTML + "</div>"); } catch (e) { }
                    for (const pTransform of pTransforms.slice(1)) {
                        AddTransform(pTransform);
                    }
                }

                // content main iteration
                {
                    const elements = document.querySelectorAll(".region-laurier-first section")
                    for (const element of elements) {
                        const h2 = element.getElementsByTagName("H2")[0];
                        try { tags.push("<div class='level2' title='level2'>" + h2.outerHTML + "</div>"); } catch (e) { }
                        const innerElements = element.querySelectorAll("section > p, section > ul, section > ol");
                        for (const innerElement of innerElements) {
                            if (innerElement.tagName == "P") {
                                // handling main iteration P tags
                                if (innerElement.firstChild.tagName == "STRONG") {
                                    const result = innerElement.textContent.match("^\\d+.\\d+.");
                                    if (result == null) {
                                        AddTransform(innerElement);
                                    } else {
                                        const headingText = result[0];
                                        const paraText = innerElement.textContent.replace(headingText, '');
                                        try { tags.push("<div class='level3' title='level3'>" + headingText + "</div>", "<div>" + paraText + "</div>"); } catch (e) { }
                                    }
                                } else {
                                    AddTransform(innerElement);
                                }
                            } else if (innerElement.tagName == "OL") {
                                const listElements = innerElement.getElementsByTagName("LI");
                                var index = 0;
                                for (const listElement of listElements) {
                                    index++;
                                    try { tags.push("<div class='level3 created-index' title='level3'>" + index + ".</div>"); } catch (e) { }
                                    AddTransform(listElement);
                                }
                            } else {
                                // handling main iteration default transforms (non-P and non-OL tags for now)
                                AddTransform(innerElement);
                            }
                        }
                    }
                }
                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            });
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await base.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".region-laurier-first", [".list-unstyled.mrgn-lft-md"], "body", [".created-index"]);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;