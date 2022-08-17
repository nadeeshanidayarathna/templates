const base = require("./common/base");

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
                waitUntil: "networkidle2",
                timeout: 3000
            }

            await base.downloadPage(page, url, sp, path, delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector("#lawArea");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector("#dayOfPromulgation > li")
                wrapElement(document, level1Element, "level1");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector("#lawArea");
                wrapElement(document, contentElement, "ease-content");

                const contL2 = document.querySelectorAll("#lawArea")[0];
                for(const elements of contL2.childNodes){
                    let arrlevel2 = [];
                    if(elements.id == "MainProvision"){
                        for(const childs of elements.childNodes){
                            for(const child of childs.childNodes){
                                if(child.className == "_div_ArticleCaption"){
                                    arrlevel2.push(child);
                                } else if(child.className == "_div_ArticleTitle"){
                                    for(const child2 of child.childNodes){
                                        if(child2.nodeName == "SPAN"){
                                            arrlevel2.push(child2);
                                        }
                                    }
                                }
                            }
                        }

                    } else if(elements.id == "429M60000002054-Sp"){
                        for(const childs of elements.childNodes){
                            if(childs.className == "_div_SupplProvisionLabel SupplProvisionLabel"){
                                arrlevel2.push(childs);
                            }
                        }

                    } else if(elements.id == "5030000000005-Sp"){
                        for(const childs of elements.childNodes){
                            if(childs.className == "active Article"){
                                for(const child of childs.childNodes){
                                    if(child.className == "_div_ArticleCaption"){
                                        arrlevel2.push(child);
                                    } else if(child.className == "_div_ArticleTitle"){
                                        for(const child2 of child.childNodes){
                                            if(child2.nodeName == "SPAN"){
                                                arrlevel2.push(child2);
                                            }
                                        }
                                    }
                                }

                            }
                        }
                    }
                    wrapElements(document, arrlevel2, "level2", group = false);
                }

                // TODO:
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