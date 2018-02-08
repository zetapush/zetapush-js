// TESTS
function startAllTests() {
    const req = new XMLHttpRequest();

    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            console.log('RESPONSE', req.response)
        }
    }

    req.open('GET', 'http://localhost:8080/tests/startAll', false)
    req.send(null)

    if (req.status === 200) {
        console.log('Start all tests')
    } else {
        console.log('Error to start all tests')
    }

    
}