#!/usr/bin/env bash
set -e
mkdir -p .certs
cd .certs
mkcert -install
mkcert app.better-t-ins.test api.better-t-ins.test \
       mail.better-t-ins.test s3.better-t-ins.test \
       storage.better-t-ins.test drizzle-studio.better-t-ins.test \
       react-email.better-t-ins.test