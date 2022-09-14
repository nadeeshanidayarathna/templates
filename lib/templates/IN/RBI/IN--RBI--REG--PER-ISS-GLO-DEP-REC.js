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
            await page.waitForSelector(".tablecontent2");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.tablebg tr:nth-of-type(2) b');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2000-01-20" + "T00:00:00");
                
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.tablecontent2');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll("p[align='JUSTIFY']");
                const regex = /(^\d\.\s)/i;
                for (const contentChild of level2Elements) {
                    if (contentChild.textContent.match(regex)) {
                        level2Text = contentChild.textContent.match(regex)[1];
                        contentChild.outerHTML = contentChild.outerHTML.replace(level2Text, "<div title=\"level2\" class=\"level2\">" + level2Text + "</div>");
                    }
                }
                
                //fixing ol items in the transform
                var asciiCode = 2170;
                const olItems1 = document.querySelectorAll("ol > ol[type='i']");
                for (const contentChildOl of olItems1) { //ol
                    const liItems = contentChildOl.children;
                    for (const contentChild of liItems) { //li   
                        if(contentChild.localName == "li") {
                            contentChild.outerHTML = "<div>" + String.fromCharCode("0x"+(asciiCode++)) + ". " + contentChild.outerHTML + "</div>";
                        }   
                    }
                    asciiCode = 2170;
                 }

                var letter1 = 97;
                const olItems2 = document.querySelectorAll("ol > ol[type='a']"); 
                for (const contentChild of olItems2) { //ol
                    if(contentChild.localName == "ol") {
                        contentChild.outerHTML = "<div>" + String.fromCharCode(letter1++) + ". " + contentChild.outerHTML + "</div>";
                    }      
                }

                var letter2 = 97;
                var olItems3 = Array.from(document.querySelectorAll("ol[type='a']"));
                olItems3 = olItems3.slice(4, olItems3.length); 
                for (const contentChildOl of olItems3) { //ol 
                    const liItems = contentChildOl.children;
                    for (const contentChild of liItems) { //li
                        if(contentChild.localName == "li") {
                            contentChild.outerHTML = "<div>" + String.fromCharCode(letter2++) + ". " + contentChild.outerHTML + "</div>";
                        }      
                    }
                    letter2 = 97;
                }
                
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelector(".tablebg tr:first-of-type .tableheader"), function (node) { node.remove(); });

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, true);
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