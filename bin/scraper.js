#!/usr/bin/env node
'use strict';
const yargs = require('yargs')
    .usage('Usage $0 --url="<URL>" --sp="<STARTPOINT>"')
    .demand('url')
    .describe('url', 'Mention the url to scrape')
    .demand('sp')
    .describe('sp', 'Mention the startpoint class to scrape')
    .demand('path')
    .describe('path', 'Mention the download directory path')
    .argv;

const line = '-'.repeat(process.stdout.columns)
try {
    console.log(line);
    const country = yargs.sp.split("--")[0];
    const ib = yargs.sp.split("--")[1];
    const scraper = require(`../lib/templates/${country}/${ib}/${yargs.sp}`);
    scraper(yargs.url, yargs.sp, yargs.path);
    console.log(line);
} catch (e) {
    console.error("scraper not found!", e);
    console.log(line);
    process.exit(1);
}