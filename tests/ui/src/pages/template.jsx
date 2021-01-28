import Head from "firejsx/Head";

export default ({content: {index}}) => {
    return (
        <div>
            <Head>
                <title>Template {index}</title>
            </Head>
            <h1>Template {index}</h1>
        </div>
    )
}
