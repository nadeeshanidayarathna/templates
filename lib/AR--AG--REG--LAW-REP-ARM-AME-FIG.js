const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");
const test = require("../tests/common/base.test");

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
            await page.waitForSelector(".content");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }

                // TODO:
                const elements = document.querySelectorAll(".content>center")[0];
                try { tags.push("<div class='level1' title='level1'>" + elements.outerHTML + "</div>"); } catch (e) { }

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
                const nxtElement = document.querySelectorAll(".content>center")[1];
                try { tags.push("<div class='level2' title='level2'>" + nxtElement.outerHTML + "</div>"); } catch (e) { }

                // TODO:
                const elementsContents = document.querySelectorAll(".content");
                    for(const elementsContent of elementsContents){
                        const adoptDate = (elementsContent.childNodes)[13];
                        AddTransform(adoptDate);
                        const divChilds = (elementsContent.childNodes)[15];
                        
                        for(const child of divChilds.childNodes){
                            if(child.tagName == "B"){
                                try { tags.push("<div class='level3' title='level3'>" + child.outerHTML + "</div>"); } catch (e) { }
                            } else if(child.tagName == "CENTER") {
                                if(!child.textContent.startsWith("ԳԼՈՒԽ")){
                                    try { tags.push("<div class='level4' title='level4'>" + child.outerHTML + "</div>"); } catch (e) { }
                                } else {
                                    try { tags.push("<div class='level5' title='level5'>" + child.outerHTML + "</div>"); } catch (e) { }
                                }
                                
                            } else if(child.tagName == "P"){
                                for(const pelements of child.childNodes){                                   
                                    if(pelements.tagName == "I" && pelements.textContent.startsWith("Հոդված")){
                                        try { tags.push("<div class='level6' title='level6'>" + child.outerHTML + "</div>"); } catch (e) { }
                                    } else if(pelements.tagName == "I" && pelements.textContent.includes("Հոդված 13")) {
                                        try { tags.push("<div class='level6' title='level6'>" + child.outerHTML + "</div>"); } catch (e) { }
                                    } else if(pelements.textContent.includes("Հոդված 14")){
                                        console.log(pelements.outerText);
                                        try { tags.push("<div class='level6' title='level6'>" + pelements.outerText + "</div>"); } catch (e) { }
                                    } else {
                                        AddTransform(pelements);
                                    }
                                }
                            }
                            else {
                                AddTransform(child);
                            }
                            
                        }
                        const author = (elementsContent.childNodes)[19];
                        AddTransform(author);
                    }

                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".content", [".footer_options","div>i"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;