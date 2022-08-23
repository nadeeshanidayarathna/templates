const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("../../../common/base");
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
            url = await base.download(id, originalHtmlPath, metadataPath, page, url);

            // 2.Identify
            // 3.Collect
            await page.waitForSelector(".main.oh");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }

                // TODO:
                const contentTittle = document.querySelectorAll(".text-center.logo-text")[0];
                try { tags.push("<div class='level1' title='level1'>" + contentTittle.textContent+ "</div>"); } catch (e) { }
                try { tags.push("<div class='issue-date' title='issue-date'>" + "2015-07-06" +"T00:00:00</div>"); } catch (e) { }
                try { tags.push("<div class='effective-date' title='effective-date'>"+"2015-07-07"+"T00:00:00</div>"); } catch (e) { }

                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
                Array.prototype.forEach.call(document.querySelectorAll(".footer-bottom"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".custom-share"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".copyright"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".pdfButton.btn.btn-primary.btn-sm"), function (node) { node.remove(); });
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

                const elements = document.querySelectorAll(".single-ta3n")[0];
                var nextLevel = 5;
                var plainText;
                for(const element of elements.childNodes){
                    if(element.className == "ta3n-number"){
                        try { tags.push("<div class='level2' title='level2'>" + element.outerHTML+ "</div>"); } catch (e) { }
                    } else if(element.className == "single_content"){
                        plainText = element.innerHTML.replace(/<br>/g, '<p>');
                        try { tags.push("<div>" + plainText + "</div>"); } catch (e) { }
                    } else if(element.className == "single_content single_content_center single_content_html"){
                        for(const childs of element.childNodes){
                            if(childs.nodeName == "SMALL"){
                                try { tags.push("<div class='level3' title='level3'>" + childs.outerHTML+ "</div>"); } catch (e) { }
                            } else if(childs.className == "not_online"){
                                for(const child of childs.childNodes){
                                    if(child.className == "judgment_text"){
                                        for(const contentChild of child.childNodes){
                                            if(contentChild.align == "center" && contentChild.nodeName == "P" && contentChild.textContent.includes("لقانون")){
                                                try { tags.push("<div class='level4' title='level4'>" + contentChild.outerHTML+ "</div>");} catch (e) { }
                                            } else if(contentChild.align == "center" && contentChild.nodeName == "P" && contentChild.textContent.includes("الباب")){
                                                for(const insideChilds of contentChild.childNodes){
                                                    for(const insideChild of insideChilds.childNodes){
                                                        if(insideChild.tagName = "FONT" && (!insideChild.textContent.includes("المادة") && insideChild.textContent.includes("الباب"))){
                                                            try { tags.push("<div class='level5' title='level5'>" + insideChild.textContent +"<br>"+insideChild.nextSibling.nextSibling.textContent+ "</div>"); nextLevel = 6} catch (e) { }
                                                        } else if(insideChild.textContent.includes("المادة") && (!insideChild.textContent.includes("اللائحة"))){
                                                            try { tags.push("<div class='level" + nextLevel + "' title='level" + nextLevel + "'>" + insideChild.textContent + "</div>"); } catch (e) { }
                                                        } else if(insideChild.textContent.includes("الفصل")){
                                                            if(insideChild.nextSibling.nextSibling.textContent.includes("الإعفاء")){
                                                                try { tags.push("<div class='level6' title='level6'>" +insideChild.nextSibling.nextSibling.textContent+ "</div>"); nextLevel = 7} catch (e) { }
                                                            } else {
                                                                try { tags.push("<div class='level6' title='level6'>" + insideChild.textContent +"<br>"+insideChild.nextSibling.nextSibling.textContent+ "</div>"); nextLevel = 7} catch (e) { }
                                                            }                                                            
                                                        }
                                                    }
                                                }
                                            } else if(contentChild.align == "center" && contentChild.nodeName == "P" && contentChild.textContent.includes("الثانى")){
                                                for(const subjectChilds of contentChild.childNodes){
                                                    for(const subjectChild of subjectChilds.childNodes){
                                                        if(subjectChild.tagName = "FONT" && (!subjectChild.textContent.includes("المادة") && subjectChild.textContent.includes("الثانى"))){
                                                            try { tags.push("<div class='level6' title='level6'>" + subjectChild.textContent +"<br>"+subjectChild.nextSibling.nextSibling.textContent+ "</div>"); nextLevel = 7} catch (e) { }
                                                        }
                                                        else if(subjectChild.textContent.includes("المادة") ){
                                                            try { tags.push("<div class='level" + nextLevel + "' title='level" + nextLevel + "'>" + subjectChild.textContent + "</div>"); } catch (e) { }
                                                        }
                                                    }
                                                }
                                            } else if(contentChild.align == "center" && contentChild.nodeName == "P" && contentChild.textContent.includes("المادة")){
                                                try { tags.push("<div class='level" + nextLevel + "' title='level" + nextLevel + "'>" + contentChild.textContent + "</div>"); } catch (e) { }
                                            }
                                             else if(contentChild.nodeName == "P" || contentChild.nodeName == "DIV"){

                                                if(contentChild.innerHTML.includes('<b>')){
                                                    plainText = contentChild.innerHTML.replace(/<br>/g, '<p>');
                                                    const newplainText = plainText.replace(/<\/b>/g, '</b><p>');
                                                    try { tags.push("<div>" + newplainText + "</div>"); } catch (e) { }
                                                } else {
                                                    plainText = contentChild.innerHTML.replace(/<br>/g, '<p>');
                                                    try { tags.push("<div>" + plainText + "</div>"); } catch (e) { }
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                // AddTransform(childs);
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
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".main.oh", [".custom-share", "#navbar", "#search-wrap", ".pdfButton.btn.btn-primary.btn-sm", ".footer-bottom"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;