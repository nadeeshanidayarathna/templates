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

                Array.prototype.forEach.call(document.querySelectorAll("table:nth-of-type(3)"), function (node) { node.remove(); });

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
               // Array.prototype.forEach.call(document.querySelectorAll("#MainContent_pnlHtmlControls > div > .WordSection2"), function (node) { node.remove(); });

             
               const level2Elements = document.querySelectorAll('a');
               for(const child of level2Elements){
                if(child.textContent.match(/^Article/) || child.textContent.match(/^ANNEXES./)){
                    if(child.nextElementSibling.nodeName == "A"){
                    // let arrList = [];
                    // arrList.push(child);
                    // arrList.push(child.nextElementSibling);
                    // arrList.push(child.nextElementSibling.nextElementSibling);
                    // wrapElements(document, arrList, 'level3', group = true);
                    let fullTxt = child.nextElementSibling.nextSibling.textContent
                    let check = fullTxt.indexOf(".") + 1;
                    let arrList = [];
                    arrList.push(child);
                    arrList.push(child.nextElementSibling);
                    arrList.push(child.nextElementSibling.nextElementSibling);
                    let part1 = fullTxt.substring(0, check);
                    arrList.push(part1);
                    wrapElements(document, arrList, 'level3', group = true);
                    
                    console.log("part 1 :"+part1)

                    //child.outerHTML = child.outerHTML.replace(part1, "<div title=\"level3\" class=\"level3\">" + part1 + "</div>");
                    } else{
                        wrapElement(document, child, 'level2');
                    }
                    
                } else if(child.textContent.match(/^Art./)){
                    let arrList = [];
                    arrList.push(child);
                    arrList.push(child.nextElementSibling);
                    arrList.push(child.nextElementSibling.nextElementSibling);
                    wrapElements(document, arrList, 'level3', group = true);
                    // wrapElement(document, child, 'level3');
                    
                }
               }
                

            //     const level3Elements = document.querySelectorAll('.foot');
            //     wrapElements(document, level3Elements, 'footnote');


         
                // removing unwanted content from ease-content
             
               // Array.prototype.forEach.call(document.querySelectorAll(".detail_gn"), function (node) { node.remove(); });
                // TODO:

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