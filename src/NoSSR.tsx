/**
 * prevents ssr of a component
 * @param For Component which shouldn't run on the server
 * @param children Children of "For"
 * @param extra Any Extra props for "For"
 */
export default function ({For, children, ...extra}) {
    if (!For)
        throw new Error("No ForComponent prop was provided to NoSSR Component.");
    if (FireJSX.isSSR)
        return <>{children}</>
    else
        return <For {...extra}>
            {children}
        </For>
}
