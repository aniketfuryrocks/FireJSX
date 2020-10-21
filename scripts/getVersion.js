//get version from package.json
const package_ver = JSON.parse(require("fs").readFileSync("dist/package.json").toString()).version;
//get version from GlobalsSetter
require("../dist/GlobalsSetter.js");
//check if package.json and GlobalSetter Versions match
if (FireJSX.version === package_ver)
    console.log(package_ver);
else
    process.exit(1);//exit with error
