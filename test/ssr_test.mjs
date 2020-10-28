import {writeFileSync} from "fs";
import SSR from "../dist/SSR.js";

const ssr = new SSR.default('./out/fly');
writeFileSync("404.html", ssr.render("404.jsx", "/404")[0])

