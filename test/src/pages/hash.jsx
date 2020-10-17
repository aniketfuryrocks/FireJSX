import Wrap from "../../../src/components/Wrap.js";
import {hot} from "firejsx/Hot"
import "../style/main.css"
import "../style/hash.css"
import Link from "../../../src/components/Link";

const colors = ["red", "yellow", "blue", "green"]

Wrap(() => {
    return (
        <div>
            {
                (() => {
                    const links = []
                    const items = []
                    colors.forEach((color, i) => {
                        links.push(<Link href={"/hash#" + i} key={i}><p>{i}</p></Link>)
                        items.push(<div
                            id={i}
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
}, hot)
