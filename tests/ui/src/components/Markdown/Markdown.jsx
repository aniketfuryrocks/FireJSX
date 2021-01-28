import Style from "./Style.css";
import MJSX from "markdown-to-jsx";

export default ({children}) => {
    return <div className={Style.container}>
        <MJSX>
            {children}
        </MJSX>
    </div>
}
