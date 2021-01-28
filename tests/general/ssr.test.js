"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
/*
**run yarn 'ui-run' -Esp before running this
*/
const fs_1 = require("fs");
const SSR_1 = require("firejsx/SSR");
const ssr = new SSR_1.default('./out/fly');
fs_1.writeFileSync("404.html", ssr.render("index.jsx", "/index")[0]);
