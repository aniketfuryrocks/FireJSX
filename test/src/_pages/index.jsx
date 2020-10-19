import LoadingCircle from "../components/LoadingCircle/LoadingCircle";
import Loader from "../../../src/components/Loader";

export default function () {
    return (
        <div>
            asdsdaasd
            <Loader effect={React.useEffect} delay={800}>
                <LoadingCircle/>
            </Loader>
        </div>
    )
}
