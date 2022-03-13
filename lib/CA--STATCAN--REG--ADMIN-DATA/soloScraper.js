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
                tags.push("<span class='root'><span class='h1'>" + elements[0].textContent + "</span></span>", "<br>");

                // ################
                // # main:content #
                // ################
                tags.push("<span class='content'>");

                // content between root and main iteration
                {
                    const pTransforms = Array.from(document.querySelectorAll(".col-md-12.region-laurier-first p")).slice(0, 2);
                    try { tags.push("<span class='h2'>" + pTransforms[0].textContent + "</span>", "<br>"); } catch (e) { }
                    try { tags.push("<span>" + pTransforms[1].textContent + "</span>", "<br>"); } catch (e) { }
                }

                // content main iteration
                {
                    const elements = document.querySelectorAll(".col-md-12.region-laurier-first section")
                    for (const element of elements) {
                        const h2 = element.getElementsByTagName("h2")[0];
                        try { tags.push("<span class='h2'>" + h2.textContent + "</span>", "<br>"); } catch (e) { }
                        const innerElements = element.querySelectorAll("section > p, section > ul, section > ol");
                        for (innerElement of innerElements) {
                            if (innerElement.tagName == "P") {
                                // handling main iteration P tags
                                if (innerElement.firstChild.tagName == "STRONG") {
                                    var h3Text = innerElement.firstChild.textContent;
                                    innerElement.firstChild.remove();
                                    if (innerElement.textContent != "") {
                                        // heading + para h3s
                                        var pText = innerElement.textContent;

                                        // handling non-standards (Administrative Data:)
                                        if (pText.startsWith(":")) {
                                            h3Text = h3Text + ":";
                                            pText = pText.substring(1);
                                        }
                                        try { tags.push("<span class='h3'>" + h3Text + "</span>", "<span>" + pText + "</span>", "<br>"); } catch (e) { }
                                    } else {
                                        // heading only h3s
                                        try { tags.push("<span class='h3'>" + h3Text.substring(0, 4) + "</span>", "<span>" + h3Text.substring(4, h3Text.length) + "</span>", "<br>"); } catch (e) { }
                                    }
                                } else {
                                    try { tags.push(innerElement.outerHTML); } catch (e) { }
                                }
                            } else {
                                // handling main iteration transform, main ULs, main OLs
                                try { tags.push(innerElement.outerHTML); } catch (e) { }
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