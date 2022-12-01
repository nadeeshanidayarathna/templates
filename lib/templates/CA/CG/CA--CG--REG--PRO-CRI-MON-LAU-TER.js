const base = require("../../../common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("main");
            await page.evaluate(function process(url) {
                // #############
                // # root:info #
                // #############
                console.log("The URL is "+url)
                const level1Element = document.querySelector('.Title-of-Act');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2002-05-09" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2019-10-11" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('main');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('.Part, span.scheduleLabel, .Subheading, figcaption, .sectionLabel');
                let nextLevel = 2;
                for (const element of elements) {
                    if (element.className == 'Part' || (element.tagName == 'SPAN' && element.className == 'scheduleLabel')) {
                        wrapElement(document, element, "level2");
                        nextLevel = 3;
                    } else if (element.className == 'Subheading' || element.tagName == 'FIGCAPTION') {
                        wrapElement(document, element, "level3");
                        nextLevel = 4;
                    } else if (element.className == 'sectionLabel') {
                        if (element.textContent.trim().match(/^\d+$/)) {
                            wrapElement(document, element, "level" + nextLevel);
                        }
                    }
                }

                const footnoteElement = document.querySelectorAll('main .order ul.ProvisionList li');
                wrapElements(document, footnoteElement, "footnote");

                const partAlter = document.querySelectorAll('.HLabel1');
                for (const element of partAlter) {
                    element.outerHTML = element.outerHTML.replace(element.innerHTML, "<p>" + element.innerHTML + "</p>");
                }

                const bulletText = document.querySelectorAll('main ul.HistoricalNote');
                for (const elements of bulletText) {
                    let i = 0;
                    for (const element of elements.childNodes) {
                        if (element.tagName == 'LI' && i == (elements.childNodes.length-1)) {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.outerHTML, "<span>" + texts + ". </span>");
                        } else if (element.tagName == 'LI' && i < (elements.childNodes.length-1)) {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.outerHTML, "<span>" + texts + "; </span>");
                        }i++;
                    }
                }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".legisHeader, .FCSelector, #right-panel, .PITLink, .wb-invisible, .mfp-hide"), function (node) { node.remove(); });
                // Array.prototype.forEach.call(document.querySelectorAll("main ul.HistoricalNote a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "/") { node.setAttribute("href", (new URL(url)).origin + href); } } });
                return Promise.resolve();
            }, url);
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, false);
            await page.close();
        }
        await base.test().runPageTest(browser, url, sp, path);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;