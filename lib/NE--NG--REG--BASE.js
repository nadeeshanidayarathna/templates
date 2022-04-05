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
            var tags = await page.evaluate(function process() {
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
                        const issueDateStr = child.textContent.split(" op ")[1].replaceAll(".", "").trim();
                        try { tags.push("<span class='issue-date' title='issue-date'>" + issueDateStr.split("-")[2] + "-" + issueDateStr.split("-")[1] + "-" + issueDateStr.split("-")[0] + "T00:00:00</span>"); child.remove(); } catch (e) { }
                        break;
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
                    // remove hidden & unwanted elements
                    Array.prototype.forEach.call(document.querySelectorAll(".visually-hidden"), function (node) { node.remove(); });
                    Array.prototype.forEach.call(document.querySelectorAll(".action--relations,.action--permalink,.action--version,.action--compare,.action--print,.action--download"), function (node) { node.remove(); });
                    Array.prototype.forEach.call(document.querySelectorAll("br"), function (node) { node.remove(); });

                    const rootTransform1 = document.querySelectorAll(".article__header--law.article__header--main > p")[0];

                    for (child of rootTransform1.childNodes) {
                        try { tags.push("<span>" + child.textContent + "</span>", "<br>"); } catch (e) { }
                    }
                    const mainContent = document.querySelectorAll(".wetgeving")[0];
                    const mainContentElement1 = mainContent.querySelectorAll("#Opschrift")[0];
                    AddTransform(mainContentElement1);

                    const mainContentElement2 = mainContent.querySelectorAll(".wettekst")[0];
                    const mainContentElement3 = mainContent.querySelectorAll(".wetsluiting")[0];
                    Array.prototype.forEach.call(mainContent.querySelectorAll(".wettekst,.wetsluiting"), function (node) { node.remove(); });
                    try { tags.push("<span>" + mainContent.innerHTML + "</span>", "<br>"); } catch (e) { }

                    const subHeading = mainContentElement2.querySelectorAll(".article__header--law.boek")[0];
                    try { tags.push("<span class='level2' title='level2'>" + subHeading.innerHTML + "</span>", "<br>"); subHeading.remove(); } catch (e) { }

                    const titleElements = mainContentElement2.querySelectorAll(".titeldeel");
                    for (titleElement of titleElements) {
                        const titleHeading = titleElement.querySelectorAll(".article__header--law.titeldeel")[0];
                        try { tags.push("<span class='level3' title='level3'>" + titleHeading.innerHTML + "</span>", "<br>"); titleHeading.remove(); } catch (e) { }

                        const afdelingElements = titleElement.querySelectorAll(".afdeling");
                        if (afdelingElements.length > 0) {
                            for (afdelingElement of afdelingElements) {
                                const headingAfdeling = afdelingElement.querySelectorAll(".article__header--law.afdeling > h4")[0];
                                try { tags.push("<span class='level4' title='level4'>" + headingAfdeling.innerHTML + "</span>", "<br>"); headingAfdeling.remove(); } catch (e) { }

                                const articleElements = afdelingElement.querySelectorAll(".artikel:not(.article__header--law)");
                                for (articleElement of articleElements) {
                                    const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                    try { tags.push("<span class='level5' title='level5'>" + article.innerHTML + "</span>", "<br>"); article.remove(); } catch (e) { }
                                    AddTransform(articleElement);
                                }
                            }
                        } else {
                            const articleElements = titleElement.querySelectorAll(".artikel:not(.article__header--law)");
                            for (articleElement of articleElements) {
                                const article = articleElement.querySelectorAll(".article__header--law.artikel > h4")[0];
                                try { tags.push("<span class='level4' title='level4'>" + article.innerHTML + "</span>", "<br>"); article.remove(); } catch (e) { }
                                AddTransform(articleElement);
                            }
                        }
                    }
                    AddTransform(mainContentElement3);
                }
                try { tags.push("</span>"); } catch (e) { }

                return Promise.resolve(tags);
            });
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