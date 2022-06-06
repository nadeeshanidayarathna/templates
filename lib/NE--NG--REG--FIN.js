const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");
const test = require("../tests/NE--NG--REG-BASE.test");

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
                    const mainContentElement = mainContent.querySelectorAll(".wettekst")[0];
                    const mainBottomElements = mainContent.querySelectorAll(".wetsluiting,.bijlage:not(.article__header--law)");
                    Array.prototype.forEach.call(mainContent.querySelectorAll(".wettekst,.wetsluiting,.bijlage:not(.article__header--law)"), function (node) { node.remove(); });

                    try { tags.push("<div>" + mainContent.outerHTML + "</div>"); } catch (e) { }

                    const titleElements = mainContentElement.querySelectorAll(".titeldeel");
                    for (titleElement of titleElements) {
                        const titleHeading = titleElement.querySelectorAll(".article__header--law.titeldeel > h4")[0];
                        try { tags.push("<div class='level2' title='level2'>" + titleHeading.outerHTML + "</div>"); titleHeading.remove(); } catch (e) { }
                        const hoofdstukElements = titleElement.querySelectorAll(".hoofdstuk");
                        if (hoofdstukElements.length > 0) {
                            for (hoofdstukElement of hoofdstukElements) {
                                const hoofdstuk = hoofdstukElement.querySelectorAll(".article__header--law.article__header--law--chapter > h3")[0];
                                try { tags.push("<div class='level3' title='level3'>" + hoofdstuk.outerHTML + "</div>"); hoofdstuk.remove(); } catch (e) { }
                                const afdelings = hoofdstukElement.querySelectorAll(".afdeling");
                                if (afdelings.length > 0) {
                                    const hoofdstukChilds = hoofdstukElement.querySelectorAll(".hoofdstuk > .artikel:not(.article__header--law),.hoofdstuk > .afdeling");
                                    for (hoofdstukChild of hoofdstukChilds) {
                                        if (Array.from(hoofdstukChild.classList).includes("artikel")) {
                                            // handling .hoofdstuk > .artikel
                                            const articleElement = hoofdstukChild;
                                            const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                            try { tags.push("<div class='level4' title='level4'>" + article.outerHTML + "</div>"); article.remove(); } catch (e) { }
                                            AddTransform(articleElement);
                                        } else if (Array.from(hoofdstukChild.classList).includes("afdeling")) {
                                            // handling .hoofdstuk > .afdeling
                                            const afdeling = hoofdstukChild;
                                            const subHeading = afdeling.querySelectorAll(".article__header--law.afdeling > h4")[0];
                                            try { tags.push("<div class='level4' title='level4'>" + subHeading.outerHTML + "</div>"); subHeading.remove(); } catch (e) { }
                                            AddTransforms(afdeling.querySelectorAll(".article__header--law.afdeling > p"));
                                            const paragraafs = afdeling.querySelectorAll(".paragraaf");
                                            if (paragraafs.length > 0) {
                                                const afdelingChilds = afdeling.querySelectorAll(".afdeling > .artikel:not(.article__header--law),.afdeling > .paragraaf");
                                                for (afdelingChild of afdelingChilds) {
                                                    if (Array.from(afdelingChild.classList).includes("artikel")) {
                                                        // handling .afdeling > .artikel
                                                        const articleElement = afdelingChild;
                                                        const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                                        try { tags.push("<div class='level5' title='level5'>" + article.outerHTML + "</div>"); article.remove(); } catch (e) { }
                                                        AddTransform(articleElement);
                                                    } else if (Array.from(afdelingChild.classList).includes("paragraaf")) {
                                                        // handling .afdeling > .paragraaf
                                                        const paragraaf = afdelingChild;
                                                        const paraHeading = paragraaf.querySelectorAll(".article__header--law.paragraaf > h4")[0];
                                                        try { tags.push("<div class='level5' title='level5'>" + paraHeading.outerHTML + "</div>"); paraHeading.remove(); } catch (e) { }
                                                        AddTransforms(paragraaf.querySelectorAll(".article__header--law.paragraaf > p"));
                                                        const subparagraafs = paragraaf.querySelectorAll(".sub-paragraaf");
                                                        if (subparagraafs.length > 0) {
                                                            for (subparagraaf of subparagraafs) {
                                                                const subParaHeading = subparagraaf.querySelectorAll(".article__header--law.sub-paragraaf > h4")[0];
                                                                try { tags.push("<div class='level6' title='level6'>" + subParaHeading.outerHTML + "</div>"); subParaHeading.remove(); } catch (e) { }
                                                                const articleElements = subparagraaf.querySelectorAll(".artikel:not(.article__header--law)");
                                                                for (articleElement of articleElements) {
                                                                    const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                                                    try { tags.push("<div class='level7' title='level7'>" + article.outerHTML + "</div>"); article.remove(); } catch (e) { }
                                                                    AddTransform(articleElement);
                                                                }
                                                            }
                                                        } else {
                                                            const articleElements = paragraaf.querySelectorAll(".artikel:not(.article__header--law)");
                                                            if (articleElements.length > 0) {
                                                                for (articleElement of articleElements) {
                                                                    const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                                                    try { tags.push("<div class='level6' title='level6'>" + article.outerHTML + "</div>"); article.remove(); } catch (e) { }
                                                                    AddTransform(articleElement);
                                                                }
                                                            } else {
                                                                AddTransform(paragraaf);
                                                            }
                                                        }
                                                    }
                                                }
                                            } else {
                                                AddTransforms(afdeling.querySelectorAll(".article__header--law.afdeling > p"));
                                                const articleElements = afdeling.querySelectorAll(".artikel:not(.article__header--law)");
                                                for (articleElement of articleElements) {
                                                    const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                                    try { tags.push("<div class='level5' title='level5'>" + article.outerHTML + "</div>"); article.remove(); } catch (e) { }
                                                    AddTransform(articleElement);
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    const articleElements = hoofdstukElement.querySelectorAll(".artikel:not(.article__header--law)");
                                    for (articleElement of articleElements) {
                                        const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                        try { tags.push("<div class='level4' title='level4'>" + article.outerHTML + "</div>"); article.remove(); } catch (e) { }
                                        AddTransform(articleElement);
                                    }
                                }
                            }
                        } else {
                            const articleElements = titleElement.querySelectorAll(".artikel:not(.article__header--law)");
                            for (articleElement of articleElements) {
                                const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                try { tags.push("<div class='level3' title='level3'>" + article.outerHTML + "</div>"); article.remove(); } catch (e) { }
                                AddTransform(articleElement);
                            }
                        }
                    }

                    for (mainBottomElement of mainBottomElements) {
                        AddTransform(mainBottomElement);
                    }
                }
                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#regeling", [".visually-hidden", ".action--relations,.action--permalink,.action--version,.action--compare,.action--print,.action--download", "br"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;