import * as React from "react";
import Link from "firejsx/Link";

export default ({content: {total}}) => {
    return (
        <div>
            {
                (() => {
                    const elements = [];
                    for (let i = 0; i < total; i++)
                        elements.push(
                            <div key={i}>
                                <Link href={`/template-${i}`}>
                                    template {i}
                                </Link>
                                <br/>
                            </div>
                        )
                    return elements
                })()
            }
        </div>
    )
}
