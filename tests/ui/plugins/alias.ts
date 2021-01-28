import {resolve} from "path";
import {Actions} from "firejsx/types/Plugin";

export default function ({initWebpack}: Actions) {
    initWebpack(config => {
        config.resolve.alias = {
            firejsx: resolve(__dirname, "../../../dist")
        }
    })
}