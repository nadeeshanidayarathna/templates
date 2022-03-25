const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { downloadPath, buildPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: true
        });

        // 1.Download
        console.log("getting url:" + url);
        const page = await browser.newPage();
        await base.download(downloadPath, page, url);

        // 2.Identify
        // 3.Collect
        {
            await page.waitForSelector('.col-md-9.col-md-push-3');
            page.on('console', (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process() {
                var tags = [];

                const docContent = document.querySelectorAll(".docContents")[0];
                const headingSection = docContent.querySelectorAll("section")[0];
                const rootTitle = headingSection.querySelectorAll(".Title-of-Act")[0];
                rootTitle.remove();

                // ################
                // # root:heading #
                // ################
                try { tags.push("<span class='root'>"); } catch (e) { }
                try { tags.push("<span class='level1' title='level1'>" + rootTitle.innerHTML + "</span>", "<br>"); } catch (e) { }
                try { tags.push("</span>"); } catch (e) { }

                // ################
                // # main:content #
                // ################


                // contentSection1
                const contentSection1 = docContent.querySelectorAll("section")[1];
                try { tags.push("<span class='content'>"); } catch (e) { }
                try { tags.push("<span>" + headingSection.innerHTML + "</span>", "<br>"); } catch (e) { }

                const sectionChilds = contentSection1.childNodes;
                var previousPreviousTagName = "";
                var previousTagName = "";
                var nextTagName = "";
                var index = 0;
                var h2MultiTags = false;
                for (const sectionChild of sectionChilds) {
                    if (index == sectionChilds.length - 1) {
                        nextTagName = "";
                    } else {
                        nextTagName = sectionChilds[index + 1].tagName;
                    }

                    if (sectionChild.tagName == "H2") {
                        h2MultiTags = sectionChild.childNodes.length > 1;
                        if (h2MultiTags == false && nextTagName == "H3") {
                            // building multi heading level2
                            try { tags.push("<span class='level2' title='level2' pos='1'>" + sectionChild.innerHTML); } catch (e) { }
                        } else {
                            if (sectionChild.childNodes.length == 2) {
                                try { tags.push("<span class='level2' title='level2' pos='2'>" + sectionChild.childNodes[0].innerHTML + " " + sectionChild.childNodes[1].innerHTML + "</span>", "<br>"); } catch (e) { }
                                try { tags.push("<span>TODO</span>", "<br>"); } catch (e) { }
                            } else {
                                try { tags.push("<span class='level2' title='level2' pos='3'>" + sectionChild.innerHTML + "</span>", "<br>"); } catch (e) { }
                                try { tags.push("<span>TODO</span>", "<br>"); } catch (e) { }
                            }

                        }
                    } else if (h2MultiTags == false && previousTagName == "H2" && sectionChild.tagName == "H3") {
                        // finishing multi heading level2
                        try { tags.push(" " + sectionChild.innerHTML + "</span>", "<br>"); } catch (e) { }
                        try { tags.push("<span>TODO</span>", "<br>"); } catch (e) { }
                    } else if (sectionChild.tagName == "SECTION") {
                        const scheduleChilds = sectionChild.querySelectorAll(".Schedule")[0].childNodes;
                        for (const scheduleChild of scheduleChilds) {
                            if (scheduleChild.tagName == "HEADER") {
                                const headerChilds = scheduleChild.childNodes;
                                for (const headerChild of headerChilds) {
                                    if (headerChild.tagName == "H2") {
                                        const h2Childs = headerChild.childNodes
                                        var scheduleLabel;
                                        for (const h2Child of h2Childs) {
                                            if (Array.from(h2Child.classList).includes("scheduleLabel")) {
                                                scheduleLabel = h2Child.innerHTML;
                                                try { tags.push("<span class='level2' title='level2' pos='4'>" + scheduleLabel + "</span>", "<br>"); } catch (e) { }
                                                try { tags.push("<span>TODO</span>", "<br>"); } catch (e) { }
                                            } else if (!scheduleLabel.startsWith("FORM") && Array.from(h2Child.classList).includes("scheduleTitleText")) {
                                                try { tags.push("<span class='level3' title='level3' pos='5'>" + h2Child.innerHTML + "</span>", "<br>"); } catch (e) { }
                                                try { tags.push("<span>TODO</span>", "<br>"); } catch (e) { }
                                            }
                                        }
                                    }
                                }
                            } else if (scheduleChild.tagName == "H2") {
                                try { tags.push("<span class='level2' title='level2' pos='6'>" + scheduleChild.innerHTML + "</span>", "<br>"); } catch (e) { }
                                try { tags.push("<span>TODO</span>", "<br>"); } catch (e) { }
                            }
                        }
                    } else if ((h2MultiTags == false && previousTagName == "H2" && sectionChild.tagName == "P") || (h2MultiTags == false && previousPreviousTagName == "H2" && previousTagName == "H3" && sectionChild.tagName == "P") || (sectionChild.tagName == "H3")) {
                        const hiddenElements = sectionChild.querySelectorAll(".wb-invisible");
                        for (const hiddenElement of hiddenElements) {
                            hiddenElement.remove();
                        }

                        try { tags.push("<span class='level3' title='level3' pos='7'>" + sectionChild.innerHTML + "</span>", "<br>"); } catch (e) { }
                        try { tags.push("<span>TODO</span>", "<br>"); } catch (e) { }
                    }
                    previousPreviousTagName = previousTagName;
                    previousTagName = sectionChild.tagName;
                    index++;
                }

                // contentSection2
                const contentSection2s = document.querySelectorAll(".ScheduleRP,.ScheduleNIF");
                for (const contentSection2 of contentSection2s) {
                    const contentSection2Childs = contentSection2.childNodes;
                    for (const contentSection2Child of contentSection2Childs) {
                        if (contentSection2Child.tagName == "H2") {
                            try { tags.push("<span class='level2' title='level2' pos='8'>" + contentSection2Child.innerHTML + "</span>", "<br>"); } catch (e) { }
                            try { tags.push("<span>TODO</span>", "<br>"); } catch (e) { }
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
        console.log(e);
        console.log('Failed to scrape!!!');
        process.exit(1);
    }
}

module.exports = scraper;