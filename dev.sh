#!/usr/bin/env bash

docker run --rm -ti \
	-v $(pwd -P):/code \
	-p${WEB_PORT:-3000}:4321 \
	--workdir /code \
	--user 1000 \
	--entrypoint bash \
	node:20 ${@:--c 'npm i --force && npm run dev'}
