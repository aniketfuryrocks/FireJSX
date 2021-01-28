import "../style/hash.css"
import Link from "firejsx/Link";

const colors = ["red", "yellow", "blue", "green"]

export default () => {
    return (
        <div>
            {
                (() => {
                    const links = []
                    const items = []
                    colors.forEach((color, i) => {
                        links.push(<Link href={"/hash#" + i} key={i}><p>{i}</p></Link>)
                        items.push(<div
                            style={{
                                height: "100vh",
                                width: "100vw",
                                backgroundColor: color
                            }}
                            key={i}
                        />)
                    })
                    return <>
                        {links}
                        {items}
                    </>
                })()
            }
        </div>
    )
}
