export default () => {
    const [seconds, setSeconds] = React.useState(0);
    React.useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(seconds + 1)
        }, 1000);
        return () => clearInterval(interval)
    })
    return (
        <div>
            {seconds} d asd asdsadsad asdbnn asd asd asdasd asdasdas
        </div>
    )
}//hello comment
