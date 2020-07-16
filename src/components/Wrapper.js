export default function (app) {
    FireJSX.app = FireJSX.isSSR ? FireJSX.app : require('react-hot-loader/root').hot(props => React.createElement(app, props))
}