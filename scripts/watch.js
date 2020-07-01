const {watch} = require("chokidar");
const {createReadStream, createWriteStream} = require("fs");
console.log("watching")

watch("src/web")
    .on('add', path =>
        copyFile(path, "dist/web"))
    .on('change', path =>
        copyFile(path, "dist/web"))

watch("src/components")
    .on('add', path =>
        copyFile(path, "dist"))
    .on('change', path =>
        copyFile(path, "dist"))

function copyFile(path, dist) {
    const to = `${dist}/${path.substring(path.lastIndexOf("/") + 1)}`;
    console.log(`Copying ${path} to ${to}`)
    createReadStream(path).pipe(createWriteStream(to));
}