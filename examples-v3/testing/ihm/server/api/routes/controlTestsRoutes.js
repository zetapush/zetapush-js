'use strict';

module.exports = function(app) {
    var controlTestsController = require('../controllers/controlTestsController')

    // Routes of the testing controller
    app.route('/tests/startAll')
        .get(controlTestsController.startAllTests);


}