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
            url = await base.download(id, originalHtmlPath, metadataPath, page, url);

            // 2.Identify
            // 3.Collect
            await page.waitForSelector("#divTextoPrincipal>table>tbody");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }

                // TODO:
                const elements = document.querySelectorAll("#divTextoPrincipal>table>tbody>tr")[0];
                try { tags.push("<div class='level1' title='level1'>" + elements.outerText + "</div>"); } catch (e) { }
                try { tags.push("<div class='issue-date' title='issue-date'>" + "2021-09-30" +"T00:00:00</div>"); } catch (e) { }

                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags

                Array.prototype.forEach.call(document.querySelectorAll(".text"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "/") { node.setAttribute("src", (new URL(url)).origin + src); } } });
                Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "n") { node.setAttribute("href", /\S*Normas\//.exec(new URL(url).href) + href); } } });

                function AddTransform(node) {
                    if (node != undefined) {
                        try { tags.push("<div>" + ((node.nodeType == Node.TEXT_NODE) ? node.textContent : node.outerHTML) + "</div>"); } catch (e) { }
                    } else if(node == undefined){
                        try { tags.push("<div>" + node + "</div>"); } catch (e) { }
                    }
                }
                function AddTransforms(nodes) {
                    for (node of nodes) {
                        AddTransform(node);
                    }
                }

                try { tags.push("<div class='ease-content'>"); } catch (e) { }

                const elementContents = document.querySelectorAll(".style1")[0].childNodes[1].childNodes[1].childNodes;
                var fullText;
                var part1;
                var part2;
                var check;
                for(const elementContent of elementContents){
                    if(elementContent.tagName == "P"){
                        if(elementContent.tagName == "P" && elementContent.style.cssText == "text-align: center;" && elementContent.innerText.includes("CODIGO")){
                            try { tags.push("<div class='level2' title='level2'>" + elementContent.outerHTML + "</div>"); } catch (e) { }
                         }
                         else if(elementContent.tagName == "P" && elementContent.style.cssText == "text-align: center;" && elementContent.innerText.includes("TITULO")){
                            try { tags.push("<div class='level3' title='level3'>" + elementContent.outerHTML + "</div>"); } catch (e) { }
                         }
                        else if(elementContent.tagName == "P" && elementContent.style.cssText == "text-align: center;" && elementContent.innerText.includes("CAPITULO")){
                            try { tags.push("<div class='level4' title='level4'>" + elementContent.outerHTML + "</div>"); } catch (e) { }
                        } else if(elementContent.style.cssText == "text-align: justify;" && elementContent.textContent.startsWith("ARTÍCULO")){
                            fullText = elementContent.textContent;
                                check = (fullText.indexOf("-") + 1)
                                part1 = fullText.substring(0, check);
                                part2 = fullText.substring(check, fullText.length);
                                try { tags.push("<div class='level5' title='level5'>" + part1 + "</div>"); } catch (e) { };
                                try { tags.push("<div>" + part2 + "</div>"); } catch (e) { }
                        }                      
                        else {
                            AddTransform(elementContent)
                        }
                    } else if(elementContent.tagName == "SPAN"){
                        for(const child of elementContent.childNodes){
                            if(child.tagName == "P" && child.style.cssText == "text-align: center;" && child.innerText.includes("LIBRO")){
                                try { tags.push("<div class='level2' title='level2'>" + child.outerHTML + "</div>"); } catch (e) { }
                            } else if(child.tagName == "P" && child.style.cssText == "text-align: center;" && child.innerText.includes("TITULO")){
                                try { tags.push("<div class='level3' title='level3'>" + child.outerHTML + "</div>"); } catch (e) { }
                            } else if(child.tagName == "P" && child.style.cssText == "text-align: center;" && child.firstChild.nodeName != "STRONG" && child.firstChild.textContent.includes("CAPITULO")){
                                try { tags.push("<div class='level4' title='level4'>" + child.outerHTML + "</div>"); } catch (e) { }
                            } else if(child.tagName == "DIV"){
                                for(const divChild of child.childNodes){
                                    if(divChild.tagName == "P" && divChild.align == "center" && divChild.innerText.includes("LIBRO")){
                                        try { tags.push("<div class='level2' title='level2'>" + divChild.outerHTML + "</div>"); } catch (e) { }
                                    } else if(divChild.tagName == "P" && divChild.align == "center" && divChild.innerText.includes("TITULO")){
                                        try { tags.push("<div class='level3' title='level3'>" + divChild.outerHTML + "</div>"); } catch (e) { }
                                    } else if(divChild.tagName == "P" && divChild.align == "center" && divChild.innerText.includes("CAPITULO")){
                                        try { tags.push("<div class='level4' title='level4'>" + divChild.outerHTML + "</div>"); } catch (e) { }
                                    } else if(divChild.tagName == "P" && (divChild.align != "center" || divChild.align == "justify") && (divChild.textContent.startsWith("ARTÍCULO") || divChild.textContent.startsWith("Artículo") || divChild.innerText.includes == "Artículo 218")){
                                            fullText = divChild.textContent;
                                            if(fullText.includes("-")){

                                                check = (fullText.indexOf("-") + 1)
                                                part1 = fullText.substring(0, check);
                                                part2 = fullText.substring(check, fullText.length);
                                                
                                                try { tags.push("<div class='level5' title='level5'>" + part1 + "</div>"); } catch (e) { }
                                                try { tags.push("<i>" + part2 + "</i>"); } catch (e) { }
                                                
                                            } else{
                                                check = fullText.indexOf(".");
                                                part1 = fullText.substring(0, check);
                                                part2 = fullText.substring(check, fullText.length);
                                                try { tags.push("<div class='level5' title='level5'>" + part1 + "</div>"); } catch (e) { }
                                                try { tags.push("<div>" + part2 + "</div>"); } catch (e) { }
                                            } 
                                    } else {
                                        AddTransform(divChild);
                                    }
                                }

                            } else if(child.tagName == "P" && (child.style.cssText == "text-align: justify;" || child.style.cssText == "") && child.firstChild.nodeName != "STRONG" && (child.textContent.startsWith("ARTÍCULO") || child.firstChild.localName == "b")){
                                if(child.firstChild.localName == "b" && child.outerHTML.includes("Artículo")){
                                    fullText = child.outerText;
                                    if(fullText.includes("-")){
                                        check = (fullText.indexOf("-") + 1)
                                        part1 = fullText.substring(0, check);
                                        part2 = fullText.substring(check, fullText.length);
    
                                        try { tags.push("<div class='level5' title='level5'>" + part1 + "</div>"); } catch (e) { }
                                        try { tags.push("<div>" + part2 + "</div>"); } catch (e) { }
                                    } else{
                                        check = fullText.indexOf(".");
                                        part1 = fullText.substring(0, check);
                                        part2 = fullText.substring(check, fullText.length);
    
                                        try { tags.push("<div class='level5' title='level5'>" + part1 + "</div>"); } catch (e) { }
                                        try { tags.push("<div>" + part2 + "</div>"); } catch (e) { }
                                    }

                                } else {
                                    fullText = child.textContent;
                                    if(fullText.includes("-")){
                                        check = (fullText.indexOf("-") + 1)
                                        part1 = fullText.substring(0, check);
                                        part2 = fullText.substring(check, fullText.length);
                                        try { tags.push("<div class='level5' title='level5'>" + part1 + "</div>"); } catch (e) { }
                                        try { tags.push("<div>" + part2 + "</div>"); } catch (e) { }
                                    } else{
                                        check = (fullText.indexOf(".") + 1);
                                        part1 = fullText.substring(0, check);
                                        part2 = fullText.substring(check, fullText.length);

                                        try { tags.push("<div class='level5' title='level5'>" + part1 + "</div>"); } catch (e) { }
                                        try { tags.push("<div>" + part2 + "</div>"); } catch (e) { }
                                    }
                                }

                            } else if(child.tagName == "P" && child.style.cssText != "text-align: center;" && child.firstChild.nodeName != "STRONG"){
                                AddTransform(child);
                            }
                            else{
                                AddTransform(child);
                            }
                        }
                    } else{
                        AddTransform(elementContent);
                    }
                }

                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#divTextoPrincipal", ["#divTextoPrincipal>title", "tr>td>a",".text"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;