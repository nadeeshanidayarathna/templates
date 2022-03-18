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
            await page.waitForSelector('.col-md-9.col-md-push-3');
            page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
            var tags = await page.evaluate(function process() {
                var tags = [];

                const docContent = document.querySelectorAll(".docContents")[0];
                const headingSection = docContent.querySelectorAll("section")[0];
                const contentSection1 = docContent.querySelectorAll("section")[1];
                const contentSection2 = document.querySelectorAll(".ScheduleRP,.ScheduleNIF");

                var contentSections = [];
                contentSections.push(contentSection1);
                //contentSections = contentSections.concat(contentSection2);

                const rootTitle = headingSection.querySelectorAll(".Title-of-Act")[0];
                rootTitle.remove();

                // ################
                // # root:heading #
                // ################
                try { tags.push("<span class='root'>"); } catch (e) { }
                try { tags.push("<span class='h1' title='level1'>" + rootTitle.innerHTML + "</span>", "<br>"); } catch (e) { }
                try { tags.push("</span>"); } catch (e) { }

                // ################
                // # main:content #
                // ################
                try { tags.push("<span class='content'>"); } catch (e) { }
                try { tags.push("<span>" + headingSection.innerHTML + "</span>", "<br>"); } catch (e) { }

                for (const contentSection of contentSections) {
                    const sectionChilds = contentSection.childNodes;
                    for (const sectionChild of sectionChilds) {
                        if (sectionChild.tagName == "H2") {
                            try { tags.push("<span class='h2' title='level2'>" + sectionChild.innerHTML + "</span>", "<br>"); } catch (e) { }
                            try { tags.push("<span>TODO</span>", "<br>"); } catch (e) { }

                        } else if (sectionChild.tagName == "SECTION") {
                            const scheduleChilds = sectionChild.querySelectorAll(".Schedule")[0].childNodes;
                            var scheduleChildHeaderCount = 0;
                            for (const scheduleChild of scheduleChilds) {
                                if (scheduleChild.tagName == "HEADER" && scheduleChildHeaderCount == 0) {
                                    try { tags.push("<span class='h2' title='level2'>" + scheduleChild.innerHTML + "</span>", "<br>"); } catch (e) { }
                                    try { tags.push("<span>TODO</span>", "<br>"); } catch (e) { }
                                    scheduleChildHeaderCount++;
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