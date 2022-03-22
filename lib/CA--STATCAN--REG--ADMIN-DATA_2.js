const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { downloadPath, buildPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false
        });

        // 1.Download
        console.log("getting url:" + url);
        const page = await browser.newPage();
        await base.download(downloadPath, page, url);

        // 2.Identify
        // 3.Collect
        {
            await page.waitForSelector('.region-laurier-first');
            page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
            var tags = await page.evaluate(function process() {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<span class='root'>"); } catch (e) { }
                const elements = document.querySelectorAll(".region-laurier-first h1");
                try { tags.push("<span class='h1' title='level1' data-tag='" + elements[0].tagName + "' data-x='" + elements[0].offsetLeft + "' data-y='" + elements[0].offsetTop + "'>" + elements[0].innerHTML + "</span>", "<br>"); } catch (e) { }
                const issueDates = document.querySelectorAll("dd");
                try { tags.push("<span class='issue-date' title='issue-date' data-tag='" + issueDates[0].tagName + "' data-x='" + issueDates[0].offsetLeft + "' data-y='" + issueDates[0].offsetTop + "'>" + issueDates[0].textContent + "T00:00:00</span>", "<br>"); } catch (e) { }
                try { tags.push("</span>"); } catch (e) { }

                // ################
                // # main:content #
                // ################
                try { tags.push("<span class='content'>"); } catch (e) { }
                // content between root and main iteration
                {
                    const pTransforms = Array.from(document.querySelectorAll(".region-laurier-first .field-item.even > *:not(section,ul)"));
                    try { tags.push("<span class='h2' title='level2' data-tag='" + pTransforms[0].tagName + "' data-x='" + pTransforms[0].offsetLeft + "' data-y='" + pTransforms[0].offsetTop + "'>" + pTransforms[0].textContent + "</span>", "<br>"); } catch (e) { }
                }

                // content main iteration
                {
                    const elements = document.querySelectorAll(".region-laurier-first section")
                    for (const element of elements) {
                        const h2 = element.getElementsByTagName("H2")[0];
                        try { tags.push("<span class='h2' title='level2' data-tag='" + h2.tagName + "' data-x='" + h2.offsetLeft + "' data-y='" + h2.offsetTop + "'>" + h2.innerHTML + "</span>", "<br>"); } catch (e) { }
                        const innerElements = element.querySelectorAll("section > p, section > ul, section > ol");
                        for (const innerElement of innerElements) {
                            if (innerElement.tagName == "P") {
                                // handling main iteration P tags
                                if (innerElement.firstChild.tagName == "STRONG") {
                                    const result = innerElement.textContent.match("^\\d+.\\d+.");
                                    if (result != null) {
                                        try { tags.push("<span class='h3' title='level3' data-tag='" + innerElement.tagName + "' data-x='" + innerElement.offsetLeft + "' data-y='" + innerElement.offsetTop + "'>" + headingText + "</span>", "<br>"); } catch (e) { }
                                    }
                                }
                            } else if (innerElement.tagName == "OL") {
                                const listElements = innerElement.getElementsByTagName("LI");
                                var index = 0;
                                for (const listElement of listElements) {
                                    index++;
                                    try { tags.push("<span class='h3' title='level3' data-tag='" + listElement.tagName + "' data-x='" + listElement.offsetLeft + "' data-y='" + listElement.offsetTop + "'>" + index + ".</span>", "<br>"); } catch (e) { }
                                }
                            }
                        }
                    }
                }

                try { tags.push("</span>"); } catch (e) { }

                return Promise.resolve(tags);
            });

            // 4.Build
            await base.build(buildPath, tags);
        }
        await page.close();
        await browser.close();
    } catch (e) {
        console.log(e.message);
        console.log('Failed to scrape!!!');
        process.exit(1);
    }
}

module.exports = scraper;