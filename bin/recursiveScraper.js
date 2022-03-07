#!/usr/bin/env node
'use strict';
const recursiveScraper = require('../lib')
const yargs = require('yargs')
    .usage('Usage $0 --url=["<URL>"] --sp="<STARTPOINT>"')
    .demand('url')
    .describe('url', 'Mention the url to scrap')
    .demand('sp')
    .describe('sp', 'Mention the startpoint class to scrap')
    .argv

recursiveScraper(yargs.url, yargs.sp, yargs.retry)