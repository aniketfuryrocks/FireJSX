export default //hello
() => {
    const [seconds, setSeconds] = React.useState(0);
    React.useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(seconds + 1)
        }, 1000);
        return () => clearInterval(interval)
    })
    return (
        <div>
            {seconds} asdjs asdm, aasbdukasdb as bhdlash diu aasdasdasd
            {seconds} asdjs asdm, aasbdukasdb as bhdlash diu aasdasdasd
        </div>
    )
}//hello comment
