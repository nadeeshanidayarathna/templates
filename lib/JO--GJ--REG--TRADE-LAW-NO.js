const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");
const test = require("../tests/base.test");

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

            const delayDownload = {
                waitUntil: "networkidle2",
                timeout: 0
            }
            url = await base.download(id, originalHtmlPath, metadataPath, page, url, delayDownload);

            await page.waitForSelector("#PageControllerID");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }

                // TODO:
                const elements = document.querySelectorAll("h3");
                try { tags.push("<div class='level1' title='level1'>" + elements[0].outerHTML + "</div>"); } catch (e) { }
                try { tags.push("<div class='issue-date' title='issue-date'>" + "1966-03-30" +"T00:00:00</div>"); } catch (e) { }
                try { tags.push("<div class='effective-date' title='effective-date'>"+"1966-03-30"+"T00:00:00</div>"); } catch (e) { }

                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

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

                const elementTags = document.querySelectorAll("h6");
                try { tags.push("<div>" + elementTags[0].outerText + "</div>"); } catch (e) { }

                const elementContent = document.querySelectorAll(".clicked-legislation-content-body")[0];
                for(const contentChilds of elementContent.childNodes){
                    if(contentChilds.tagName == "UL"){
                        for(const contentChild of contentChilds.childNodes){
                            if(contentChild.tagName == "LI"){
                                for(const articleChilds of contentChild.childNodes){
                                    if(articleChilds.className == "article-num"){
                                        for(const articleChild of articleChilds.childNodes){
                                            if(articleChild.nodeName == "STRONG"){
                                                try { tags.push("<div class='level2' title='level2'>" + articleChild.outerHTML + "</div>"); } catch (e) { }
                                            }
                                        }
                                    } else if(articleChilds.className == "article-content"){
                                        for(const articleChild of articleChilds.childNodes){
                                            if(articleChild.nodeName == "P"){
                                                const plainText = articleChild.innerHTML.replace(/<br>/g, '');
                                                try { tags.push("<div>" + plainText + "</div>"); } catch (e) { }
                                            }
                                        }
                                    }
                                }
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
      await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#LegislationLaw", ["#LegInfo", "#footer", "ul>li>p", "ul>li>a", ".col-md-4", "div>h4"], "body", ["#LegInfo"]);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;