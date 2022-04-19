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
}

async function htmlToText(browser, htmlPath, textPath, rootScope, removeSelectors) {
    {
        const page = await browser.newPage();
        const contentHtml = fs.readFileSync(htmlPath, "utf8");
        await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
        await page.waitForSelector(rootScope);
        page.on("console", (msg) => console.log(msg.text()));
        var tags = await page.evaluate(function process(rootScope, removeSelectors) {
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
        }, rootScope, removeSelectors);

        const content = tags.join("").trim().replaceAll("\n", "").replaceAll(" ", "");
        const hash = sha1(content);
        tags.push(hash);
        await write(textPath, tags);
        await page.close();
        return hash;
    }
}

async function htmlToTextOriginal(browser, htmlPath, textPath, rootScope, removeSelectors) {
    {
        const page = await browser.newPage();
        const contentHtml = fs.readFileSync(htmlPath, "utf8");
        await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
        await page.waitForSelector(rootScope);
        page.on("console", (msg) => console.log(msg.text()));
        var tags = await page.evaluate(function process(rootScope, removeSelectors) {

            const rootTransforms = document.querySelectorAll(".article__header--law.article__header--main > p");
            for (rootTransform of rootTransforms) {
                // removing daily changing date for monitoring
                const rootChilds = rootTransform.childNodes
                for (rootChild of rootChilds) {
                    if (rootChild.textContent.indexOf("Geraadpleegd op") != -1) {
                        rootChild.remove();
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
        }, rootScope, removeSelectors);

        const content = tags.join("").trim().replaceAll("\n", "").replaceAll(" ", "");
        const hash = sha1(content);
        tags.push(hash);
        await write(textPath, tags);
        await page.close();
        return hash;
    }
}

async function runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, originalRootScope, originalRemoveSelectors, buildRootScope, buildRemoveSelectors) {
    const originalTextHash = await htmlToTextOriginal(browser, originalHtmlPath, originalTextPath, originalRootScope, originalRemoveSelectors);

    // ignoring root level optional attributes from test comparision
    buildRemoveSelectors.push(".issue-date", ".effective-date");
    const buildTextHash = await htmlToText(browser, buildHtmlPath, buildTextPath, buildRootScope, buildRemoveSelectors);

    console.log(line);
    console.log("hash:" + originalTextHash + " (original)");
    console.log("hash:" + buildTextHash + " (build)");
    console.log(line);
    if (originalTextHash != buildTextHash) {
        throw "text content hashes mismatches!!! please compare the original HTML content and build HTML content.";
    } else {
        console.log("text content hashes matches successfully!");
    }
    console.log(line);
}

exports.runTest = runTest;