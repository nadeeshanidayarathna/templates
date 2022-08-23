const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("../../../common/base");
const test = require("../../../../tests/common/base.test");

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
            await page.waitForSelector(".app_inner_pages_container");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }

                const elements = document.querySelectorAll(".system_title");
                try { tags.push("<div class='level1' title='level1'>" + elements[0].outerHTML + "</div>"); } catch (e) { }
                try { tags.push("<div class='issue-date' title='issue-date'>" + "2002-03-15" +"T00:00:00</div>"); } catch (e) { }
                try { tags.push("<div class='effective-date' title='effective-date'>"+"2002-03-15"+"T00:00:00</div>"); } catch (e) { }

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

                const detailbox = document.querySelectorAll(".system_details_box")[0];
                for(const detail of detailbox.childNodes){
                    if(detail.tagName == "DIV" && detail.className != "browse_count"){
                        const textPlain = detail.innerHTML.replace(/<br>/g, '<p>'); 
                        try { tags.push("<div>" + textPlain + "</div>"); } catch (e) { }
                    }
                }
                const systemTitle = document.querySelectorAll("h1.system_title.system_terms_title")[0];
                try { tags.push("<div class='level2' title='level2'>" + systemTitle.outerHTML+ "</div>"); } catch (e) { }
                const contentElements = document.querySelectorAll(".system_terms_textbox")[0];
                for(const contentElement of contentElements.childNodes){
                    if(contentElement.nodeName == "DIV"){
                        for(const childElements of contentElement.childNodes){
                            if(childElements.nodeName == "H3"){
                                if(childElements.nextElementSibling.nodeName == "H3"){
                                    try { tags.push("<div class='level3' title='level3'>" + childElements.outerHTML+ childElements.nextElementSibling.outerHTML+ "</div>"); } catch (e) { }
                                } else if(childElements.nextElementSibling.nodeName != "P"){
                                    try { tags.push("<div class='level4' title='level4'>" + childElements.outerHTML+ "</div>"); } catch (e) { }
                                }
                            } else if(childElements.nodeName == "DIV" && childElements.className == ""){
                                try { tags.push("<div class='level3' title='level3'>" + childElements.outerHTML+ "</div>"); } catch (e) { }
                            }
                             else if(childElements.nodeName == "H4" && childElements.className == "center"){
                                try { tags.push("<div class='level4' title='level4'>" + childElements.outerHTML+ "</div>"); } catch (e) { }
                            } else if(childElements.className == "article_item no_alternate " && childElements.nodeName == "DIV"){
                                for(const childElement of childElements.childNodes){
                                    if(childElement.nodeName == "H3"){
                                        try { tags.push("<div class='level5' title='level5'>" + childElement.outerHTML + "</div>"); } catch (e) { }
                                    } else if(childElement.nodeName == "DIV"){
                                        const plainText = childElement.innerHTML.replace(/<br>/g, '<p>');
                                        try { tags.push("<div>" + plainText + "</div>"); } catch (e) { }
                                    }
                                }
                            } else if(childElements.nodeName == "DIV" || childElements.nodeName == "P"){
                                plainText = childElements.innerHTML.replace(/<br>/g, '<p>');
                                try { tags.push("<div>" + plainText + "</div>"); } catch (e) { }
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
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".app_inner_pages_container", ["footer","script", ".system_terms_tools",".fmenu", ".bottom_bar", "#divReportIssueContainer", "#divAddReportIssueSuccess", "#divPrevVersionsContainer", "#divAAddVisitorFavoriteSuccess", ".browse_count"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;