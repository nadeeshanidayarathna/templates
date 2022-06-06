const fs = require("fs");
const sha1 = require("js-sha1");
const pathLib = require("path");

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

async function download(id, originalHtmlPath, metadataPath, page, url) {
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
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
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

exports.createFolder = createFolder;
exports.download = download;
exports.build = build;