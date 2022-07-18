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
            await page.waitForSelector(".app_inner_pages_container");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }
                const rootTitle = document.querySelectorAll('.system_title');
                try { tags.push("<div class='level1' title='level1'>" + rootTitle[0].textContent + "</div>"); } catch (e) { }
                try { tags.push("<div class='issue-date' title='issue-date'>2004-03-04T00:00:00</div>"); } catch (e) { }
                try { tags.push("<div class='effective-date' title='effective-date'>2004-03-04T00:00:00</div>"); } catch (e) { }
                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
                Array.prototype.forEach.call(document.querySelectorAll(".article_item_popup, .article_btns, .browse_count"), function (node) { node.remove(); });
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

                const rootTransform = document.querySelectorAll('.system_details_box');
                AddTransform(rootTransform[0]);

                const elements = document.querySelectorAll('#divLawText > div');
                for (const element of elements[0].childNodes) {
                    if (element.tagName == 'H4' && element.className == 'center') {
                        try { tags.push("<div class='level3' title='level3'>" + element.outerHTML + "</div>"); } catch (e) { }
                    } else if (element.tagName == 'H3' && element.className == 'center' && element.textContent.startsWith('الفصل')) {
                        try { tags.push("<div class='level3' title='level3'>" + element.outerHTML + "</div>"); } catch (e) { }
                    } else if (element.tagName == 'DIV' && (element.className == 'article_item no_alternate changed-article' || element.className == 'article_item no_alternate ')) {
                        for (const childs of element.childNodes) {
                            if (childs.tagName == 'H3' && childs.className == 'center') {
                                try { tags.push("<div class='level4' title='level4'>" + childs.outerHTML + "</div>"); } catch (e) { }
                            } else if (childs.tagName == 'DIV') {
                                plainText = childs.innerHTML.replace(/<br>/g , '<p>');
                                try { tags.push("<div>" + plainText + "</div>"); } catch (e) { }
                            }
                        }
                    } else if (element.tagName == 'H3' && element.className == 'center' && element.textContent.startsWith('نظام')) {
                        try { tags.push("<div class='level2' title='level2'>" + element.outerHTML + element.nextElementSibling.outerHTML + "</div>"); } catch (e) { }
                    } else if (element.tagName == 'DIV' && element.childNodes[1].className == 'system_title') {
                        try { tags.push("<div class='level2' title='level2'>" + element.outerHTML + "</div>"); } catch (e) { }
                    } else if (element.previousElementSibling != undefined) {
                        if (!(element.previousElementSibling.tagName == 'H3' && element.previousElementSibling.textContent.startsWith('نظام'))){
                            if(element.tagName == 'P' || element.tagName == 'DIV') {
                                plainText = element.innerHTML.replace(/<br>/g , '<p>');
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
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, ".app_inner_pages_container", [".article_item_popup",".article_btns",".browse_count",".system_terms_title",".system_terms_tools","#divReportIssueContainer","#divAddReportIssueSuccess","#divAAddVisitorFavoriteSuccess","#divPrevVersionsContainer"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;