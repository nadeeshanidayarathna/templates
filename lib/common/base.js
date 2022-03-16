const fs = require("fs");
const sha1 = require('js-sha1');

async function createFolder(url, sp, path) {
    const id = sha1(url);
    const outputPath = path + "\\" + sp;
    const downloadPath = outputPath + "\\" + id + "_original.html";
    const buildPath = outputPath + "\\" + id + ".html";
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    return { downloadPath, buildPath };
}

async function build(buildPath, tags) {
    fs.unlink(buildPath, (err => { }));
    var fileWriter = fs.createWriteStream(buildPath, {
        flags: 'a'
    });
    fileWriter.write("<html>");
    fileWriter.write("<head>");
    fileWriter.write("<style>");
    fileWriter.write("br {content: '';margin: 1em;display: block;}");
    fileWriter.write(".h1 {font-size: 32px;border-style: solid;border-radius: 10px;border-color: #B2BEB5;background-color: #B2BEB5;text-decoration-color: #B2BEB5;}");
    fileWriter.write(".issue-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #dbe1dd;background-color: #dbe1dd;text-decoration-color: #dbe1dd;}");
    fileWriter.write(".effective-date {font-size: 12px;border-style: solid;border-radius: 10px;border-color: #899b8d;background-color: #899b8d;text-decoration-color: #899b8d;}");
    fileWriter.write(".h2 {font-size: 24px;font-weight: bold;background-color: #a3d7ff;}");
    fileWriter.write(".h3 {font-size: 18.72px;font-weight: bold;background-color: #72ffb6;}");
    fileWriter.write(".h4 {font-size: 16px;font-weight: bold;background-color: #f49fa6;}");
    fileWriter.write(".h5 {font-size: 13.28px;font-weight: bold;background-color: #f7df8a;}");
    fileWriter.write(".h6 {font-size: 12px;font-weight: bold;background-color: #eab3f9;}");
    fileWriter.write(".h7 {font-size: 11px;font-weight: bold;background-color: #17DEEE;}");
    fileWriter.write(".h8 {font-size: 10px;font-weight: bold;background-color: #21B20C;}");
    fileWriter.write(".h9 {font-size: 9px;font-weight: bold;background-color: #FF4162;}");
    fileWriter.write(".h10 {font-size: 8px;font-weight: bold;background-color: #FF7F50;}");
    fileWriter.write("</style>");
    fileWriter.write("</head>");

    fileWriter.write("<body>");
    for (tag of tags) {
        console.log("(tag) " + tag);
        fileWriter.write(tag);
    }
    fileWriter.write("</body>");
    fileWriter.write("</html>");
}

async function download(downloadPath, page, url) {
    if (fs.existsSync(downloadPath)) {
        console.log("using existing cache file");
        const contentHtml = fs.readFileSync(downloadPath, 'utf8');
        await page.setContent(contentHtml);
    } else {
        console.log("downloading new cache file");
        await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
        const html = await page.content();
        await fs.writeFileSync(downloadPath, html);;
    }
}

exports.createFolder = createFolder;
exports.download = download;
exports.build = build;