const fs = require("fs");
const sha1 = require("js-sha1");
const line = '-'.repeat(process.stdout.columns);

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

async function htmlToText(browser, htmlPath, textPath, rootScope, removeSelectors, runLevelTest) {
    {
        console.log(line);
        if (rootScope.includes(",")) {
            throw "[TEST]:single root - failed!!! please check the root scopes whether it contains multiple selectors which is not allowed.";
        } else {
            console.log("[TEST]:single root - success!");
        }

        const page = await browser.newPage();
        const contentHtml = fs.readFileSync(htmlPath, "utf8");
        await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
        await page.waitForSelector(rootScope);
        page.on("console", (msg) => console.log(msg.text()));
        var tags = await page.evaluate(function process(rootScope, removeSelectors, line, runLevelTest) {
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

            if (runLevelTest) {
                const levels = document.querySelectorAll(".level1,.level2,.level3,.level4,.level5,.level6,.level7,.level8,.level9,.level10");
                var levelNumbers = [];
                for (const level of levels) {
                    levelNumbers.push(Number(level.className.replaceAll("level", "")));
                }
                const uniqueLevelNumbers = [...new Set(levelNumbers)];
                var previousUniqueLevelNumber = 0;
                var levelOrderIssue = false;
                for (const uniqueLevelNumber of uniqueLevelNumbers) {
                    if (uniqueLevelNumber > previousUniqueLevelNumber + 1) {
                        levelOrderIssue = true;
                        break;
                    }
                    previousUniqueLevelNumber = uniqueLevelNumber;
                }
                console.log(line);
                if (levelOrderIssue) {
                    throw "[TEST]:level order - failed!!! please check the build HTML level order.";
                } else {
                    console.log("[TEST]:level order - success!");
                }
            }

            return Promise.resolve(tags);
        }, rootScope, removeSelectors, line, runLevelTest);

        const content = tags.join("").trim().replaceAll("\n", "").replaceAll(" ", "");
        const hash = sha1(content);
        tags.push(hash);
        await write(textPath, tags);
        await page.close();
        return hash;
    }
}

async function runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, originalRootScope, originalRemoveSelectors, buildRootScope, buildRemoveSelectors) {
    const originalTextHash = await htmlToText(browser, originalHtmlPath, originalTextPath, originalRootScope, originalRemoveSelectors, false);

    // ignoring root level optional attributes from test comparision
    buildRemoveSelectors.push(".issue-date", ".effective-date");
    const buildTextHash = await htmlToText(browser, buildHtmlPath, buildTextPath, buildRootScope, buildRemoveSelectors, true);

    console.log(line);
    if (originalTextHash != buildTextHash) {
        throw "[TEST]:content hashes - failed!!! please compare the original HTML content and build HTML content." + " (original:" + originalTextHash + " build:" + buildTextHash + ")";
    } else {
        console.log("[TEST]:content hashes - success!" + " (original:" + originalTextHash + " build:" + buildTextHash + ")");
    }
    console.log(line);
}

exports.write = write;
exports.htmlToText = htmlToText;
exports.runTest = runTest;