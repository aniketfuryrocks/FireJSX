import {join, sep as pathSeparator} from "path"

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
                if (filename.startsWith(pagesPath))
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
                            t.stringLiteral(filename.replace(pagesPath + pathSeparator, "")),
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
