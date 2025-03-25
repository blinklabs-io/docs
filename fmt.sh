#!/usr/bin/env bash

docker run --rm -ti \
	-v $(pwd -P):/code \
	--workdir /code \
	--user 1000 \
	--entrypoint bash \
	node:20 \
	-c 'npx prettier --write .'
