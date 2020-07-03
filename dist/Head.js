import {Helmet} from "react-helmet"

export default ({children}) => {
    return (
        <Helmet>
            {children}
        </Helmet>
    )
}