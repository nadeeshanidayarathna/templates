const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const common = require("../common");

const soloScraper = async function download(url, sp, path) {
    try {
        console.log("callings soloScraper url:" + url + " sp:" + sp + " path:" + path);
        const { downloadPath, buildPath } = common.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false
        });
        console.log("downloading url:" + url);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
        await page.waitForSelector('.col-md-12.region-laurier-first');
        const html = await page.content();

        // 1.Download
        common.download(downloadPath, html);

        // 2.Identify
        // 3.Collect
        {
            page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
            var tags = await page.evaluate(function process() {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                const elements = document.querySelectorAll(".col-md-12.region-laurier-first h1");
                tags.push("<span class='root'><span class='h1'>" + elements[0].innerHTML + "</span></span>", "<br>");

                // ################
                // # main:content #
                // ################
                tags.push("<span class='content'>");

                // content between root and main iteration
                {
                    const pTransforms = Array.from(document.querySelectorAll(".col-md-12.region-laurier-first p")).slice(0, 2);
                    try { tags.push("<span class='h2'>" + pTransforms[0].innerHTML + "</span>", "<br>"); } catch (e) { }
                    try { tags.push("<span>" + pTransforms[1].innerHTML + "</span>", "<br>"); } catch (e) { }
                }

                // content main iteration
                {
                    const elements = document.querySelectorAll(".col-md-12.region-laurier-first section")
                    for (const element of elements) {
                        const h2 = element.getElementsByTagName("H2")[0];
                        try { tags.push("<span class='h2'>" + h2.innerHTML + "</span>", "<br>"); } catch (e) { }
                        const innerElements = element.querySelectorAll("section > p, section > ul, section > ol");
                        for (const innerElement of innerElements) {
                            if (innerElement.tagName == "P") {
                                // handling main iteration P tags
                                if (innerElement.firstChild.tagName == "STRONG") {
                                    const result = innerElement.textContent.match("^\\d+.\\d+.");
                                    if (result == null) {
                                        const text = innerElement.textContent;
                                        try { tags.push("<span>" + text + "</span>", "<br>"); } catch (e) { }
                                    } else {
                                        const heading = result[0];
                                        const text = innerElement.textContent.replace(heading, '');
                                        try { tags.push("<span class='h3'>" + heading + "</span>", "<span>" + text + "</span>", "<br>"); } catch (e) { }
                                    }
                                } else {
                                    try { tags.push("<span>" + innerElement.outerHTML + "</span>", "<br>"); } catch (e) { }
                                }
                            } else if (innerElement.tagName == "OL") {
                                const listElements = innerElement.getElementsByTagName("LI");
                                var index = 0;
                                for (const listElement of listElements) {
                                    index++;
                                    try { tags.push("<span class='h3'>" + index + ".</span>", "<span>" + listElement.innerHTML + "</span>", "<br>"); } catch (e) { }
                                }
                            } else {
                                // handling main iteration default transforms
                                try { tags.push("<span>" + innerElement.outerHTML + "</span>", "<br>"); } catch (e) { }
                            }
                        }
                    }
                }

                tags.push("</span>");

                return Promise.resolve(tags);
            });

            // 4.Build
            common.build(buildPath, tags);
        }
        await page.close();
        await browser.close();
    } catch (e) {
        console.log(e.message);
        console.log('Failed to scrape!!!');
        process.exit(0);
    }
}

module.exports = soloScraper