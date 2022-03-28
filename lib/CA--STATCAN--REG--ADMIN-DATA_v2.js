const stealthPlugin = require("puppeteer-extra-plugin-stealth");
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
            page.on('console', (msg) => console.log(msg.text()));
            var { tags, data } = await page.evaluate(function process() {
                var tags = [];
                var data = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<span class='root'>"); } catch (e) { }
                const elements = document.querySelectorAll(".region-laurier-first h1");
                try { tags.push("<span class='level1' title='level1'>" + elements[0].innerHTML + "</span>", "<br>"); } catch (e) { }
                data.push({ "level": "level1", "tag": elements[0].tagName, "text": elements[0].textContent });

                const issueDates = document.querySelectorAll("dd");
                try { tags.push("<span class='issue-date' title='issue-date' data-tag='" + issueDates[0].tagName + "' data-x='" + issueDates[0].offsetLeft + "' data-y='" + issueDates[0].offsetTop + "'>" + issueDates[0].textContent + "T00:00:00</span>", "<br>"); } catch (e) { }
                data.push({ "level": "issue-date", "tag": issueDates[0].tagName, "text": issueDates[0].textContent });
                try { tags.push("</span>"); } catch (e) { }

                // ################
                // # main:content #
                // ################
                try { tags.push("<span class='content'>"); } catch (e) { }
                // content between root and main iteration
                {
                    const pTransforms = Array.from(document.querySelectorAll(".region-laurier-first .field-item.even > *:not(section,ul)"));
                    try { tags.push("<span class='level2' title='level2'>" + pTransforms[0].textContent + "</span>", "<br>"); } catch (e) { }
                    data.push({ "level": "level2", "tag": pTransforms[0].tagName, "text": pTransforms[0].textContent });
                }

                // content main iteration
                {
                    const elements = document.querySelectorAll(".region-laurier-first section")
                    for (const element of elements) {
                        const h2 = element.getElementsByTagName("H2")[0];
                        try { tags.push("<span class='level2' title='level2'>" + h2.textContent + "</span>", "<br>"); } catch (e) { }
                        data.push({ "level": "level2", "tag": h2.tagName, "text": h2.textContent });
                        const innerElements = element.querySelectorAll("section > p, section > ul, section > ol");
                        for (const innerElement of innerElements) {
                            if (innerElement.tagName == "P") {
                                // handling main iteration P tags
                                if (innerElement.firstChild.tagName == "STRONG") {
                                    const result = innerElement.textContent.match("^\\d+.\\d+.");
                                    if (result != null) {
                                        const headingText = result[0];
                                        try { tags.push("<span class='level3' title='level3'>" + headingText + "</span>", "<br>"); } catch (e) { }
                                        data.push({ "level": "level3", "tag": innerElement.firstChild.tagName, "text": headingText });
                                    }
                                }
                            } else if (innerElement.tagName == "OL") {
                                const listElements = innerElement.getElementsByTagName("LI");
                                var index = 0;
                                for (const listElement of listElements) {
                                    index++;
                                    try { tags.push("<span class='level3' title='level3'>" + index + ".</span>", "<br>"); } catch (e) { }
                                    data.push({ "level": "level3", "tag": listElement.tagName, "text": index });
                                }
                            }
                        }
                    }
                }

                try { tags.push("</span>"); } catch (e) { }

                return Promise.resolve({ tags, data });
            });

            // 4.Annotate
            await page.evaluate(function process(data) {

                // adding styles to the head
                const headElement = document.querySelectorAll("head")[0];
                const style = document.createElement("style");
                style.innerHTML = ""
                    + ".level1 {font-size: 32px;border-style: solid;border-radius: 10px;border-color: #B2BEB5;background-color: #B2BEB5;text-decoration-color: #B2BEB5;border: 5px solid #B2BEB5;}"
                    + ".issue-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}"
                    + ".effective-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #899b8d;background-color: #899b8d;text-decoration-color: #899b8d;}"
                    + ".level2 {font-size: 24px;font-weight: bold;background-color: #a3d7ff;border: 5px solid #a3d7ff;}"
                    + ".level3 {font-size: 18.72px;font-weight: bold;background-color: #72ffb6;border: 5px solid #72ffb6;}"
                    + ".level4 {font-size: 16px;font-weight: bold;background-color: #f49fa6;border: 5px solid #f49fa6;}"
                    + ".level5 {font-size: 13.28px;font-weight: bold;background-color: #f7df8a;border: 5px solid #f7df8a;}"
                    + ".level6 {font-size: 12px;font-weight: bold;background-color: #eab3f9;border: 5px solid #eab3f9;}"
                    + ".level7 {font-size: 11px;font-weight: bold;background-color: #17DEEE;border: 5px solid #17DEEE;}"
                    + ".level8 {font-size: 10px;font-weight: bold;background-color: #21B20C;border: 5px solid #21B20C;}"
                    + ".level9 {font-size: 9px;font-weight: bold;background-color: #FF4162;border: 5px solid #FF4162;}"
                    + ".level10 {font-size: 8px;font-weight: bold;background-color: #FF7F50;border: 5px solid #FF7F50;}"
                headElement.appendChild(style);

                {
                    for (const tagData of data) {
                        const elements = document.querySelectorAll("*");
                        for (const element of elements) {
                            if (element.textContent == tagData.text) {
                                if (element.tagName == tagData.tag) {
                                    console.log("[tag found] tag:" + tagData.tag + " text:" + tagData.text);
                                    const span = document.createElement("span");
                                    span.classList.add(tagData.level);
                                    span.innerHTML = element.innerHTML;
                                    element.innerHTML = "";
                                    element.appendChild(span);
                                }
                            }
                        }
                    }
                }
            }, data);

            await base.annotate(buildPath, page);
        }
        await page.close();
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log('Failed to scrape!!!');
        process.exit(1);
    }
}

module.exports = scraper;