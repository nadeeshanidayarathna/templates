const fs = require("fs");
const sha1 = require('js-sha1');

function createFolder(url, sp) {
    const id = sha1(url);
    const outputPath = "downloads\\" + sp;
    const downloadPath = outputPath + "\\" + id + ".html";
    const reCreatePath = outputPath + "\\" + id;
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    return { downloadPath, reCreatePath };
}

function download(downloadPath, html) {
    fs.writeFileSync(downloadPath, html);
}

function build(reCreatePath, tags) {
    fs.unlink(reCreatePath, (err => { }));
    var fileWriter = fs.createWriteStream(reCreatePath, {
        flags: 'a'
    });

    fileWriter.write("<html>");
    for (tag of tags) {
        console.log("(" + tag.tag + ")" + tag.text);
        if (["ul", "ol"].includes(tag.tag)) {
            fileWriter.write("<" + tag.tag + ">");
            const lis = tag.lis;
            for (li of lis) {
                console.log("(" + li.tag + ")" + li.text);
                fileWriter.write("<" + li.tag + ">" + li.text + "</" + li.tag + ">");
            }
            fileWriter.write("</" + tag.tag + ">");
        } else {
            fileWriter.write("<" + tag.tag + ">" + tag.text + "</" + tag.tag + ">");
        }
    }
    fileWriter.write("</html>");
}

exports.createFolder = createFolder;
exports.download = download;
exports.build = build;