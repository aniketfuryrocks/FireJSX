import {join} from "path"

export default function ({types: t}) {
    const WrapJsPath = join(__dirname, "../web/Wrap")
    return {
        visitor: {
            "ExportDefaultDeclaration"(path, {filename, opts: {pagesPath, proOrSSR}}) {
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
