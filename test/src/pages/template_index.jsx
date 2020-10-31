import Link from "../../../dist/Link";

export default ({content: {total}}) => {
    return (
        <div>
            {
                (() => {
                    const elements = [];
                    for (let i = 0; i < total; i++)
                        elements.push(<><Link href={`/template-${i}`}>
                            template {i}
                        </Link><br/></>)
                    return elements
                })()
            }
        </div>
    )
}
