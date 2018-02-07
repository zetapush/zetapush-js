// TESTS
function startAllTests() {
    const req = new XMLHttpRequest();
    req.open('GET', 'http://localhost:8080/tests/startAll', false)
    req.send(null)

    if (req.status === 200) {
        console.log('Start all tests OK')
    } else {
        console.log('Error to start all tests')
    }
}