const fs = require("fs");
const sha1 = require("js-sha1");
const pathLib = require("path");
const style = pathLib.join("lib", "page", "ease.css");
const script = pathLib.join("lib", "page", "ease.js");

/**
 * @deprecated Used only in spider-ease v1. Use spider-ease v2 for new SPs
 */
async function createFolder(url, sp, path) {
    const id = sha1(url);
    const outputPath = pathLib.join(path, sp);
    const originalHtmlPath = pathLib.join(outputPath, id + "_original.html");
    const buildHtmlPath = pathLib.join(outputPath, id + ".html");
    const originalTextPath = pathLib.join(outputPath, id + "_original.txt");
    const buildTextPath = pathLib.join(outputPath, id + ".txt");
    const metadataPath = pathLib.join(outputPath, id + ".json");
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    return { id, originalHtmlPath, buildHtmlPath, originalTextPath, buildTextPath, metadataPath };
}

/**
 * @deprecated Used only in spider-ease v1. Use spider-ease v2 for new SPs
 */
async function build(buildHtmlPath, tags) {
    fs.unlink(buildHtmlPath, (err => { }));
    var fileWriter = fs.createWriteStream(buildHtmlPath, {
        flags: "a"
    });
    fileWriter.write("<html>");
    fileWriter.write("<head>");
    fileWriter.write("<style>");
    fileWriter.write("ease-root {display: block;}");
    fileWriter.write("ease-content {display: block;}");
    fileWriter.write("br {content: '';margin: 1em;display: block;}");
    fileWriter.write(".level1 {font-size: 32px;border-style: solid;border-radius: 10px;border-color: #B2BEB5;background-color: #B2BEB5;text-decoration-color: #B2BEB5;border: 5px solid #B2BEB5;}");
    fileWriter.write(".issue-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".effective-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #899b8d;background-color: #899b8d;text-decoration-color: #899b8d;}");
    fileWriter.write(".footnote {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".level2 {font-size: 24px;font-weight: bold;background-color: #a3d7ff;border: 5px solid #a3d7ff;}");
    fileWriter.write(".level3 {font-size: 18.72px;font-weight: bold;background-color: #72ffb6;border: 5px solid #72ffb6;}");
    fileWriter.write(".level4 {font-size: 16px;font-weight: bold;background-color: #f49fa6;border: 5px solid #f49fa6;}");
    fileWriter.write(".level5 {font-size: 13.28px;font-weight: bold;background-color: #f7df8a;border: 5px solid #f7df8a;}");
    fileWriter.write(".level6 {font-size: 12px;font-weight: bold;background-color: #eab3f9;border: 5px solid #eab3f9;}");
    fileWriter.write(".level7 {font-size: 11px;font-weight: bold;background-color: #17DEEE;border: 5px solid #17DEEE;}");
    fileWriter.write(".level8 {font-size: 10px;font-weight: bold;background-color: #21B20C;border: 5px solid #21B20C;}");
    fileWriter.write(".level9 {font-size: 9px;font-weight: bold;background-color: #FF4162;border: 5px solid #FF4162;}");
    fileWriter.write(".level10 {font-size: 8px;font-weight: bold;background-color: #FF7F50;border: 5px solid #FF7F50;}");

    // to support title1-9 which can be alias for the level titles (optional:to be deprecated)
    fileWriter.write(".level-alias1 {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".level-alias2 {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".level-alias3 {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".level-alias4 {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".level-alias5 {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".level-alias6 {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".level-alias7 {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".level-alias8 {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".level-alias9 {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");

    fileWriter.write("</style>");
    fileWriter.write("</head>");

    fileWriter.write("<body>");
    for (tag of tags) {
        fileWriter.write(tag);
    }
    fileWriter.write("</body>");
    fileWriter.write("</html>");
    fileWriter.end();
}

/**
 * @deprecated Used only in spider-ease v1. Use spider-ease v2 for new SPs
 */
async function download(id, originalHtmlPath, metadataPath, page, url, params, encoding = "utf8") {
    var loadedUrl;
    if (fs.existsSync(originalHtmlPath)) {
        console.log("using existing cache file");
        let metaDataString = fs.readFileSync(metadataPath, encoding);
        let metaData = JSON.parse(metaDataString);
        loadedUrl = metaData["uri"];
        const contentHtml = fs.readFileSync(originalHtmlPath, encoding);
        await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
    } else {
        console.log("downloading new cache file");
        var response;
        if (params) {
            response = await page.goto(url, params);
        } else {
            response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
        }
        const headers = response.headers();
        loadedUrl = await page.url(); // to support the redirected pages to preseve the loaded URL instead passing URL
        var metaData = await getMetaData(id, loadedUrl, headers);
        await fs.writeFileSync(metadataPath, JSON.stringify(metaData, null, 2), encoding);
        const html = await page.content();
        await fs.writeFileSync(originalHtmlPath, html, encoding);
    }
    console.log("loaded url:" + loadedUrl);
    return loadedUrl;
}

async function downloadPage(page, url, sp, path, params, encoding = "utf8") {
    const id = sha1(url);
    const outputPath = pathLib.join(path, sp);
    const originalHtmlPath = pathLib.join(outputPath, id + "_original.html");
    const metadataPath = pathLib.join(outputPath, id + ".json");
    var loadedUrl;
    if (fs.existsSync(originalHtmlPath)) {
        console.log("using existing cache file");

        if (fs.existsSync(metadataPath)) {
            let metaDataString = fs.readFileSync(metadataPath, encoding);
            let metaData = JSON.parse(metaDataString);
            loadedUrl = metaData["uri"];
        } else {
            loadedUrl = url;
        }
        const contentHtml = fs.readFileSync(originalHtmlPath, encoding);
        await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
    } else {
        console.log("downloading new cache file");
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }
        var response;
        if (params) {
            response = await page.goto(url, params);
        } else {
            response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
        }
        const headers = response.headers();
        loadedUrl = await page.url(); // to support the redirected pages to preseve the loaded URL instead passing URL
        var metaData = await getMetaData(id, loadedUrl, headers);
        await fs.writeFileSync(metadataPath, JSON.stringify(metaData, null, 2), encoding);
        const html = await page.content();
        await fs.writeFileSync(originalHtmlPath, html, encoding);
    }
    console.log("loaded url:" + loadedUrl);

    page.on("console", (msg) => console.log(msg.text()));
    await page.addStyleTag({ path: style });
    await page.addScriptTag({ path: script });

    return loadedUrl;
}

async function loadPage(page, url, sp, path, encoding = "utf8") {
    const id = sha1(url);
    const outputPath = pathLib.join(path, sp);
    const htmlPath = pathLib.join(outputPath, id + "_annotated.html");
    if (!fs.existsSync(htmlPath)) {
        throw id + "_annotated.html file not found. makesure it exists in the outputPath:" + outputPath
    }
    console.log("using existing cache file");
    const contentHtml = fs.readFileSync(htmlPath, encoding);
    await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });

    page.on("console", (msg) => console.log(msg.text()));
    await page.addStyleTag({ path: style });
    await page.addScriptTag({ path: script });

    return url;
}

async function getMetaData(id, loadedUrl, headers) {
    return {
        "uri": loadedUrl,
        "cachedUri": id,
        "contentType": headers["content-type"],
        "cachedDateTimeOffset": new Date().toISOString(),
        "changeDetectionAttributes": await getChangeDetectionAttributes(headers)
    };
}

async function getChangeDetectionAttributes(headers) {
    const changeDetectionAttributes = [];
    if (headers["content-length"]) {
        changeDetectionAttributes.push({
            "name": "Content-Length", "value": headers["content-length"]
        });
    }
    if (headers["last-modified"]) {
        changeDetectionAttributes.push({
            "name": "Last-Modified", "value": headers["last-modified"]
        });
    }
    if (headers["etag"]) {
        changeDetectionAttributes.push({ "name": "ETag", "value": headers["etag"].replaceAll('"', '') });
    }
    return changeDetectionAttributes;
}

async function writeReLocatedDOM(url, sp, path, page, data, encoding = "utf8") {
    const id = sha1(url);
    const outputPath = pathLib.join(path, sp);
    const reLocatedHtmlPath = pathLib.join(outputPath, id + ".html");
    var html = await page.content();
    for (record of data) {
        const recordArray = record.split(" ");
        const locationId = recordArray[0];
        const tags = recordArray[1].split(",");
        const beforeTags = [];
        const afterTags = [];
        for (tag of tags) {
            beforeTags.push("</" + tag + ">");
            afterTags.push("<" + tag + ">");
        }
        html = html.replace("<!--BEFORE::" + locationId + "-->", beforeTags.join(""));
        html = html.replace("<!--AFTER::" + locationId + "-->", afterTags.reverse().join(""));
    }
    await fs.writeFileSync(reLocatedHtmlPath, html, encoding);
}

async function writeCleaupDOM(url, sp, path, page, encoding = "utf8") {
    const id = sha1(url);
    const outputPath = pathLib.join(path, sp);
    const cleanedHtmlPath = pathLib.join(outputPath, id + ".html");
    const html = await page.content();
    await fs.writeFileSync(cleanedHtmlPath, html, encoding);
}

async function reLocatePage(page, url, sp, path, keepLevel1InEaseContent, encoding) {
    console.log("calling reLocatePage");
    var data = await page.evaluate(reLocateDOM, keepLevel1InEaseContent);
    await writeReLocatedDOM(url, sp, path, page, data, encoding);
    console.log("ending reLocatePage");
}

async function reLocateDOM(keepLevel1InEaseContent) {
    console.log("calling reLocateDOM keepLevel1InEaseContent:" + keepLevel1InEaseContent);
    var data = [];

    // *******************
    // preparing ease-root
    // *******************
    const easeRootCount = document.querySelectorAll(".ease-root").length;
    if (easeRootCount > 0) {
        throw "[VALIDATION]: ease-root exists !!! please check the HTML content.";
    }
    const root = document.createElement("div");
    root.classList.add("ease-root");
    const level1 = document.querySelectorAll(".level1")[0];
    const issueDate = document.querySelectorAll(".issue-date")[0];
    const effectiveDate = document.querySelectorAll(".effective-date")[0];
    if (keepLevel1InEaseContent) {
        // copy level1
        console.log("going to copy level1");
        root.append(level1.cloneNode(true));
        // to remove level1 styles from ease-content
        for (const level1Child of level1.childNodes) {
            level1.before(level1Child);
        }
        level1.remove();
    } else {
        // move level
        console.log("going to move level1");
        root.append(level1);
    }
    if (issueDate && !Array.from(issueDate.parentNode.classList).includes("ease-root")) {
        if (issueDate.id.startsWith("ease-transient-")) {
            root.append(issueDate);
        } else {
            root.append(issueDate.cloneNode(true));
        }
    }
    if (effectiveDate && !Array.from(effectiveDate.parentNode.classList).includes("ease-root")) {
        if (issueDate.id.startsWith("ease-transient-")) {
            root.append(effectiveDate);
        } else {
            root.append(effectiveDate.cloneNode(true));
        }
    }

    // **********************
    // preparing ease-content
    // **********************
    const easeContentCount = document.querySelectorAll(".ease-content").length;
    if (easeContentCount > 1) {
        throw "[VALIDATION]:multiple ease-content exists !!! please check the HTML content.";
    }
    const content = document.querySelector(".ease-content").cloneNode(true);

    // appending the ease-root and ease-content as 1st and 2nd child of the body
    const body = document.createElement("body");
    body.append(root);
    body.append(content);
    document.querySelector("body").parentNode.replaceChild(body, document.querySelector("body"));

    // relocating ease-content levels
    {
        const levels = document.querySelectorAll(".level2,.level3,.level4,.level5,.level6,.level7,.level8,.level9,.footnote");
        for (const level of levels) {
            const tags = [];
            const uniqueId = Locate(level, level, tags, false);
            if (uniqueId) {
                const position = "EASE-LOCATION-ID:" + uniqueId + " " + tags.toString();
                data.push(position);
                console.log("relocate element: " + "<" + level.tagName.toLowerCase() + " class=\"" + level.getAttribute("class") + "\">" + " with tags:" + tags.toString() + " position:" + position);
            }
        }
    }

    Clear();

    function GenerateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36);
    }

    function Locate(originalNode, currentNode, tags, isRoot) {
        if (currentNode.parentNode.nodeName.toLowerCase() == "div" && Array.from(currentNode.parentNode.classList).includes("ease-content")) {
            if (tags.length == 0) {
                return "";
            } else {
                const uniqueId = GenerateUniqueId();
                const commentBefore = document.createComment("BEFORE::EASE-LOCATION-ID:" + uniqueId);
                originalNode.parentElement.insertBefore(commentBefore, originalNode);
                const commentAfter = document.createComment("AFTER::EASE-LOCATION-ID:" + uniqueId);
                originalNode.after(commentAfter);
                return uniqueId;
            }
        } else {
            tags.push(currentNode.parentNode.nodeName.toLowerCase());
            return Locate(originalNode, currentNode.parentNode, tags, isRoot);
        }
    }

    function Clear() {
        // removing the unwanted content from the original DOM
        const root = document.querySelectorAll(".ease-root")[0];
        const content = document.querySelectorAll(".ease-content")[0];

        var style;
        Array.prototype.forEach.call(document.querySelectorAll("style"), function (node) {
            if (node.textContent.includes("ease-root")) {
                style = node;
            } else {
                node.remove();
            }
        });
        Array.prototype.forEach.call(document.querySelectorAll("link"), function (node) { node.remove(); });
        Array.prototype.forEach.call(document.querySelectorAll("script"), function (node) { node.remove(); });

        const head = document.createElement("head");
        head.append(style);
        document.querySelectorAll("head")[0].remove();
        document.getElementsByTagName("html")[0].append(head);

        const body = document.createElement("body");
        body.append(root);
        body.append(content);
        document.querySelectorAll("body")[0].remove();
        document.getElementsByTagName("html")[0].append(body);
    }

    console.log("ending reLocateDOM");
    return Promise.resolve(data);
}

async function cleanupPage(page, url, sp, path, encoding) {
    console.log("calling cleanupPage");
    const count = await page.evaluate(cleanupDOM, 0);
    console.log("removed " + count + " hidden element(s)");
    await writeCleaupDOM(url, sp, path, page, encoding);
    console.log("ending cleanupPage");
}

async function cleanupDOM(count) {
    console.log("calling cleanupDOM");
    function clean(node) {
        const childNodes = node.childNodes;
        for (childNode of childNodes) {
            clean(childNode);
        }
        if (node.nodeType == Node.ELEMENT_NODE) {
            if (node.offsetParent == null || node.style.visibility.toLowerCase() == "hidden" || window.getComputedStyle(node).display.toLowerCase() == "none" || window.getComputedStyle(node).visibility.toLowerCase() == "hidden") {
                //console.log("removing hidden element:" + node.nodeName);
                node.remove();
                count++;
            }
        }
    }

    for (node of document.querySelectorAll("body > *")) {
        clean(node);
    }
    console.log("ending cleanupDOM");
    return Promise.resolve(count);
}

async function writePage(page, url, sp, path, executeWriteAnnotatedPage, executeCleanupPage, keepLevel1InEaseContent, encoding = "utf8") {
    console.log("calling writePage");
    if (executeWriteAnnotatedPage) {
        await writeAnnotatedPage(url, path, sp, page, encoding);
    }
    if (executeCleanupPage) {
        await cleanupPage(page, url, sp, path, encoding);
    }
    await reLocatePage(page, url, sp, path, keepLevel1InEaseContent, encoding);
    console.log("ending writePage");
}

async function writeAnnotatedPage(url, path, sp, page, encoding = "utf8") {
    console.log("calling writeAnnotatedPage");
    const id = sha1(url);
    const outputPath = pathLib.join(path, sp);
    const annotatedHtmlPath = pathLib.join(outputPath, id + "_annotated.html");
    var html = await page.content();
    await fs.writeFileSync(annotatedHtmlPath, html, encoding);
    console.log("ending writeAnnotatedPage");
}

function puppeteer() {
    const stealthPlugin = require("puppeteer-extra-plugin-stealth");
    const puppeteer = require("puppeteer-extra").use(stealthPlugin());
    return puppeteer;
}

function test() {
    const test = require("../../tests/common/base.test");
    return test;
}

exports.createFolder = createFolder;
exports.download = download;
exports.build = build;
exports.cleanupPage = cleanupPage;
exports.writePage = writePage;
exports.downloadPage = downloadPage;
exports.loadPage = loadPage;
exports.puppeteer = puppeteer;
exports.test = test;