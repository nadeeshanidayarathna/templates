const { group } = require("yargs");
const base = require("../../../common/base");
const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false,
            ignoreHTTPSErrors: true
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path);
            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                var images = document.querySelectorAll("img");
                images.forEach(e => {
                    var contentType = e.src.replace(/(.*\.)((png|jpg|jpeg|gif))$/, "$2");
                    var canvas = document.createElement("canvas");
                    canvas.width = e.width;
                    canvas.height = e.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(e, 0, 0);
                    var dataURL = canvas.toDataURL("image/" + contentType);
                    e.src = dataURL.replace("image/png", "image/" + contentType);
                })

                const rootTitle = "LRS 430.0 Sources of Profit";
                wrapElementLevel1(document, rootTitle);

                const metadataAll = document.querySelectorAll(".MsoNormal");
                for (const DateElement of metadataAll) {
                    if (DateElement.outerText.trim().startsWith('Dated')) {
                        let fullText = DateElement.outerText;
                        let check = (fullText.indexOf(" ") + 1)
                        let part2 = fullText.substring(check, fullText.length);
                        const dateFormat = (new Date(part2).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                    }
                }

                // ################
                // # content:info #
                // ################
                const content = document.querySelector("#MainContent_pnlHtmlControls");
                wrapElement(document, content, "ease-content");

                const level2Elements = document.querySelectorAll(".AS");
                for(const level2Element of level2Elements){
                    if(level2Element.textContent.startsWith("Schedule")){
                        wrapElement(document, level2Element, "level2");
                    }
                }

                const section5Elements = document.querySelectorAll(".Section5 > .MsoNormal > b > span");
                for(const element of section5Elements){
                    if(element.textContent.startsWith("LRF_430_0")){
                        wrapElement(document, element, "level2");
                    }
                    else if(element.textContent.startsWith("Explanatory notes") || element.textContent.startsWith("Instructions for specific items")){
                        wrapElement(document, element, "level3");
                    }
                    else if(element.textContent.startsWith("Section")){
                        wrapElement(document, element, "level4");
                    }
                }

                const section3Elements = document.querySelectorAll(".Section3 > .MsoNormal");
                for(const element of section3Elements){
                    if(element.childElementCount >= 1 && element.firstChild.nodeName == "B" && element.firstChild.firstChild.nodeName == "SPAN"){
                        wrapElement(document, element, "level3");
                    }
                }

                const section3ElementsType1 = document.querySelectorAll(".Section3 > h1");
                for(const  element of section3ElementsType1){
                    if(element.textContent.startsWith("Variations")){
                        wrapElement(document, element, "level3");
                    }
                }

                const section3ElementType2 = document.querySelector(".Section3 > .MsoBodyText2 > b");
                wrapElement(document, section3ElementType2, "level3");

                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(document.querySelectorAll(".Section3 img, .Section1 img"), function (node) { node.remove(); });

                return Promise.resolve();
            });
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