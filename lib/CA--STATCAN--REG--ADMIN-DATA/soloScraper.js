const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const fs = require("fs");
const common = require("../common");

const soloScraper = async function download(url, sp) {
    try {
        console.log("callings " + sp + " soloScraper url:" + url);

        const { downloadPath, reCreatePath } = common.createFolder(url, sp);
        const browser = await puppeteer.launch({ headless: false });
        console.log("downloading url:" + url);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
        await page.waitForSelector('.col-md-12.region-laurier-first')
        const html = await page.content();

        // 1.Download
        common.download(downloadPath, html);

        // 2.Identify
        // 3.Collect
        {
            var tags = await page.evaluate(() => {
                var tags = []

                // // heading:h1 elements
                // {
                //     const elements = document.querySelectorAll(".col-md-12.region-laurier-first h1")
                //     for (const element of elements) {
                //         tags.push({ tag: 'h1', text: element.textContent })
                //     }
                // }

                // // content:top ul elements
                // {
                //     const parentElements = document.querySelectorAll(".col-md-12.region-laurier-first .list-unstyled.mrgn-lft-md")
                //     for (const parentElement of parentElements) {
                //         var lis = []
                //         const ul = { tag: 'ul', text: '', lis: lis }
                //         const elements = parentElement.getElementsByTagName("li");
                //         for (const element of elements) {
                //             lis.push({ tag: 'li', text: element.textContent })
                //         }
                //         if (lis.length != 0) {
                //             tags.push(ul)
                //         }
                //     }
                // }

                // content:main
                {
                    const elements = document.querySelectorAll(".col-md-12.region-laurier-first section")
                    for (const element of elements) {
                        const h2 = element.getElementsByTagName("h2")[0];
                        try { tags.push({ tag: 'h2', text: h2.textContent }) } catch (e) { }
                        const innerElements = element.querySelectorAll(".col-md-12.region-laurier-first section p,.col-md-12.region-laurier-first section ul");
                        for (innerElement of innerElements) {
                            if (innerElement.tagName == "P") {
                                if (innerElement.firstChild.tagName == "STRONG" && innerElement.firstChild.textContent.match("[a-zA-Z].*")) {
                                    try { tags.push({ tag: 'h3', text: innerElement.firstChild.textContent }) } catch (e) { }
                                    innerElement.firstChild.remove();
                                    if (innerElement.textContent != "") {
                                        try { tags.push({ tag: 'p', text: innerElement.textContent }) } catch (e) { }
                                    }
                                } else {
                                    try { tags.push({ tag: 'p', text: innerElement.textContent }) } catch (e) { }
                                }
                            } else if (innerElement.tagName == "UL") {
                                var lisTags = []
                                const ul = { tag: 'ul', text: '', lis: lisTags }
                                const lis = innerElement.getElementsByTagName("li");
                                for (const li of lis) {
                                    try { lisTags.push({ tag: 'li', text: li.textContent }) } catch (e) { }
                                }
                                if (lis.length != 0) {
                                    try { tags.push(ul) } catch (e) { }
                                }
                            }
                        }
                    }
                }

                return tags
            });

            // 4.Build
            common.build(reCreatePath, tags);
        }
        await page.close();
        await browser.close();
    } catch (e) {
        console.log(e.message)
        console.log('Failed to crawl!!!')
        process.exit(0)
    }
}

module.exports = soloScraper