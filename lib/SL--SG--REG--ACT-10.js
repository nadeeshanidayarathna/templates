const base = require("./common/base");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const browser = await base.puppeteer().launch({
            headless: false,
            devtools: false
        });
        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            await base.downloadPage(page, url, sp, path);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".predpisFullWidth");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Elements = document.querySelectorAll(".predpisOznacenie,.predpisTyp,.predpisDatum,.predpisNadpis");
                var level1s = [];
                for (const level1Element of level1Elements) {
                    level1s.push(level1Element);
                }
                wrapElements(document, level1s, "level1", true);
                // wrapElementDate(document, issueDateElement, "issue-date", issueDateElement.textContent + "T00:00:00");
                // wrapElementDate(document, effectiveDateElement, "effective-date", effectiveDateElement.textContent + "T00:00:00");

                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector(".predpisFullWidth > .span8");
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll(".castOznacenie,.castNadpis");
                var level2s;
                for (const level2Element of level2Elements) {
                    if (level2Element.classList.contains("castOznacenie")) {
                        level2s = [];
                        level2s.push(level2Element);
                    } else if (level2Element.classList.contains("castNadpis")) {
                        level2s.push(level2Element);
                        wrapElements(document, level2s, "level2", true);
                    }
                }

                const level3Elements = document.querySelectorAll(".paragrafOznacenie,.paragrafNadpis");
                var level3s;
                for (const level3Element of level3Elements) {
                    if (level3Element.classList.contains("paragrafOznacenie")) {
                        level3s = [];
                        level3s.push(level3Element);
                    } else if (level3Element.classList.contains("paragrafNadpis")) {
                        level3s.push(level3Element);
                        wrapElements(document, level3s, "level3", true);
                    }
                }

                const level4Elements = document.querySelectorAll(".odsekOznacenie");
                const level4FilteredElements = Array.from(level4Elements).filter(level4Element => level4Element.textContent != "");
                wrapElements(document, level4FilteredElements, "level4");

                const level5Elements = document.querySelectorAll(".pismenoOznacenie");
                wrapElements(document, level5Elements, "level5");

                const level6Elements = document.querySelectorAll(".bodOznacenie");
                wrapElements(document, level6Elements, "level6");

                const footnoteElements = document.querySelectorAll(".poznamka");
                wrapElements(document, footnoteElements, "footnote");

                // removing unwanted content from ease-content
                // TODO:
                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, true);
            await page.close();
        }
        await base.test().runPageTest(browser, url, sp, path);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}
module.exports = scraper;