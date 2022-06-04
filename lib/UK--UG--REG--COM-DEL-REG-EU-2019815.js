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
            await page.waitForSelector(".handbook-content");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }

                try { tags.push("<div class='level1' title='level1'></div>"); } catch (e) { }
                const elements = document.querySelectorAll(".breadcrumbs")[0].querySelectorAll("li")[3];
                try { tags.push("<div class='level1 created-index' title='level1'>" + elements.outerText + "</div>"); } catch (e) { }


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

                try { tags.push("<div class='content'>"); } catch (e) { }
                {
                    const elementsContents = document.querySelectorAll(".full-chapter");
                    
                    for(const elementsContent of elementsContents){
                        for(const childs of elementsContent.children){
                            
                            for(const child of childs.children){
                                
                                for(const chlidNesteds1 of child.children){

                                    if(chlidNesteds1.localName == "header" && chlidNesteds1.nextElementSibling.localName == "p"){
                                        try { tags.push("<div class='level2' title='level2'>" + chlidNesteds1.outerHTML + "</div>"); } catch (e) { }
                                    } else if(chlidNesteds1.localName == "p"){
                                        try { tags.push("<div class='level3' title='level3'>" + chlidNesteds1.outerHTML + "</div>"); } catch (e) { }
                                    } else if(chlidNesteds1.localName == "header" && chlidNesteds1.nextElementSibling.localName != "p"){
                                        try { tags.push("<div class='level4' title='level4'>" + chlidNesteds1.outerHTML + "</div>"); } catch (e) { }
                                    } else{
                                        AddTransform(chlidNesteds1);
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

        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".handbook-content", [], "body", [".created-index"]);

        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;