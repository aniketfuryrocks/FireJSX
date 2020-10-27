const {writeFileSync} = require('fs')
const FlySSR = require("../dist/FlySSR.js").default;

const ssr = new FlySSR('./out/fly');
writeFileSync("404.html", ssr.render("404.jsx", "/404")[0])

