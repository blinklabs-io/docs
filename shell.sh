#!/usr/bin/env bash

docker run --rm -ti \
	-v $(pwd -P):/code \
	-p${WEB_PORT:-3000}:3000 \
	--workdir /code \
	--user 1000 \
	--entrypoint bash \
	node:20
