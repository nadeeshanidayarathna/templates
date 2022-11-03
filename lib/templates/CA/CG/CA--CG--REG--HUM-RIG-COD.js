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
            await page.waitForSelector(".WordSection1");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                // TODO:
                const level1Element = document.querySelector(".shorttitle");
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2021-11-29" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2021-11-29" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector(".WordSection1");
                wrapElement(document, content, "ease-content");

                const level2Elements = document.querySelectorAll(".law-level-1");
                wrapElements(document, level2Elements, "level2");

                const level3Elements = document.querySelectorAll("h4");
                for(const child of level3Elements){
                    if(child.textContent.match(/^Preamble/)){
                        wrapElement(document, child, "level2");
                    } else if(child.nextElementSibling.childNodes.length >= 3){
                        // wrapElement(document, child, "level3");
                        let arrList = [];
                       
                        if(child.nextElementSibling.childNodes[1].textContent.match(/^\d\d.|^\d.+$/) && child.previousElementSibling.nodeName != "H4"){
                            arrList.push(child.nextElementSibling.childNodes[1]);
                            arrList.push(child);
                            wrapElements(document, arrList, "level3", group=true);
                        } else if(child.previousElementSibling.nodeName == "H4"){
                            arrList.push(child.previousElementSibling.previousSibling)
                            arrList.push(child.nextElementSibling.childNodes[1]);
                            arrList.push(child.previousElementSibling);
                            
                           

                            wrapElements(document, arrList, "level3", group=true);
                        }


                    }
                }
                // wrapElements(document, level3Elements, "level3");

                const elements = document.querySelectorAll(".leg-history");
                for(const child of elements){
                    child.childNodes[0].removeAttribute('style');
                }

                const level4Elements = document.querySelectorAll(".amendments");
                for(const child of level4Elements){
                    child.removeAttribute('style');
                }



     
                Array.prototype.forEach.call(document.querySelectorAll(".tocExpandable, .MsoNormalTable, .MsoNormal a"), function (node) { node.remove(); });
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