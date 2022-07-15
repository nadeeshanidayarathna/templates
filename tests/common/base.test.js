const fs = require("fs");
const sha1 = require("js-sha1");
const line = '-'.repeat(process.stdout.columns);
const pathLib = require("path");
const script = pathLib.join("tests", "page", "ease.js");

async function write(path, tags) {
    fs.unlink(path, (err => { }));
    var fileWriter = fs.createWriteStream(path, {
        flags: "a"
    });
    for (tag of tags) {
        fileWriter.write(tag);
    }
    fileWriter.end();
}

/**
 * @deprecated Used only in spider-ease v1. Use spider-ease v2 for new SPs
 */
async function htmlToText(browser, htmlPath, textPath, rootScope, removeSelectors, runBuildHtmlOnlyTest) {
    {
        console.log(line);
        if (rootScope.includes(",")) {
            throw "[TEST]:single root test - failed!!! please check the root scopes whether it contains multiple selectors which is not allowed.";
        } else {
            console.log("[TEST]:single root test - success!");
        }

        const page = await browser.newPage();
        const contentHtml = fs.readFileSync(htmlPath, "utf8");
        await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
        await page.waitForSelector(rootScope);
        page.on("console", (msg) => console.log(msg.text()));

        await page.addScriptTag({ path: script });
        var tags = await page.evaluate(function process(rootScope, removeSelectors, line, runBuildHtmlOnlyTest) {
            if (runBuildHtmlOnlyTest) {
                executeTests(line);
            }

            var tags = [];
            function ToText(tags, node) {
                const childNodes = node.childNodes;
                for (childNode of childNodes) {
                    ToText(tags, childNode);
                }
                if (node.nodeType == Node.TEXT_NODE && node.textContent.trim() != "") {
                    const words = node.textContent.trim().split(" ");
                    for (word of words) {
                        if (word != "") {
                            tags.push(word + "\n");
                        }
                    }
                }
            }
            for (removeSelector of removeSelectors) {
                Array.prototype.forEach.call(document.querySelectorAll(removeSelector), function (node) { node.remove(); });
            }
            for (node of document.querySelectorAll(rootScope)) {
                ToText(tags, node);
            }

            return Promise.resolve(tags);
        }, rootScope, removeSelectors, line, runBuildHtmlOnlyTest);

        const content = tags.join("").trim().replaceAll("\n", "").replaceAll(" ", "").replaceAll(" ", "");
        const hash = sha1(content);
        tags.push(hash);
        await write(textPath, tags);
        await page.close();
        return hash;
    }
}

/**
 * @deprecated Used only in spider-ease v1. Use spider-ease v2 for new SPs
 */
async function runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, originalRootScope, originalRemoveSelectors, buildRootScope, buildRemoveSelectors) {
    const originalTextHash = await htmlToText(browser, originalHtmlPath, originalTextPath, originalRootScope, originalRemoveSelectors, false);

    // ignoring root level optional attributes from test comparision
    buildRemoveSelectors.push(".issue-date", ".effective-date");
    const buildTextHash = await htmlToText(browser, buildHtmlPath, buildTextPath, buildRootScope, buildRemoveSelectors, true);

    if (originalTextHash != buildTextHash) {
        throw "[TEST]:content hashes test - failed!!! please compare the original HTML content and build HTML content." + " (original:" + originalTextHash + " build:" + buildTextHash + ")";
    } else {
        console.log("[TEST]:content hashes test - success!" + " (original:" + originalTextHash + " build:" + buildTextHash + ")");
    }
    console.log(line);
}

async function runPageTest(browser, url, sp, path) {
    const page = await browser.newPage();
    const id = sha1(url);
    const outputPath = pathLib.join(path, sp);
    const htmlPath = pathLib.join(outputPath, id + ".html");
    const contentHtml = fs.readFileSync(htmlPath, "utf8");
    await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
    await page.waitForSelector("body");
    page.on("console", (msg) => console.log(msg.text()));

    await page.addScriptTag({ path: script });
    await page.evaluate(function process(line) {
        executeTests(line);
        return Promise.resolve();
    }, line);
}

exports.write = write;
exports.htmlToText = htmlToText;
exports.runTest = runTest;
exports.runPageTest = runPageTest;