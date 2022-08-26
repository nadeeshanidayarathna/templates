const { group } = require("yargs");
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
            await page.waitForSelector(".act-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelectorAll('.act-content > table > tbody > tr')[4];
                wrapElement(document, level1Element, "level1");
                // wrapElementDate(document, "issue-date", "1953-03-24" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.act-content');
                wrapElement(document, contentElement, "ease-content");

                const elements = document.querySelectorAll('p');
                let levelNo = 3;
                for(const element of elements){
                    for(const childs of element.childNodes){
                        if(childs.nodeName == "BIG"){
                            wrapElement(document, childs, "level2");
                        } else if((childs.nodeName == "SMALL") && ((childs.parentElement.className == "shoulder-grey") || (childs.textContent.includes("Meaning of") && (childs.textContent.includes("."))))){
                            wrapElement(document, childs, "level" + levelNo);

                        } else if((childs.className == "smallcaps") && (childs.textContent.includes("Chapter"))){
                            wrapElement(document, childs, "level3");
                            levelNo = 4;
                        }
                    }
                }
                const level4Missing = document.querySelectorAll('p')[498].querySelectorAll('small');
                wrapElements(document, level4Missing, "level4", true);

                

                // const level2Elements = document.querySelectorAll('big');
                // for(const level2Element of level2Elements){
                //     if(level2Element.textContent.includes("PART")){
                //         wrapElement(document, level2Element, "level2");
                //     } else if(level2Element.textContent.includes("PART")){
                //         wrapElement(document, level2Element, "level4");
                //     }
                // }

                // const level3Elements = document.querySelectorAll('.smallcaps');
                // for(const level3Element of level3Elements){
                //     if(level3Element.textContent.includes("Chapter")){
                //         wrapElement(document, level3Element, "level3");
                //     }
                // }

                // const level4Elements = document.querySelectorAll('.shoulder-grey');
                // wrapElements(document, level4Elements, "level4", group = false);

                // removing unwanted content from ease-content
                let i = 0;
                Array.prototype.forEach.call(document.querySelectorAll("img"),function (node) {node.remove();});
                Array.prototype.forEach.call(document.querySelectorAll(".act-content > table > tbody > tr"),function (node) {if ((i < 165)) {node.remove();}  i++;});
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