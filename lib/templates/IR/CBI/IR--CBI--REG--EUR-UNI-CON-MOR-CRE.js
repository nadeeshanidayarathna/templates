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
                const level1Element = document.querySelectorAll(".act-content>table>tbody>tr")[83];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2016-03-22" + "T00:00:00");
                // ################e
                // # content:info #
                // ################
                const content = document.querySelectorAll(".act-content")[0];
                wrapElement(document, content, "ease-content");

                
                // removing unwanted content from ease-content    
                Array.prototype.forEach.call(Array.from(document.querySelectorAll(".act-content>table>tbody>tr")).slice(0,82), function (node) { node.remove(); });



                const level2Elements = document.querySelectorAll("p>b");
                for (i=0;i<level2Elements.length;i++) {
                    if (level2Elements[i].textContent.startsWith("PART")) {
                        level2Elements[i].textContent = level2Elements[i].textContent.replace(level2Elements[i].textContent,level2Elements[i].textContent+" ")
                        wrapElements(document, [level2Elements[i],level2Elements[++i]], "level2",group=true);
                    }
                }


                const level3Elements = document.querySelectorAll("tr>td>p");
                const regex = /^(\n?\t?\s?\d+\.\s)(.*)/i
                isSchedules = false;
                for (i=0;i<level3Elements.length;i++){
                    if(!isSchedules && level3Elements[i].textContent.match(regex)){
                        regexText = level3Elements[i].textContent.match(regex)
                        level3Elements[i-1].textContent = regexText[1]+" "+level3Elements[i-1].textContent
                        level3Elements[i].textContent = regexText[2]
                        wrapElement(document,level3Elements[i-1],"level3");
                        
                    }else if(level3Elements[i].textContent.startsWith("\nSCHEDULE ")){
                        isSchedules =true;
                        wrapElements(document,[level3Elements[i],level3Elements[i+1]],"level3",group=true);
                    }else if(level3Elements[i].textContent.startsWith("\nEXPLANATORY")){
                        wrapElement(document,level3Elements[i],"level3");
                    }

                }


                 const forFootnoteElements = Array.from(level3Elements);
                 wrapElement(document, forFootnoteElements[forFootnoteElements.length - 1], "footnote");


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