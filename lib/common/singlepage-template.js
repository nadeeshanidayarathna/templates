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
            await page.waitForSelector("<TBD>");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process() {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='root'>"); } catch (e) { }

                // TODO:
                try { tags.push("<div class='level1' title='level1'></div>"); } catch (e) { }
                // try { tags.push("<div class='issue-date' title='issue-date'></div>"); } catch (e) { }
                // try { tags.push("<div class='effective-date' title='effective-date'></div>"); } catch (e) { }
                // try { tags.push("<br>"); } catch (e) { }

                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################
                try { tags.push("<div class='content'>"); } catch (e) { }

                // TODO:
                // try { tags.push("<div class='level2' title='level2'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='level3' title='level3'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='level4' title='level4'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                // try { tags.push("<div class='level5' title='level5'></div>"); } catch (e) { }
                // try { tags.push("<div></div>"); } catch (e) { }

                try { tags.push("</div>"); } catch (e) { }
                return Promise.resolve(tags);
            });
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        // await base.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "<TBD>", ["<TBD>"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;