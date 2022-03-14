const fs = require("fs");
const sha1 = require('js-sha1');

function createFolder(url, sp, path) {
    const id = sha1(url);
    const outputPath = path + "\\" + sp;
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
    fileWriter.write("<head>");
    fileWriter.write("<style>");
    fileWriter.write("   br  {content: '';margin: 1em;display: block; }");
    fileWriter.write("  .h1  {font-size: 32px;font-weight: bold;background-color: #7A8BF5;}");
    fileWriter.write("  .h2  {font-size: 24px;font-weight: bold;background-color: #FFF714;}");
    fileWriter.write("  .h3  {font-size: 18.72px;font-weight: bold;background-color: #FF3333;}");
    fileWriter.write("  .h4  {font-size: 16px;font-weight: bold;background-color: #6CC46C;}");
    fileWriter.write("  .h5  {font-size: 13.28px;font-weight: bold;background-color: #C56CF5;}");
    fileWriter.write("  .h6  {font-size: 12px;font-weight: bold;background-color: #19FFF4;}");
    fileWriter.write("  .h7  {font-size: 11px;font-weight: bold;background-color: #32FF24;}");
    fileWriter.write("  .h8  {font-size: 10px;font-weight: bold;background-color: #FF33BB;}");
    fileWriter.write("  .h9  {font-size: 9px;font-weight: bold;background-color: #85ADAD;}");
    fileWriter.write("  .h10 {font-size: 8px;font-weight: bold;background-color: #FFB84D;}");
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

exports.createFolder = createFolder;
exports.download = download;
exports.build = build;