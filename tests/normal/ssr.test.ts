//run yarn manual_test with -Esp before running this
import {writeFileSync} from "fs";
import SSR from "firejsx/SSR";

const ssr = new SSR('./out/fly');
writeFileSync("404.html", ssr.render("index.jsx", "/index")[0])