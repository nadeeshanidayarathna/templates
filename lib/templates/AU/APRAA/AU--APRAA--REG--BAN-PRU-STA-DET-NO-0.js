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
            await page.waitForSelector(".right");
            await page.evaluate(function process() {

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
                // #############
                // # root:info #
                // #############
                const rootTitle = "Banking (prudential standard) determination No. 1 of 2022 Prudential Standard APS 220 Credit Risk Management";
                wrapElementLevel1(document, rootTitle);

                const DateElements = document.querySelectorAll('p');
                for (const DateElement of DateElements) {
                    if (DateElement.textContent.trim().startsWith('Dated')) {
                        let fullText = DateElement.textContent;
                        let check = (fullText.indexOf(" ") + 1)
                        let part2 = fullText.substring(check, fullText.length);
                        const dateFormat = (new Date(part2).toLocaleDateString('fr-CA'));
                        wrapElementDate(document, "issue-date", dateFormat + "T00:00:00");
                    }
                }
                wrapElementDate(document, "effective-date", "2022-09-01" + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".right");
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('p .CharSchNo')[1];
                wrapElement(document, level2Elements, "level2");

                const level3Elements = document.querySelectorAll('.htmlOuterDiv h1,.htmlOuterDiv h2,.htmlOuterDiv h3');
                let lvlNo = 3;
                
                for(const child of level3Elements){

                    if(child.nodeName == "H1"){
                        wrapElement(document, child, "level"+lvlNo);
                    } else if(child.nodeName == "H2"){
                        wrapElement(document, child, "level4");
                        lvlNo = 5;
                    } else if(child.nodeName == "H3"){
                        wrapElement(document, child, "level"+( lvlNo + 1));
                    }
                }

                const footnoteElement = document.querySelectorAll('.MsoFootnoteText');
                wrapElements(document, footnoteElement, "footnote");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".MsoTocHeading, .MsoToc1"), function (node) { node.remove(); });
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