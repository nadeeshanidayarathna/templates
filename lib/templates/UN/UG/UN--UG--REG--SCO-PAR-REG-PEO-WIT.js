const base = require("../../../common/base");

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
            await page.waitForSelector("#viewLegSnippet");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############
                const level1Element = document.querySelector('.LegTitle');
                wrapElement(document, level1Element, "level1");
                const issueDates = document.querySelectorAll('div > .LegDateDate')[0];
                const dateStr = issueDates.textContent.replaceAll("st", "").replaceAll("nd", "").replaceAll("rd", "").replaceAll("th", "");
                const issueDate = (new Date(dateStr).getFullYear()) + "-" + ("0" + (new Date(dateStr).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(dateStr).getDate())).slice(-2)
                wrapElementDate(document, "issue-date", issueDate + "T00:00:00");
                // ################
                // # content:info #
                // ################
                const contentElement = document.querySelector('#viewLegSnippet');
                wrapElement(document, contentElement, "ease-content");

                const level2Element = document.querySelectorAll('h2.LegPartFirst, h2.LegPart, h2.LegScheduleFirst, h2.LegSchedule, .LegExpNoteTitle');
                wrapElements(document, level2Element, "level2");


                const level3Elements = document.querySelectorAll('#schedule-2-paragraph-9 > .LegP1No, h3.LegPartFirst, h3.LegPart, #schedule-2-paragraph-6 > .LegP1No, h3.LegScheduleFirst');
                wrapElements(document, level3Elements, "level3");

                const level4Element = document.querySelectorAll('h4.LegPartFirst, h4.LegPart');
                wrapElements(document, level4Element, "level4");

                const level4Elements = document.querySelectorAll('h4.LegP1GroupTitleFirst, h4.LegP1GroupTitle');
                for (const elements of level4Elements) {
                    if (elements.nextElementSibling.childNodes[0]) {
                        if (elements.nextElementSibling.childNodes[0].className == 'LegP1No' && elements.nextElementSibling.childNodes[0].textContent.trim().match(/^\d+\./) && !(elements.textContent.trim().match(/^\“/))) {
                            let texts = elements.nextElementSibling.childNodes[0].textContent.trim();
                            elements.nextElementSibling.childNodes[0].outerHTML = elements.nextElementSibling.childNodes[0].outerHTML.replace(elements.nextElementSibling.childNodes[0].innerHTML, "");
                            let titles = elements.innerHTML;
                            elements.outerHTML = elements.outerHTML.replace(elements.outerHTML, "<div class=\"level4\" title=\"level4\">" + texts + " " + titles + "</div>");
                        }
                    }
                }

                const footnoteElement = document.querySelectorAll('.LegCommentaryItem');
                for (const elements of footnoteElement) {
                    if (elements.textContent.trim().match(/^F/)) {
                        wrapElement(document, elements, "footnote");
                    }
                }

                const level3Element = document.querySelectorAll('h3.LegP1GroupTitleFirst, h3.LegP1GroupTitle');
                for (const elements of level3Element) {
                    if (elements.nextElementSibling.childNodes[0]) {
                        if (elements.nextElementSibling.childNodes[0].className == 'LegP1No' && elements.nextElementSibling.childNodes[0].textContent.trim().match(/^\d+\./)) {
                            let texts = elements.nextElementSibling.childNodes[0].textContent.trim();
                            elements.nextElementSibling.childNodes[0].outerHTML = elements.nextElementSibling.childNodes[0].outerHTML.replace(elements.nextElementSibling.childNodes[0].innerHTML, "");
                            let titles = elements.innerHTML;
                            elements.outerHTML = elements.outerHTML.replace(elements.outerHTML, "<div class=\"level3\" title=\"level3\">" + texts + " " + titles + "</div>");
                        }
                    }
                }

                const level3 = document.querySelectorAll('span#regulation-61A, span#regulation-67A');
                wrapElements(document, level3, "level3");

               const spaceAlter = document.querySelectorAll('.LegPartNo, .LegScheduleNo, .LegCommentaryType');
               for (const elements of spaceAlter) {
                let texts = elements.innerHTML;
                elements.innerHTML = elements.innerHTML.replace(elements.innerHTML, texts + "<span> </span>");
               }

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".LegExtentRestriction"), function (node) { node.remove(); });

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