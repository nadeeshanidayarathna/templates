const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const fs = require("fs");
const sha1 = require('js-sha1');
const path = require("path");


const soloScraper = async function download(url, sp) {
    try {
        console.log("callings " + sp + " soloScraper url:" + url)
        const id = sha1(url);
        const outputPath = "downloads\\" + sp;
        const downloadPath = outputPath + "\\" + id + ".html";
        const rebuildPath = outputPath + "\\" + id;
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }

        const browser = await puppeteer.launch({ headless: false });
        console.log("downloading url:" + url);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
        await page.waitForSelector('.col-md-12.region-laurier-first')
        const html = await page.content();

        // 1.Download
        fs.writeFileSync(downloadPath, html);

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
            fs.unlink(rebuildPath, (err => { }));
            var fileWriter = fs.createWriteStream(rebuildPath, {
                flags: 'a'
            })

            fileWriter.write("<html>");
            for (tag of tags) {
                console.log("(" + tag.tag + ")" + tag.text);
                if (["ul", "ol"].includes(tag.tag)) {
                    fileWriter.write("<" + tag.tag + ">");
                    const lis = tag.lis;
                    for (li of lis) {
                        console.log("(" + li.tag + ")" + li.text);
                        fileWriter.write("<" + li.tag + ">" + li.text + "</" + li.tag + ">");
                    }
                    fileWriter.write("</" + tag.tag + ">");
                } else {
                    fileWriter.write("<" + tag.tag + ">" + tag.text + "</" + tag.tag + ">");
                }
            }
            fileWriter.write("</html>");
        }
        await page.close();
        await browser.close();
    } catch (e) {
        console.log(e.message)
        console.log('Failed to crawl .....................retry after sometimes')
        process.exit(0)
    }
}

module.exports = soloScraper