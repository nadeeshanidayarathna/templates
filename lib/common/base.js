const fs = require("fs");
const sha1 = require('js-sha1');

async function createFolder(url, sp, path) {
    const id = sha1(url);
    const outputPath = path + "\\" + sp;
    const originalHtmlPath = outputPath + "\\" + id + "_original.html";
    const buildHtmlPath = outputPath + "\\" + id + ".html";
    const originalTextPath = outputPath + "\\" + id + "_original.txt";
    const buildTextPath = outputPath + "\\" + id + ".txt";
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    return { originalHtmlPath, buildHtmlPath, originalTextPath, buildTextPath };
}

async function build(buildHtmlPath, tags) {
    fs.unlink(buildHtmlPath, (err => { }));
    var fileWriter = fs.createWriteStream(buildHtmlPath, {
        flags: 'a'
    });
    fileWriter.write("<html>");
    fileWriter.write("<head>");
    fileWriter.write("<style>");
    fileWriter.write("br {content: '';margin: 1em;display: block;}");
    fileWriter.write(".level1 {font-size: 32px;border-style: solid;border-radius: 10px;border-color: #B2BEB5;background-color: #B2BEB5;text-decoration-color: #B2BEB5;border: 5px solid #B2BEB5;}");
    fileWriter.write(".issue-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".effective-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #899b8d;background-color: #899b8d;text-decoration-color: #899b8d;}");
    fileWriter.write(".footnote {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #899b8d;background-color: #899b8d;text-decoration-color: #899b8d;}");
    fileWriter.write(".level2 {font-size: 24px;font-weight: bold;background-color: #a3d7ff;border: 5px solid #a3d7ff;}");
    fileWriter.write(".level3 {font-size: 18.72px;font-weight: bold;background-color: #72ffb6;border: 5px solid #72ffb6;}");
    fileWriter.write(".level4 {font-size: 16px;font-weight: bold;background-color: #f49fa6;border: 5px solid #f49fa6;}");
    fileWriter.write(".level5 {font-size: 13.28px;font-weight: bold;background-color: #f7df8a;border: 5px solid #f7df8a;}");
    fileWriter.write(".level6 {font-size: 12px;font-weight: bold;background-color: #eab3f9;border: 5px solid #eab3f9;}");
    fileWriter.write(".level7 {font-size: 11px;font-weight: bold;background-color: #17DEEE;border: 5px solid #17DEEE;}");
    fileWriter.write(".level8 {font-size: 10px;font-weight: bold;background-color: #21B20C;border: 5px solid #21B20C;}");
    fileWriter.write(".level9 {font-size: 9px;font-weight: bold;background-color: #FF4162;border: 5px solid #FF4162;}");
    fileWriter.write(".level10 {font-size: 8px;font-weight: bold;background-color: #FF7F50;border: 5px solid #FF7F50;}");
    fileWriter.write("</style>");
    fileWriter.write("</head>");

    fileWriter.write("<body>");
    for (tag of tags) {
        fileWriter.write(tag);
    }
    fileWriter.write("</body>");
    fileWriter.write("</html>");
}

async function download(originalHtmlPath, page, url) {
    if (fs.existsSync(originalHtmlPath)) {
        console.log("using existing cache file");
        const contentHtml = fs.readFileSync(originalHtmlPath, 'utf8');
        await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
    } else {
        console.log("downloading new cache file");
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
        const html = await page.content();
        await fs.writeFileSync(originalHtmlPath, html);
    }
}

async function getStyles() {
    return ""
        + ".level1 {font-size: 32px;border-style: solid;border-radius: 10px;border-color: #B2BEB5;background-color: #B2BEB5;text-decoration-color: #B2BEB5;border: 5px solid #B2BEB5;}"
        + ".issue-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}"
        + ".effective-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #899b8d;background-color: #899b8d;text-decoration-color: #899b8d;}"
        + ".level2 {font-size: 24px;font-weight: bold;background-color: #a3d7ff;border: 5px solid #a3d7ff;}"
        + ".level3 {font-size: 18.72px;font-weight: bold;background-color: #72ffb6;border: 5px solid #72ffb6;}"
        + ".level4 {font-size: 16px;font-weight: bold;background-color: #f49fa6;border: 5px solid #f49fa6;}"
        + ".level5 {font-size: 13.28px;font-weight: bold;background-color: #f7df8a;border: 5px solid #f7df8a;}"
        + ".level6 {font-size: 12px;font-weight: bold;background-color: #eab3f9;border: 5px solid #eab3f9;}"
        + ".level7 {font-size: 11px;font-weight: bold;background-color: #17DEEE;border: 5px solid #17DEEE;}"
        + ".level8 {font-size: 10px;font-weight: bold;background-color: #21B20C;border: 5px solid #21B20C;}"
        + ".level9 {font-size: 9px;font-weight: bold;background-color: #FF4162;border: 5px solid #FF4162;}"
        + ".level10 {font-size: 8px;font-weight: bold;background-color: #FF7F50;border: 5px solid #FF7F50;}";
};

async function write(path, tags) {
    fs.unlink(path, (err => { }));
    var fileWriter = fs.createWriteStream(path, {
        flags: 'a'
    });
    for (tag of tags) {
        fileWriter.write(tag);
    }
}

async function originalHtmlToText(browser, originalHtmlPath, originalTextPath, originalRootScope, originalRemoveSelectors) {
    {
        const page = await browser.newPage();
        const contentHtml = fs.readFileSync(originalHtmlPath, "utf8");
        await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
        await page.waitForSelector(".region-laurier-first");
        page.on("console", (msg) => console.log(msg.text()));
        var tags = await page.evaluate(function process(originalRootScope, originalRemoveSelectors) {
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
            for (originalRemoveSelector of originalRemoveSelectors) {
                Array.prototype.forEach.call(document.querySelectorAll(originalRemoveSelector), function (node) { node.remove(); });
            }
            ToText(tags, document.querySelectorAll(originalRootScope)[0]);
            return Promise.resolve(tags);
        }, originalRootScope, originalRemoveSelectors);

        const content = tags.join("").trim().replaceAll("\n", "").replaceAll(" ", "");
        const hash = sha1(content);
        tags.push(hash);
        await write(originalTextPath, tags);
        await page.close();
    }
}

async function buildHtmlToText(browser, buildHtmlPath, buildTextPath, buildRootScope, buildRemoveSelectors) {
    {
        const page = await browser.newPage();
        const contentHtml = fs.readFileSync(buildHtmlPath, "utf8");
        await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
        await page.waitForSelector("body");
        page.on("console", (msg) => console.log(msg.text()));
        var tags = await page.evaluate(function process(buildRootScope, buildRemoveSelectors) {
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
            Array.prototype.forEach.call(document.querySelectorAll(".issue-date"), function (node) { node.remove(); });
            Array.prototype.forEach.call(document.querySelectorAll(".effective-date"), function (node) { node.remove(); });
            for (buildRemoveSelector of buildRemoveSelectors) {
                Array.prototype.forEach.call(document.querySelectorAll(buildRemoveSelector), function (node) { node.remove(); });
            }
            ToText(tags, document.querySelectorAll(buildRootScope)[0]);
            return Promise.resolve(tags);
        }, buildRootScope, buildRemoveSelectors);

        const content = tags.join("").trim().replaceAll("\n", "").replaceAll(" ", "");
        const hash = sha1(content);
        tags.push(hash);
        await write(buildTextPath, tags);
        await page.close();
    }
}

async function runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, originalRootScope, originalRemoveSelectors, buildRootScope, buildRemoveSelectors) {
    await originalHtmlToText(browser, originalHtmlPath, originalTextPath, originalRootScope, originalRemoveSelectors);
    await buildHtmlToText(browser, buildHtmlPath, buildTextPath, buildRootScope, buildRemoveSelectors);
}

exports.createFolder = createFolder;
exports.download = download;
exports.build = build;
exports.getStyles = getStyles;
exports.write = write;
exports.runTest = runTest;