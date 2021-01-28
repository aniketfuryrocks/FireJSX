import * as React from "react";
import Link from "firejsx/Link";
import Head from "firejsx/Head";

export default ({content: {total}}) => {
    return (
        <div>
            <Head>
                <title>Template Index</title>
            </Head>
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
