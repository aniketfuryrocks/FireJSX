import {writeFileSync} from "fs";
import SSR from "../dist/SSR.js";

const ssr = new SSR.default('./out/fly');
writeFileSync("404.html", ssr.render("index.jsx", "/index")[0])

