const { group } = require("yargs");
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
            await page.waitForSelector("#MainContent_pnlHtmlControls");
            await page.evaluate(function process() {
                // #############
                // # root:info #
                // #############

                const level1Element = document.querySelector('.ShortT');
                wrapElement(document, level1Element, "level1");
                wrapElementDate(document, "issue-date", "2014-11-07" + "T00:00:00");
                wrapElementDate(document, "effective-date", "2014-10-22" + "T00:00:00");
 
                // ################
                // # content:info #
                // ################

                const contentElement = document.querySelector('#MainContent_pnlHtmlControls');
                wrapElement(document, contentElement, "ease-content");

                const level2Elements = document.querySelectorAll('.LongT, .ENotesHeading1');
                wrapElements(document, level2Elements, "level2");

                const level3Elements = document.querySelectorAll('.ActHead5 , .ENotesHeading2');
                wrapElements(document, level3Elements, "level3");

                // removing unwanted content from ease-content
                Array.prototype.forEach.call(document.querySelectorAll(".WordSection1 img, .WordSection2"), function (node) { node.remove(); });
                Array.prototype.forEach.call(document.querySelectorAll(".subsection2 > img"), function (node) { node.setAttribute("src", "data:image/gif;base64,R0lGODlh7AAzAHcAMSH+GlNvZnR3YXJlOiBNaWNyb3NvZnQgT2ZmaWNlACH5BAEAAAAALAEADADpABwAhQAAAAAAAAAAHR0AAB0AHQAdHR0dAB0AMgAAMwAdMgAcSB0dSAAyMgAzWh0zWh1GbDIAHTMAADIdADIAMjMeRzMzWzNGRjVbbjNGbjNbgEgcAEgdHUceM1ozAFozHVszM0YzRltIHUZGM0hIW0hbSFtISEhZf0ZGbl1dbll/WUhuW1tuSEhuf11/f1l/bkRubmxGHW5GM25GRm5dXX9uSH9/XW5/WW5uRG6AbmaIiIBbM4iIZgECAwECAwECAwECAwb/QIBwSCwaj8ikcslsOp/QqHRKPQ4ER00AW+16v+CweOyFsACHYmyoSDbI1UjgbYxknHYvAU6OJP18RXQad0dpRxsIgUSFTXtEFwABfDpHEVxflYubSzBDHUkLf5wajllCgGSlR49fq5ywRw9Ds1JtQpUhAbOTRHJcl6hYe3JvWr2+W2cDAchCxwB+WrcAzLVDrcRzQ80JktvNbzQEZ7m7kkXWAOMqctzbQuMiAXfq5rxF4evk++2T42fYucPVrFkVT0JATWk1cMCsQwBeKQLQilmAicCMrOowsZUvYUIebRACwRewi0K4TPB1RxSakKh6OXwpZCSAknIwoipSrCbJ/2gyHw5xmSYY0InNTuq8KQRhlUGNmHQoiIzGEIjYzlA8k40iNlRRvcIcZ+lOKkAWnYld2wpZKh0oya67aiTtvniPUmUVYteqEKxD4CqSS5gACX5bQ56xCYCOF5dFwiKhdqjyEEyPsh3+Gs0IZph1dooGzJmtL0WAAK1ca5mma9Bi9cIG3Bqiathdu8JmNrHLFSIDAExNakQr2HWW/aJ6o6lzStPRwqZqA7CO2SGpZjXHXVqIh85OV1ankbyI9n0B+cmuLuQ8+b9zmw4Rz2+84fr4z1CIhQTls24STKLFHfBU458QzRRgkSLTCFcgX/7JoZaDxE01ETNFNKgFgwG0If9hQgEoWFACAXIYET2SOIbhiRy2MRURGw6xohYnEkhHWiT2EuMxHbKIYBs8TsjfkEQWaWQXKByp5JJMNmmEU0qs5uSUVFY5BY/XGCGelVx26WUUEVBjBFVklmnQGHkQIRcVsh05kCVPeNRkm0qE+WUdmEhB45Ry/odHnkzu2cRqkN2J3hJhvUKnE5Id0SgRfUaEXZxTXidFoV0YZZQ2XzFzx3DdfQMoqCcWCE00FzRoYJbv5LjNcG/sEUCq+iSDhUUZnhlBJD1CaERFvViIIAM58dVbG5PAcA52W3w10DHE0irmkIgR4I9OcrQBAwIr0GWUEMwBSld0PGHHxR6Macn/UnwGOpPmEBKt9RFIa51REqRD2DtEWMEJsUZMs/QbmXAIpFAsAMCYda4YjiEogHH4gqYbQ9x0NMS98lYs2rzORWOBXWNOSgRKHrWpWaRniQwyZytPC4DLNLUGnW6pifyFkB24bB9XX7EHQTtv0BfQAHewtxwAq727ccqk8VRwmhEELa/SCH+Fss1+KPcruzACUMLAximXhnI6PHwozZZ2/EXD45b7HHQCt0HHaq1ocIucc2+MdSG7rrJdEd+lknfJddDRBsp8Y3fHK0U8wjg3Y05bG3aGc+cc1Awfgek7CgpggH+T3LAghAYFSA0zCvbWLjJqTfVGs5JwuyJPZ6JDV0Nazag+IW9AoUiE65Jw4R8zbA//4BEKwTsrOsqqeCDo78B+oBdst1dFpIZmr30UUA6xHxVGby9+Eo/eyfYHmU4//voOVq99w05hwP789HsBFzLDwT5EEAA7"); });
                return Promise.resolve();
            });
            // 4.Write
            await base.writePage(page, url, sp, path, true, true, false);
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