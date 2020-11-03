/**
 * Prevent page navigation by binding to window.onbeforeunload event listener
 * @param msg confirmation message
 */
export default function (msg: string = "You might have some unsaved work. Do you really want to navigate ?") {
    React.useEffect(() => {
        window.onbeforeunload = () => confirm(msg)
        return () => window.onbeforeunload = void 0;
    })
}
