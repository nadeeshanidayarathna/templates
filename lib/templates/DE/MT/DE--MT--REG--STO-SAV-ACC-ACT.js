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

            const delayDownload = {
                waitUntil: "networkidle0",
                timeout: 0
            }
            await base.downloadPage(page, url, sp, path, delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".document-details-content");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.Titel2');
                wrapElement(document, level1Element, "level1");

                let dateString = document.querySelector("h5")
                let stringDate = dateString.textContent.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/g);
                let issueDate = stringDate.toString().split("/").reverse().join("-");
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.document-details-content');
                wrapElement(document, contentElement, "ease-content");

                let levelNo;
                const elements = document.querySelectorAll("p");
                for(const element of elements){
                    if(element.className == "Kapitel"){
                        let arrList = [];
                        arrList.push(element);
                        arrList.push(element.nextElementSibling);
                        wrapElements(document, arrList, "level2", group = true);
                        levelNo = 3;
                    } else if(element.className == "Paragraf"){
                        for(const childs of element.childNodes){
                            if(childs.nodeName == "SPAN"){
                                if(childs.className == "ParagrafNr"){
                                    wrapElement(document, childs, "level"+levelNo);
                                }
                            }
                        }
                    }else if(element.className == "ParagrafGruppeOverskrift"){
                        wrapElement(document, element, "level3");
                        levelNo = 4;
                    }
                }
        
                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".col-5, .row > .col-md-6 > .py-2, .py-2, .paragraph-search-tab"), function (node) { node.remove(); });

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