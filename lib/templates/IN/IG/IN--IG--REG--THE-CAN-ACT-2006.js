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
            await base.downloadPage(page, url, sp, path, null, 'utf16le');

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {

                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelector("h6");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2006-09-13T00:00:00");

                // ################
                // # content:info #
                // ################

                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");

                const level2Element = document.querySelectorAll("p, b, h2");
                let lvlNo = 3;
                for(const child of level2Element){
                    if(child.textContent.match(/^CHAPTER/) || child.textContent.match(/^CHPTER/) || child.textContent.match(/^SCHEDULE/)){
                        if(child.nextElementSibling !== null && !child.textContent.match(/^SCHEDULE/)){
   
                                let arrList = [];
                                arrList.push(child);
                                arrList.push(child.nextElementSibling);
                                wrapElements(document, arrList, "level2", group=true);
                                lvlNo = 3;
                        } else if(child.textContent.match(/^SCHEDULE/)){
                            wrapElement(document, child, "level2");
                        }
                    } else if(child.nodeName == "H2"){
                        wrapElement(document, child, "level3");
                        lvlNo = 4;
                    } else if(child.nodeName == "B"){
                        if(child.textContent.match(/^\d./)){
                            if(child.nextElementSibling !== null){
                                if(child.nextElementSibling.nodeName == "B"){
                                    let arrList = [];
                                    arrList.push(child);
                                    arrList.push(child.nextElementSibling);
                                    wrapElements(document, arrList, "level"+lvlNo, group=true);
                                } else {
                                    wrapElement(document, child, "level"+lvlNo);
                                }
                            } else {
                                wrapElement(document, child, "level"+lvlNo);
                            }                   
                        }
                    }
                }


            const footNoteElements = document.querySelectorAll('.footnotedescription');
            wrapElements(document, footNoteElements, 'footnote');
                
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