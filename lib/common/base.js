const fs = require("fs");
const sha1 = require("js-sha1");
const pathLib = require("path");
const validator = require("html-validator");

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

async function build(buildHtmlPath, tags) {
    fs.unlink(buildHtmlPath, (err => { }));
    var fileWriter = fs.createWriteStream(buildHtmlPath, {
        flags: "a"
    });
    fileWriter.write("<html>");
    fileWriter.write("<head>");
    fileWriter.write("<style>");
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

async function download(id, originalHtmlPath, metadataPath, page, url, delayDownload) {
    var loadedUrl;
    if (fs.existsSync(originalHtmlPath)) {
        console.log("using existing cache file");
        let metaDataString = fs.readFileSync(metadataPath, 'utf8');
        let metaData = JSON.parse(metaDataString);
        loadedUrl = metaData["uri"];
        const contentHtml = fs.readFileSync(originalHtmlPath, 'utf8');
        await page.setContent(contentHtml, { waitUntil: "domcontentloaded", timeout: 0 });
    } else {
        console.log("downloading new cache file");
        if(typeof delayDownload === "undefined"){
            var response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
        } else {
            var response = await page.goto(url, delayDownload);
        }
        const headers = response.headers();
        loadedUrl = await page.url(); // to support the redirected pages to preseve the loaded URL instead passing URL
        var metaData = await getMetaData(id, loadedUrl, headers);
        await fs.writeFileSync(metadataPath, JSON.stringify(metaData, null, 2), 'utf-8');
        const html = await page.content();
        await fs.writeFileSync(originalHtmlPath, html);
    }
    console.log("loaded url:" + loadedUrl);
    return loadedUrl;
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

async function writeReLocatedDOM(url, sp, path, page, data) {
    const id = sha1(url);
    const outputPath = pathLib.join(path, sp);
    const reLocatedHtmlPath = pathLib.join(outputPath, id + ".html");
    var html = await page.content();
    validateHtml(html, "before relocation");
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
    validateHtml(html, "after relocation");
    await fs.writeFileSync(reLocatedHtmlPath, html);
}

async function validateHtml(html, alias) {
    const options = {
        format: "text",
        data: html,
        ignore: [
            "Error: Element “head” is missing a required instance of child element “title”.",
            "Error: Start tag seen without seeing a doctype first. Expected “<!DOCTYPE html>”."
        ]
    }
    try {
        const result = await validator(options)
        console.log("[TEST]:validate " + alias + " html test - success! result:" + result);
    } catch (error) {
        console.error(error)
        throw "[TEST]:validate " + alias + " html test - failed!!! please check the HTML whether its having valid start/end tags.";
    }
}

async function writeCleaupDOM(url, sp, path, page) {
    const id = sha1(url);
    const outputPath = pathLib.join(path, sp);
    const cleanedHtmlPath = pathLib.join(outputPath, id + ".html");
    const html = await page.content();
    await fs.writeFileSync(cleanedHtmlPath, html);
}

async function ReLocatePage(page, url, sp, path) {
    console.log("calling ReLocatePage");
    var data = await page.evaluate(ReLocateDOM);
    await writeReLocatedDOM(url, sp, path, page, data);
    console.log("ending ReLocatePage");
}

async function ReLocateDOM() {
    console.log("calling ReLocateDOM");
    var data = [];
    const levels = document.querySelectorAll(".level1,.level2,.level3,.level4,.level5,.level6,.level7,.level8,.level9,.level-alias1,.level-alias2,.level-alias3,.level-alias4,.level-alias5,.level-alias6,.level-alias7,.level-alias8,.level-alias9");
    for (const level of levels) {
        const tags = [];
        const uniqueId = Locate(level, level, tags);
        if (uniqueId) {
            const position = "EASE-LOCATION-ID:" + uniqueId + " " + tags.toString();
            data.push(position);
            console.log("relocate element: " + "<" + level.tagName.toLowerCase() + " class=\"" + level.getAttribute("class") + "\">" + " with tags:" + tags.toString() + " position:" + position);
        }
    }

    function GenerateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36);
    }

    function Locate(originalNode, currentNode, tags) {
        if (currentNode.parentNode.nodeName.toLowerCase() == "body") {
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
            return Locate(originalNode, currentNode.parentNode, tags);
        }
    }

    console.log("ending ReLocateDOM");
    return Promise.resolve(data);
}

async function CleanupPage(page, url, sp, path) {
    console.log("calling CleanupPage");
    await page.evaluate(CleanupDOM);
    await writeCleaupDOM(url, sp, path, page);
    console.log("ending CleanupPage");
}

async function CleanupDOM() {
    console.log("calling CleanupDOM");
    function Clean(node) {
        const childNodes = node.childNodes;
        for (childNode of childNodes) {
            Clean(childNode);
        }
        if (node.nodeType == Node.ELEMENT_NODE) {
            if (node.offsetParent == null || node.style.visibility.toLowerCase() == "hidden") {
                console.log("removing hidden element:" + node.nodeName);
                node.remove();
            }
        }
    }

    for (node of document.querySelectorAll("body > *")) {
        Clean(node);
    }
    console.log("ending CleanupDOM");
    return Promise.resolve();
}

exports.createFolder = createFolder;
exports.download = download;
exports.build = build;
exports.ReLocatePage = ReLocatePage;
exports.CleanupPage = CleanupPage;