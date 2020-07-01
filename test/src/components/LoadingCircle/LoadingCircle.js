import Loader2 from "./Style.css";

export default () => {
    return (
        <div className={Loader2.loader}>
            <div className={Loader2.loaderInner}>
                <div className={Loader2.loaderLineWrap}>
                    <div className={Loader2.loaderLine}/>
                </div>
                <div className={Loader2.loaderLineWrap}>
                    <div className={Loader2.loaderLine}/>
                </div>
                <div className={Loader2.loaderLineWrap}>
                    <div className={Loader2.loaderLine}/>
                </div>
                <div className={Loader2.loaderLineWrap}>
                    <div className={Loader2.loaderLine}/>
                </div>
                <div className={Loader2.loaderLineWrap}>
                    <div className={Loader2.loaderLine}/>
                </div>
            </div>
        </div>
    )
}