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
            const delayDownload = {
                waitUntil: "networkidle0",
                timeout: 0
            }
            await base.downloadPage(page, url, sp, path, delayDownload);

            // 2.Identify
            // 3.Wrap
            await page.waitForSelector(".col-md-9");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelectorAll(".Title-of-Act")[0];
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2022-12-09" + "T00:00:00");
                // wrapElementDate(document, "effective-date", "2022-02-08" + "T00:00:00");
                // ################
                // # content:info #
                // ################

                const content = document.querySelectorAll(".col-md-9")[0];
                wrapElement(document, content, "ease-content");

                const elementTitles = document.querySelectorAll(".col-md-9 > div > div > section > section > h6, .col-md-9 > div > div > section > section > div > header > h2 > span.scheduleLabel, .col-md-9 > div > div > section > h2, .col-md-9 > section > div > h2, .col-md-9 > div > div > section > h3, h4.Subheading, h5.Subheading, .col-md-9 > div > div > section > .MarginalNote, .Repealed, .MarginalNoteDefinedTerm");
                let nextLevel = 2;
                for (const elements of elementTitles) {
                    if (elements.tagName == 'H6' || (elements.tagName == 'SPAN' && elements.className == 'scheduleLabel') || elements.tagName == 'H2') {
                        wrapElement(document, elements, "level2");
                        nextLevel = 3;
                    } else if (elements.tagName == 'H3') {
                        wrapElement(document, elements, "level3");
                        nextLevel = 4;
                    } else if (elements.tagName == 'H4' && elements.className == 'Subheading') {
                        wrapElement(document, elements, "level4");
                        nextLevel = 5;
                    } else if (elements.tagName == 'H5' && elements.className == 'Subheading') {
                        wrapElement(document, elements, "level5");
                        nextLevel = 6;
                    } else if (elements.className == 'MarginalNote' || elements.className == 'MarginalNoteDefinedTerm') {
                        if (elements.nextElementSibling.tagName == 'P' && elements.nextElementSibling.textContent.trim().match(/^\d+\.?[\d+]?/)) {
                            if (elements.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].className == 'sectionLabel') {
                                let titles = elements.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].textContent.trim();
                                elements.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].innerHTML = elements.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].innerHTML.replace(elements.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].innerHTML, "");
                                let texts = elements.innerHTML;
                                elements.outerHTML = elements.outerHTML.replace(texts, `<div class='level${nextLevel}' title='level${nextLevel}'> ${titles} ${texts} </div>`);
                            }
                        } else if (elements.nextElementSibling.tagName == 'UL' && elements.nextElementSibling.textContent.trim().match(/^\d+\.?[\d+]?/)) {
                            if (elements.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].childNodes[0].className == 'sectionLabel') {
                                let titles = elements.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent.trim();
                                elements.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML = elements.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML.replace(elements.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML, "");
                                let texts = elements.innerHTML;
                                elements.outerHTML = elements.outerHTML.replace(texts, `<div class='level${nextLevel}' title='level${nextLevel}'> ${titles} ${texts} </div>`);
                            }
                        }
                    } else if (elements.className == 'Repealed') {
                        if (elements.previousElementSibling.textContent.trim().match(/^\d+\.?[\d+]?/) && elements.previousElementSibling.childNodes[0].className == 'sectionLabel') {
                            wrapElement(document, elements.previousElementSibling, "level" + nextLevel);
                        }
                    }
                }

                const footnoteElement = document.querySelectorAll(".Schedule  div.Footnote");
                wrapElements(document, footnoteElement, "footnote");

                const bulletText = document.querySelectorAll('ul.HistoricalNote');
                for (const elements of bulletText) {
                    let i = 0;
                    for (const element of elements.childNodes) {
                        if (element.tagName == 'LI' && i == (elements.childNodes.length - 1)) {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.outerHTML, "<span>" + texts + ". </span>");
                        } else if (element.tagName == 'LI' && i < (elements.childNodes.length - 1)) {
                            let texts = element.innerHTML;
                            element.outerHTML = element.outerHTML.replace(element.outerHTML, "<span>" + texts + "; </span>");
                        } i++;
                    }
                }

                const alterSpace = document.querySelectorAll('.HLabel1, .HLabel2');
                for (const elements of alterSpace) {
                    let texts = elements.innerHTML;
                    elements.outerHTML = elements.outerHTML.replace(elements.innerHTML, texts + "<span>  </span>");
                }


                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".legisHeader, div.PITLink,.mfp-hide, .wb-invisible, #right-panel"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".FCSelector"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > div > ul > li > section "), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > dl > dt"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".col-md-9 > div > div > section > .MarginalNote > span"), function (node) { node.remove(); });

                const remover = document.querySelectorAll('ul.HistoricalNote .mfp-hide, li > section');
                for (const element of remover) {
                    if (element.classList.contains('mfp-hide')) {
                        element.remove();
                    }
                }


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