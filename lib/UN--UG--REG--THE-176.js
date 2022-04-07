const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("./common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { originalHtmlPath, buildHtmlPath, originalTextPath, buildTextPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false
        });

        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.download(originalHtmlPath, page, url);

            // 2.Identify
            // 3.Collect
            await page.waitForSelector("#viewLegSnippet");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process() {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<span class='root'>"); } catch (e) { }
                const elements = document.querySelectorAll('h1.LegTitle');
                try { tags.push("<span class='level1' title='level1'>"+ elements[0].innerHTML + "</span>", "<br>"); } catch (e) { }
                const issueDates = document.querySelectorAll('.LegDate:nth-of-type(2) .LegDateDate');
                try { tags.push("<span class='issue-date' title='issue-date'>"+ issueDates[0].textContent +"T00:00:00</span>" , "<br>"); } catch (e) { }     
                try { tags.push("</span>"); } catch (e) { }


                // ################
                // # main:content #
                // ################

                function AddTransform(node) {
                    if (node != undefined) {
                        try { tags.push("<span>" + ((node.nodeType == Node.TEXT_NODE) ? node.textContent : node.innerHTML) + "</span>", "<br>"); } catch (e) { }
                    }
                }


                try { tags.push("<span class='content'>"); } catch (e) { }
                //content main iteration
                {
                const elements = document.querySelectorAll('#viewLegSnippet');
                for (const element of elements)
                {
                    const level2 = element.querySelectorAll('div > .LegSubject:nth-of-type(2) ,h1.LegSchedulesTitle, h2.LegExpNoteTitle');
                    for (const el of level2)
                    {
                        try { tags.push("<span class='level2' title='level2'>"+ el.innerHTML +"</span>", "<br>"); } catch (e) { }
                    }
                    
                }
                // TODO:
                // try { tags.push("<span class='level2' title='level2'></span>", "<br>"); } catch (e) { }
                // try { tags.push("<span></span>", "<br>"); } catch (e) { }

                // try { tags.push("<span class='level3' title='level3'></span>", "<br>"); } catch (e) { }
                // try { tags.push("<span></span>", "<br>"); } catch (e) { }

                // try { tags.push("<span class='level4' title='level4'></span>", "<br>"); } catch (e) { }
                // try { tags.push("<span></span>", "<br>"); } catch (e) { }

                // try { tags.push("<span class='level5' title='level5'></span>", "<br>"); } catch (e) { }
                // try { tags.push("<span></span>", "<br>"); } catch (e) { }

                }
                try { tags.push("</span>"); } catch (e) { }
                return Promise.resolve(tags);
            });
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;