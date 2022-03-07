#!/usr/bin/env node
'use strict';
const recursiveScraper = require('../lib')
const yargs = require('yargs')
    .usage('Usage $0 --url="<URL>" --css="<CSS_SELECTOR>" --retry=<Number>')
    .demand('url')
    .demand('css')
    .describe('url','Given a url  can crawl the page and save html to fs')
    .describe('css', 'Mention the css selector class to scrap')
    .describe('retry', 'Limit the number of times new browser instance initiated to continue crawl')
    .argv

    recursiveScraper(yargs.url,yargs.css,yargs.retry)