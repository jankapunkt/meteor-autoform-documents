#!/usr/bin/env bash

cd tests && mkdir -p packages && ln -s ../package/ ./packages/autoform-documents
meteor npm install
