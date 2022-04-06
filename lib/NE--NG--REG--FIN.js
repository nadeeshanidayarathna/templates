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
                try { tags.push("<span class='root'>"); } catch (e) { }
                {
                    const rootHeading = document.querySelectorAll("#regeling > h1")[0];
                    try { tags.push("<span class='level1' title='level1'>" + rootHeading.innerHTML + "</span>", "<br>"); rootHeading.remove(); } catch (e) { }
                    const issueDate = document.querySelectorAll(".article__header--law.article__header--main > p")[0];

                    for (child of issueDate.childNodes) {
                        if (child.textContent.indexOf("Geldend") != -1) {
                            const issueDateStr = child.textContent.substring(12, 22);
                            try { tags.push("<span class='issue-date' title='issue-date'>" + issueDateStr.split("-")[2] + "-" + issueDateStr.split("-")[1] + "-" + issueDateStr.split("-")[0] + "T00:00:00</span>"); } catch (e) { }
                            break;
                        }
                    }
                    try { tags.push("<br>"); } catch (e) { }
                }
                try { tags.push("</span>"); } catch (e) { }

                // ################
                // # main:content #
                // ################
                try { tags.push("<span class='content'>"); } catch (e) { }
                {
                    function AddTransform(node) {
                        if (node != undefined) {
                            try { tags.push("<span>" + ((node.nodeType == Node.TEXT_NODE) ? node.textContent : node.innerHTML) + "</span>", "<br>"); node.remove() } catch (e) { }
                        }
                    }
                    // remove hidden & unwanted elements + correcting links for img and a tags
                    Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "/") { node.setAttribute("src", (new URL(url)).origin + src); } } });
                    Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "/") { node.setAttribute("href", (new URL(url)).origin + href); } } });
                    Array.prototype.forEach.call(document.querySelectorAll(".visually-hidden"), function (node) { node.remove(); });
                    Array.prototype.forEach.call(document.querySelectorAll(".action--relations,.action--permalink,.action--version,.action--compare,.action--print,.action--download"), function (node) { node.remove(); });
                    Array.prototype.forEach.call(document.querySelectorAll("br"), function (node) { node.remove(); });

                    const rootTransforms = document.querySelectorAll(".article__header--law.article__header--main > p");
                    for (rootTransform of rootTransforms) {
                        try { tags.push("<span>" + rootTransform.innerHTML + "</span>", "<br>"); } catch (e) { rootTransform.remove() }
                    }

                    const mainContent = document.querySelectorAll(".wetgeving")[0];
                    const mainContentElement = mainContent.querySelectorAll(".wettekst")[0];
                    const mainBottomElements = mainContent.querySelectorAll(".wetsluiting,.bijlage:not(.article__header--law)");
                    Array.prototype.forEach.call(mainContent.querySelectorAll(".wettekst,.wetsluiting,.bijlage:not(.article__header--law)"), function (node) { node.remove(); });

                    try { tags.push("<span>" + mainContent.innerHTML + "</span>", "<br>"); } catch (e) { }

                    const titleElements = mainContentElement.querySelectorAll(".titeldeel");
                    for (titleElement of titleElements) {
                        const titleHeading = titleElement.querySelectorAll(".article__header--law.titeldeel > h4")[0];
                        try { tags.push("<span class='level2' title='level2'>" + titleHeading.innerHTML + "</span>", "<br>"); titleHeading.remove(); } catch (e) { }
                        const hoofdstukElements = titleElement.querySelectorAll(".hoofdstuk");
                        if (hoofdstukElements.length > 0) {
                            for (hoofdstukElement of hoofdstukElements) {
                                const hoofdstuk = hoofdstukElement.querySelectorAll(".article__header--law.article__header--law--chapter > h3")[0];
                                try { tags.push("<span class='level3' title='level3'>" + hoofdstuk.innerHTML + "</span>", "<br>"); hoofdstuk.remove(); } catch (e) { }
                                const afdelings = hoofdstukElement.querySelectorAll(".afdeling");
                                if (afdelings.length > 0) {
                                    for (afdeling of afdelings) {
                                        const subHeading = afdeling.querySelectorAll(".article__header--law.afdeling > h4")[0];
                                        try { tags.push("<span class='level4' title='level4'>" + subHeading.innerHTML + "</span>", "<br>"); subHeading.remove(); } catch (e) { }
                                        const paragraafs = afdeling.querySelectorAll(".paragraaf");
                                        if (paragraafs.length > 0) {
                                            for (paragraaf of paragraafs) {
                                                const paraHeading = paragraaf.querySelectorAll(".article__header--law.paragraaf > h4")[0];
                                                try { tags.push("<span class='level5' title='level5'>" + paraHeading.innerHTML + "</span>", "<br>"); paraHeading.remove(); } catch (e) { }
                                                const articleElements = paragraaf.querySelectorAll(".artikel:not(.article__header--law)");
                                                for (articleElement of articleElements) {
                                                    const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                                    try { tags.push("<span class='level6' title='level6'>" + article.innerHTML + "</span>", "<br>"); article.remove(); } catch (e) { }
                                                    AddTransform(articleElement);
                                                }
                                            }
                                        } else {
                                            const articleElements = afdeling.querySelectorAll(".artikel:not(.article__header--law)");
                                            for (articleElement of articleElements) {
                                                const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                                try { tags.push("<span class='level5' title='level5'>" + article.innerHTML + "</span>", "<br>"); article.remove(); } catch (e) { }
                                                AddTransform(articleElement);
                                            }
                                        }
                                    }
                                } else {
                                    const articleElements = hoofdstukElement.querySelectorAll(".artikel:not(.article__header--law)");
                                    for (articleElement of articleElements) {
                                        const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                        try { tags.push("<span class='level4' title='level4'>" + article.innerHTML + "</span>", "<br>"); article.remove(); } catch (e) { }
                                        AddTransform(articleElement);
                                    }
                                }
                            }
                        } else {
                            const articleElements = titleElement.querySelectorAll(".artikel:not(.article__header--law)");
                            for (articleElement of articleElements) {
                                const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                try { tags.push("<span class='level3' title='level3'>" + article.innerHTML + "</span>", "<br>"); article.remove(); } catch (e) { }
                                AddTransform(articleElement);
                            }
                        }
                    }

                    for (mainBottomElement of mainBottomElements) {
                        AddTransform(mainBottomElement);
                    }
                }
                try { tags.push("</span>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;