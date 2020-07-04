require('react-hot-loader').setConfig({
    showReactDomPatchNotification: false
})
FireJSX.app = require('react-hot-loader/root').hot(
    (props) => React.createElement(__FIREJSX_APP__.default, props))