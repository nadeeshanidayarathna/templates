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
          

            await page.waitForSelector(".node__content");
            
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

            const ftn4 = document.querySelectorAll("p")[134];
            if(ftn4){
                const parent = ftn4.previousElementSibling;
                const newSpan = document.createElement("span");
                newSpan.appendChild(ftn4);
                parent.insertAdjacentElement("beforeend", newSpan)
            } 

                wrapElementLevel1(document, "The Australian Guidelines for Electronic Commerce");
 
                wrapElementDate(document, "issue-date", "2006-03-17" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('.field--type-text-with-summary');
                wrapElement(document, contentElement, "ease-content"); 

                const level2Elements = document.querySelectorAll(".field--type-text-with-summary h1 ~ h1");
                wrapElements(document, level2Elements, "level2");
        
                const level3Elements = document.querySelectorAll(".field--type-text-with-summary h2 ~ h2");
                wrapElements(document, level3Elements, "level3");

                // const level3Elements = document.querySelectorAll("h2");
                // for (const level3Element of level3Elements) {
                //     if (level3Element.textContent.match(/^[\r\n\s]\S+/)) {
                //         wrapElement(document, level3Element, "level3");
                //     }  
                // }
        
                const forFootnoteElements = document.querySelectorAll("hr ~ p");
                for(const footNote of forFootnoteElements){
                    wrapElement(document, footNote, "footnote"); 
                }

                // removing unwanted content from ease-content
                document.querySelectorAll("p")[0].remove();
                document.querySelectorAll(".field--type-text-with-summary h1")[0].remove();
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