export function writeFileRecursively(path: string, data: string | Buffer, outputFileSystem) {
    return new Promise((resolve, reject) => {
        const dir = path.substr(0, path.lastIndexOf("/"));
        outputFileSystem.mkdirp(dir, err => {
            if (err)
                reject(err);
            else
                outputFileSystem.writeFile(path, data, err => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                })
        })
    })
}

export function readDirRecursively(dir: string, inputFileSystem, callback) {
    const items = inputFileSystem.readdirSync(dir);
    items.forEach(itemName => {
        const path = `${dir}/${itemName}`;
        if (inputFileSystem.statSync(path).isDirectory())
            readDirRecursively(path, inputFileSystem, callback);
        else
            callback(path)
    });
}
