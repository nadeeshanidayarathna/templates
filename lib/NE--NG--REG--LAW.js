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
            await page.waitForSelector("#regeling");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }
                {
                    const rootHeading = document.querySelectorAll("#regeling > h1")[0];
                    try { tags.push("<div class='level1' title='level1'>" + rootHeading.outerHTML + "</div>"); rootHeading.remove(); } catch (e) { }
                    const issueDate = document.querySelectorAll(".article__header--law.article__header--main > p")[0];

                    for (child of issueDate.childNodes) {
                        if (child.textContent.indexOf("Geldend") != -1) {
                            const issueDateStr = child.textContent.substring(12, 22);
                            try { tags.push("<div class='issue-date' title='issue-date'>" + issueDateStr.split("-")[2] + "-" + issueDateStr.split("-")[1] + "-" + issueDateStr.split("-")[0] + "T00:00:00</div>"); } catch (e) { }
                            break;
                        }
                    }
                    try { tags.push("<br>"); } catch (e) { }
                }
                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################
                try { tags.push("<div class='content'>"); } catch (e) { }
                {
                    function AddTransform(node) {
                        if (node != undefined) {
                            try { tags.push("<div>" + ((node.nodeType == Node.TEXT_NODE) ? node.textContent : node.outerHTML) + "</div>"); node.remove() } catch (e) { }
                        }
                    }
                    function AddTransforms(nodes) {
                        for (node of nodes) {
                            AddTransform(node);
                        }
                    }
                    // remove hidden & unwanted elements + correcting links for img and a tags
                    Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "/") { node.setAttribute("src", (new URL(url)).origin + src); } } });
                    Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "/") { node.setAttribute("href", (new URL(url)).origin + href); } } });
                    Array.prototype.forEach.call(document.querySelectorAll(".visually-hidden"), function (node) { node.remove(); });
                    Array.prototype.forEach.call(document.querySelectorAll(".action--relations,.action--permalink,.action--version,.action--compare,.action--print,.action--download"), function (node) { node.remove(); });
                    Array.prototype.forEach.call(document.querySelectorAll("br"), function (node) { node.remove(); });

                    const rootTransforms = document.querySelectorAll(".article__header--law.article__header--main > p");
                    for (rootTransform of rootTransforms) {
                        // removing daily changing date for monitoring
                        const rootChilds = rootTransform.childNodes
                        for (rootChild of rootChilds) {
                            if (rootChild.textContent.indexOf("Geraadpleegd op") != -1) {
                                rootChild.remove();
                            }
                        }
                        try { tags.push("<div>" + rootTransform.outerHTML + "</div>"); } catch (e) { rootTransform.remove() }
                    }

                    const mainContent = document.querySelectorAll(".wetgeving")[0];
                    const mainContentElement1 = mainContent.querySelectorAll(".wettekst")[0];
                    const mainContentElement2 = mainContent.querySelectorAll(".wetsluiting")[0];
                    Array.prototype.forEach.call(mainContent.querySelectorAll(".wettekst,.wetsluiting"), function (node) { node.remove(); });

                    try { tags.push("<div>" + mainContent.outerHTML + "</div>"); } catch (e) { }
                    const titleElements = mainContentElement1.querySelectorAll(".titeldeel");
                    for (titleElement of titleElements) {
                        const title = titleElement.querySelectorAll(".article__header--law.titeldeel")[0];
                        try { tags.push("<div class='level2' title='level2'>" + title.outerHTML + "</div>"); title.remove(); } catch (e) { }
                        const articleElements = titleElement.querySelectorAll(".artikel:not(.article__header--law)");
                        for (articleElement of articleElements) {
                            const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                            try { tags.push("<div class='level3' title='level3'>" + article.outerHTML + "</div>"); article.remove(); } catch (e) { }
                            AddTransform(articleElement);
                        }
                    }
                    AddTransform(mainContentElement2);
                }
                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await base.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#regeling", [".visually-hidden", ".action--relations,.action--permalink,.action--version,.action--compare,.action--print,.action--download", "br"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;