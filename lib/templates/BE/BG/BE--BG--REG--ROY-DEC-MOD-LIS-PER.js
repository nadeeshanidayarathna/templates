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
            await page.waitForSelector("body");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                Array.prototype.forEach.call(document.querySelectorAll("table:nth-of-type(3), table:nth-of-type(1), table:nth-of-type(2) tbody tr:nth-of-type(2), table:nth-of-type(2) tbody tr:nth-of-type(1), table:nth-of-type(4) tbody tr:nth-of-type(1), table:nth-of-type(5), table:nth-of-type(6), table:nth-of-type(7)"), function (node) { node.remove(); });

                // TODO:
                const rootTitle = "Royal Decree modifying the list of persons and entities referred to in Articles 3 and 5 of the Royal Decree of 28 December 2006 on specific restrictive measures against certain persons and entities in the context of the fight against the financing of terrorism";
                wrapElementLevel1(document, rootTitle);
        
               
               wrapElementDate(document, "issue-date", "2020-11-18" + "T00:00:00");
               wrapElementDate(document, "effective-date", "2020-11-18" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                // TODO:
                const content = document.querySelector("body");
                wrapElement(document, content, "ease-content");
             
               const level2Elements = document.querySelectorAll('a');
               for(const child of level2Elements){
                if(child.textContent.match(/^Article/)){
                    if(child.nextElementSibling.nodeName == "A"){

                    let fullTxt = child.nextElementSibling.nextSibling.textContent
                    let check = fullTxt.indexOf(".") + 1;
                    let arrList = [];
                    arrList.push(child);
                    arrList.push(child.nextElementSibling);
                    let part1 = fullTxt.substring(0, check);
                    let part2 = fullTxt.substring(check, fullTxt.length);
                    arrList.push(part1);

                    child.nextElementSibling.nextSibling.textContent = part2;
                    console.log("part  :"+child.nextElementSibling.nextSibling.textContent)
                    wrapElements(document, arrList, 'level2', group = true);
                    
                    } 
                    
                } else if(child.textContent.match(/^ANNEXES./)){
                    wrapElement(document, child, 'level2');
                } 
                else if(child.textContent.match(/^Art./)){
                    if(child.nextElementSibling.nodeName == "A"){
                        let fullTxt = child.nextElementSibling.nextSibling.textContent
                    let check = fullTxt.indexOf(".") + 1;
                    let arrList = [];
                    arrList.push(child);
                    arrList.push(child.nextElementSibling);
                    let part1 = fullTxt.substring(0, check);
                    let part2 = fullTxt.substring(check, fullTxt.length);
                    arrList.push(part1);
                    child.nextElementSibling.nextSibling.textContent = part2;
                    wrapElements(document, arrList, 'level3', group = true);
                    } else if(child.nextElementSibling.nodeName == "BR"){
                        let fullTxt = child.nextSibling.textContent
                        let check = fullTxt.indexOf(".") + 1;
                        let arrList = [];
                        arrList.push(child);
                        arrList.push(child.nextElementSibling);
                        let part1 = fullTxt.substring(0, check);
                        let part2 = fullTxt.substring(check, fullTxt.length);
                        arrList.push(part1);
                        child.nextSibling.textContent = part2;
                        wrapElements(document, arrList, 'level3', group = true);
                    }
                    
                }
               }


                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true);
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