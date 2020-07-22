import Style from "./Style.css";
import LazyLoad from "../../../../src/components/LazyLoad";

export default ({children}) => {
    const Mark = LazyLoad(() => import("markdown-to-jsx"));
    return <div className={Style.container}>
        <Mark>
            {children}
        </Mark>
    </div>
}