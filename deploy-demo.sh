#!/bin/bash

npm run build

scp -r ./dist/** root@51.255.201.174:/var/www/demo_zetapush/sdk-js-2.0.0-alpha.2/dist/
scp -r ./docs/** root@51.255.201.174:/var/www/demo_zetapush/sdk-js-2.0.0-alpha.2/docs/
scp -r ./examples/** root@51.255.201.174:/var/www/demo_zetapush/sdk-js-2.0.0-alpha.2/examples/
