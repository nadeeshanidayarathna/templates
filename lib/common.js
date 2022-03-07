const fs = require("fs");
const sha1 = require('js-sha1');

function createFolder(url, sp) {
    const id = sha1(url);
    const outputPath = "downloads\\" + sp;
    const downloadPath = outputPath + "\\" + id + ".html";
    const buildPath = outputPath + "\\" + id;
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    return { downloadPath, buildPath };
}

function download(downloadPath, html) {
    fs.writeFileSync(downloadPath, html);
}

function build(buildPath, tags) {

}

exports.createFolder = createFolder;
exports.download = download;
exports.build = build;