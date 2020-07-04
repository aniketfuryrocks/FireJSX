FireJSX.app = FireJSX.isSSR ? __FIREJSX_APP__.default :
    require('react-hot-loader/root').hot(
        (props) => React.createElement(__FIREJSX_APP__.default, props))