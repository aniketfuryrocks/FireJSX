const {writeFileSync} = require('fs')
const FlySSR = require("../dist/FlySSR.js").default;

(async () => {
    const ssr = new FlySSR('out/fly');
    await ssr.loadGlobalPlugin('./plugin/exportListener.js', undefined, {_: ["--wait"]})
    writeFileSync("404.html", (await ssr.render("404.js", "/404")).html);
})()