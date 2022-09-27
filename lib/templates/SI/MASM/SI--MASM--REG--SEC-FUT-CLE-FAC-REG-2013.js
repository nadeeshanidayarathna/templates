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
            await page.setBypassCSP(true)
            const delayDownload = {
                waitUntil: "networkidle0",
                timeout: 0
            }
            await base.downloadPage(page, url, sp, path, delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".status-row");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".slTitle");
                wrapElement(document, level1Element, "level1");
                  
                const issueDate = document.querySelectorAll('.status-row')[1];
                const dateFormat = (new Date(issueDate.textContent.match(/(?<=at\s)(.*)/m)[0]).toLocaleDateString('fr-CA'));
                wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector("#legisContent");
                wrapElement(document, content, "ease-content");

                const level2Elements = document.querySelectorAll("td");
                let levelNo;
                let level;
                for(const level2Element of level2Elements){
                    for(const childs of level2Element.childNodes){
                        let arrList = [];                    
                        if(childs.nodeName == "DIV"){
                            if(childs.className == "partNo"){
                                arrList.push(childs);
                                arrList.push(childs.nextSibling);
                                wrapElements(document, arrList, "level2", group = true);
                                levelNo = 3;
                                level = 4;
                            } 
                        } else if(childs.nodeName == "SPAN"){
                            if(childs.parentElement.className == "prov1Hdr" && childs.className !== "noBold"){
                                wrapElement(document, childs, "level"+levelNo); 
                                
                            } else if(childs.parentElement.className == "divtitle"){
                                wrapElement(document, childs.parentElement, "level3"); 
                                levelNo = 4;
                                level = 5;
                            }
                        } else if(childs.nodeName == "STRONG"){
                            wrapElement(document, childs, "level"+level);
                        }
                    }
                }

                const level2ElementsN = document.querySelectorAll(".sHdr");
                wrapElements(document, level2ElementsN, "level2"); 

                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, false);
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