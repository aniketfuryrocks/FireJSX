//get version from package.json
const package_ver = JSON.parse(require("fs").readFileSync("dist/package.json").toString()).version;
//check if package.json and GlobalSetter Versions match
if (require("../dist/Globals.js").FireJSX_Version === package_ver)
    console.log(package_ver);
else
    process.exit(1);//exit with error
