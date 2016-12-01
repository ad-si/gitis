#! /usr/bin/env node

require('babel-register')

const gitis = require('..')

gitis.default(process.argv.slice(2))
