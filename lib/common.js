const fs = require("fs");
const sha1 = require('js-sha1');

function createFolder(url, sp) {
    const id = sha1(url);
    const outputPath = "downloads\\" + sp;
    const downloadPath = outputPath + "\\" + id + "_original.html";
    const buildPath = outputPath + "\\" + id + ".html";
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    return { downloadPath, buildPath };
}

function download(downloadPath, html) {
    fs.writeFileSync(downloadPath, html);
}

function build(buildPath, tags) {
    fs.unlink(buildPath, (err => { }));
    var fileWriter = fs.createWriteStream(buildPath, {
        flags: 'a'
    });
    fileWriter.write("<html>");
    for (tag of tags) {
        console.log("(" + tag.tag + ") " + tag.text);
        fileWriter.write("<" + tag.tag + ">" + tag.text + "</" + tag.tag + ">");
    }
    fileWriter.write("</html>");
}

exports.createFolder = createFolder;
exports.download = download;
exports.build = build;