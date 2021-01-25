import {join} from "path"

export default function ({types: t}) {
    const WrapJsPath = join(__dirname, "../web/Wrap")
    return {
        visitor: {
            "ExportDefaultDeclaration"(path, {filename, opts: {pagesPath, proOrSSR}}: {
                filename: string,
                opts: {
                    pagesPath: string,
                    proOrSSR: boolean
                }
            }) {
                const filenames = filename.split(pagesPath);
                //if filename starts with pagesPath then split returns empty string at index 0
                if (!filenames[0]) {
                    path.replaceWith(t.callExpression(
                        t.memberExpression(
                            t.callExpression(
                                t.identifier("require"),
                                [
                                    t.stringLiteral(WrapJsPath)
                                ]
                            ),
                            t.identifier("default")
                        ),
                        [
                            t.stringLiteral(filenames[1].replace(/\\/g, "/").substring(1)),
                            t.toExpression(path.node.declaration),
                            ...(proOrSSR ? [] :
                                    [
                                        t.memberExpression(
                                            t.callExpression(
                                                t.identifier("require"),
                                                [
                                                    t.stringLiteral("react-hot-loader/root")
                                                ]
                                            ),
                                            t.identifier("hot")
                                        )
                                    ]
                            )
                        ])
                    )
                }
            }
        }
    }
}
