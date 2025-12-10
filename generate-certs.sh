#!/usr/bin/env bash
set -e
mkdir -p .certs
cd .certs
mkcert -install
mkcert app.tud-box.test api.tud-box.test \
       mail.tud-box.test s3.tud-box.test \
       storage.tud-box.test drizzle-studio.tud-box.test \
       react-email.tud-box.test