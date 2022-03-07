const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const fs = require("fs");
const common = require("../common");

const soloScraper = async function download(url, sp) {
    try {
        console.log("callings " + sp + " soloScraper url:" + url);

        const { downloadPath, buildPath } = common.createFolder(url, sp);
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

                // heading:h1 elements
                {
                    const elements = document.querySelectorAll(".col-md-12.region-laurier-first h1")
                    for (const element of elements) {
                        tags.push({ tag: 'h1', text: element.textContent })
                    }
                }

                return tags
            });

            // 4.Build
            fs.unlink(buildPath, (err => { }));
            var fileWriter = fs.createWriteStream(buildPath, {
                flags: 'a'
            });
            fileWriter.write("<html>");
            for (tag of tags) {
                console.log("(" + tag.tag + ")" + tag.text);
                fileWriter.write("<" + tag.tag + ">" + tag.text + "</" + tag.tag + ">");
            }
            fileWriter.write("</html>");
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