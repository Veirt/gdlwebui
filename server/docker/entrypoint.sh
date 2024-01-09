#!/bin/sh

chown -R bun: /usr/src/app/gallery-dl
exec runuser -u bun "$@"
