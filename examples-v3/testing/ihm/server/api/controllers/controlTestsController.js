'use strict';

const { spawn } = require('child_process');


exports.startAllTests = function(req, res) {
    console.log('Start all tests...')
    const result = []

    const startAllTests = spawn('../../../node_modules/.bin/mocha', ['../../mocha/', '--exit']);

    //child.stdout.setEncoding('utf8');
    startAllTests.stdout.on('data', (chunk) => {
        result.push(chunk.toString('utf-8'))
    });


    startAllTests.on('close', (code) => {
        console.log(`startAllTests process exited with code : ${code}`)
        if (result.length > 0) {
            console.log('Result of startAllTests sent to client')
            res.end(JSON.stringify(result))
        } else {
            console.warn('No result for startAllTests process')
            res.end('No result for startAllTests process')
        }
    })
}