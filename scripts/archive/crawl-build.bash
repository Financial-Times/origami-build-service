#!/bin/bash
xargs -L1 wget --user-agent="" --execute="robots=off" --spider --convert-links --mirror --accept-regex="(.+)build(.+)v[1|2]" 2>&1 | grep '^--' | awk '{ print $3 }' | awk '!x[$0]++'
