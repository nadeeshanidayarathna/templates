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
        var tags = await page.evaluate(function process(rootScope, removeSelectors, line, runBuildHtmlOnlyTest) {
            if (runBuildHtmlOnlyTest) {
                {
                    // root+content test
                    console.log(line);
                    if (document.querySelectorAll(".root").length != 1) {
                        throw "[TEST]:root exists test - failed!!! please check the build HTML root div exists.";
                    } else {
                        console.log("[TEST]:root exists test - success!");
                    }

                    console.log(line);
                    debugger;
                    if (document.querySelectorAll(".root")[0].querySelectorAll(".level1").length != 1) {
                        throw "[TEST]:root level test - failed!!! please check the build HTML root -> level1 div exists.";
                    } else {
                        console.log("[TEST]:root level test - success!");
                    }

                    console.log(line);
                    if (document.querySelectorAll(".root")[0].querySelectorAll(".level2,.level3,.level4,.level5,.level6,.level7,.level8,.level9,.level10").length != 0) {
                        throw "[TEST]:root level test - failed!!! please check the build HTML root -> level 2-9 div exists which is wrong.";
                    } else {
                        console.log("[TEST]:root level test - success!");
                    }

                    console.log(line);
                    if (document.querySelectorAll(".content").length != 1) {
                        throw "[TEST]:content exists test - failed!!! please check the build HTML content div exists.";
                    } else {
                        console.log("[TEST]:content exists test - success!");
                    }

                    console.log(line);
                    if (document.querySelectorAll(".content")[0].querySelectorAll(".level1").length != 0) {
                        throw "[TEST]:content level test - failed!!! please check the build HTML content -> level1 div exists which is wrong.";
                    } else {
                        console.log("[TEST]:content level test - success!");
                    }

                    // level test
                    const levels = document.querySelectorAll(".level1,.level2,.level3,.level4,.level5,.level6,.level7,.level8,.level9,.level10");
                    var levelNumbers = [];
                    var levelTextIssue = false;
                    for (const level of levels) {
                        if (level.textContent.trim() == "") {
                            levelTextIssue = true;
                        }
                        levelNumbers.push(Number(level.className.replaceAll("level", "")));
                    }
                    var previousLevelNumber = 0;
                    var levelOrderIssue = false;
                    for (const levelNumber of levelNumbers) {
                        if (levelNumber > previousLevelNumber + 1) {
                            levelOrderIssue = true;
                            break;
                        }
                        previousLevelNumber = levelNumber;
                    }
                    console.log(line);
                    if (levelTextIssue) {
                        throw "[TEST]:level text test - failed!!! please check the build HTML level(s) contains empty text.";
                    } else {
                        console.log("[TEST]:level text test - success!");
                    }
                    console.log(line);
                    if (levelOrderIssue) {
                        throw "[TEST]:level order test - failed!!! please check the build HTML level order.";
                    } else {
                        console.log("[TEST]:level order test - success!");
                    }
                }

                {
                    // image test
                    const images = document.querySelectorAll("img");
                    var imagePathIssue = false;
                    for (const image of images) {
                        if (!image.src.toLocaleUpperCase().startsWith("HTTP")) {
                            imagePathIssue = true;
                        }
                    }
                    console.log(line);
                    if (imagePathIssue) {
                        throw "[TEST]:image path test - failed!!! please check the build HTML image src whether its an absolute link.";
                    } else {
                        console.log("[TEST]:image path test - success!");
                    }
                }

                {
                    // anchor test
                    const anchors = document.querySelectorAll("a[href]");
                    var anchorPathIssue = false;
                    for (const anchor of anchors) {
                        if (!anchor.href.toLocaleUpperCase().startsWith("HTTP")) {
                            anchorPathIssue = true;
                        }
                    }
                    console.log(line);
                    if (anchorPathIssue) {
                        throw "[TEST]:anchor path test - failed!!! please check the build HTML anchor href whether its an absolute link.";
                    } else {
                        console.log("[TEST]:anchor path test - success!");
                    }
                }
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
        throw "[TEST]:content hashes test - failed!!! please compare the original HTML content and build HTML content." + " (original:" + originalTextHash + " build:" + buildTextHash + ")";
    } else {
        console.log("[TEST]:content hashes test - success!" + " (original:" + originalTextHash + " build:" + buildTextHash + ")");
    }
    console.log(line);
}

exports.write = write;
exports.htmlToText = htmlToText;
exports.runTest = runTest;