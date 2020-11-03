/**
 * Prevent page navigation by binding to window.onbeforeunload event listener
 * @param msg confirmation message
 * @param dontPrevent do not prevent navigation
 */
export default function (msg: string = "You might have some unsaved work. Do you really want to navigate ?", dontPrevent: boolean = false) {
    React.useEffect(() => {
        if (dontPrevent)
            return window.onbeforeunload = undefined;
        window.onbeforeunload = () => confirm(msg)
        return () => window.onbeforeunload = void 0;
    }, [msg])
}
