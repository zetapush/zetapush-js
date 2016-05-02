#!/bin/bash

npm run build
scp ./dist/zetapush.js ubuntu@54.171.164.234:/var/www/static.zpush.io/js/2.0.0-alpha.6/
