const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra").use(stealthPlugin());
const base = require("../../../common/base");
const test = require("../../../../tests/IR--CBI--REG--CRI-0.test");

const scraper = async function download(url, sp, path) {
    try {
        console.log("callings scraper url:" + url + " sp:" + sp + " path:" + path);
        const { id, originalHtmlPath, buildHtmlPath, originalTextPath, buildTextPath, metadataPath } = await base.createFolder(url, sp, path);
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false
        });

        {
            // 1.Download
            console.log("getting url:" + url);
            const page = await browser.newPage();
            url = await base.download(id, originalHtmlPath, metadataPath, page, url);

            // 2.Identify
            // 3.Collect
            await page.waitForSelector("#content");
            page.on("console", (msg) => console.log(msg.text()));
            var tags = await page.evaluate(function process(url) {
                var tags = [];

                // ################
                // # root:heading #
                // ################
                try { tags.push("<div class='ease-root'>"); } catch (e) { }

                const rootTitle = document.querySelectorAll('#content h1');
                try { tags.push("<div class='level1' title='level1'>" + rootTitle[0].outerHTML + "</div>"); } catch (e) { }
                const dateStrings = document.querySelectorAll('.coverpage > p > b');
                for (const dateString of dateStrings) {
                    if (dateString.textContent.startsWith('Updated')) {
                        const date = /\d+\s+\w+/.exec(dateString.textContent);
                        const year = /\d{4}/.exec(dateString.textContent);
                        const issueDate = date[0] + "," + year[0];
                        try { tags.push("<div class='issue-date' title='issue-date'>" + (new Date(issueDate).getFullYear()) + "-" + ("0" + (new Date(issueDate).getMonth() + 1)).slice(-2) + "-" + ("0" + (new Date(issueDate).getDate())).slice(-2) + "T00:00:00</div>"); } catch (e) { }
                    }
                }

                try { tags.push("</div>"); } catch (e) { }

                // ################
                // # main:content #
                // ################

                // remove hidden & unwanted elements + correcting links for img and a tags
                Array.prototype.forEach.call(document.getElementsByTagName("img"), function (node) { const src = node.getAttribute("src"); if (src != null && src.length > 0) { if (src.charAt(0) == "#") { node.setAttribute("src", url + src); } else if (src.charAt(0) == "h") { node.setAttribute("src", /\S*en\//.exec((new URL(url)).href) + src); } } });
                Array.prototype.forEach.call(document.getElementsByTagName("a"), function (node) { const href = node.getAttribute("href"); if (href != null && href.length > 0) { if (href.charAt(0) == "#") { node.setAttribute("href", url + href); } else if (href.charAt(0) == "/") { node.setAttribute("href", (new URL(url)).origin + href); } } });

                function AddTransform(node) {
                    if (node != undefined) {
                        try { tags.push("<div>" + ((node.nodeType == Node.TEXT_NODE) ? node.textContent : node.outerHTML) + "</div>"); } catch (e) { }
                    }
                }
                function AddTransforms(nodes) {
                    for (node of nodes) {
                        AddTransform(node);
                    }
                }

                try { tags.push("<div class='ease-content'>"); } catch (e) { }
                {
                    const coverTransform = document.querySelectorAll('.frontmatter .coverpage');
                    coverTransform[0].childNodes[1].remove();
                    AddTransform(coverTransform[0]);

                    const elementNarratives = document.querySelectorAll('.narrative');
                    for (const elementNarrative of elementNarratives) {
                        for (const elements of elementNarrative.childNodes) {
                            if (elements.nodeType != 3) {
                                if (elements.tagName == 'P' && elements.className == 'heading') {
                                    try { tags.push("<div class='level2' title='level2'>" + elements.outerHTML + "</div>"); } catch (e) { }
                                } else if (elements.tagName == 'P' && (elements.outerText.startsWith('REVISED') || elements.outerText.startsWith('CRIMINAL') || elements.outerText.startsWith('Updated') || elements.outerText.startsWith('Number'))) {
                                    elements.remove();
                                } else if (elements.tagName == 'P' && elements.childNodes[1] != undefined) {
                                    if (elements.childNodes[1].tagName == 'IMG') {
                                        elements.remove();
                                    } else {
                                        AddTransform(elements);
                                    }
                                } else if (elements.tagName == 'DIV' && elements.outerText == "") {
                                    elements.remove();
                                } else {
                                    AddTransform(elements);
                                }
                            }
                        }
                    }

                    let scrape = false;
                    const elements = document.querySelectorAll('.frontmatter');
                    for (const element of elements[0].childNodes) {
                        if (element.className == 'actsreferredto') {
                            scrape = true;
                        }
                        if (scrape == true) {
                            if (element.tagName == 'P' && element.outerText != "") {

                                if (element.tagName == 'P' && (element.outerText.startsWith('REVISED') || element.outerText.startsWith('CRIMINAL') || element.outerText.startsWith('Updated') || element.outerText.startsWith('Number'))) {
                                    element.remove();
                                } else {
                                    AddTransform(element);
                                }

                            } else if (element.className != 'actsreferredto' && element.outerText != "" && element.className != 'actnumber') {
                                AddTransform(element);
                            }
                        }
                    }

                    const bodyElements = document.querySelectorAll('.body > .part');
                    for (const bodyElement of bodyElements) {
                        for (const elements of bodyElement.childNodes) {
                            if (elements.className == 'title') {
                                try { tags.push("<div class='level2' title='level2'>" + elements.textContent + "</div>"); } catch (e) { }
                            } else if (elements.className == 'sect') {
                                for (const element of elements.childNodes) {
                                    if (element.className == 'title') {
                                        try { tags.push("<div class='level3' title='level3'>" + element.outerHTML + "</div>"); } catch (e) { }
                                    } else if (element.className != 'number') {
                                        if (element.textContent.startsWith('(') && !(element.textContent.startsWith('(i') || element.textContent.startsWith('(v') || element.textContent.startsWith('(I') || element.textContent.startsWith('(a') || element.textContent.startsWith('(b') || element.textContent.startsWith('(c') || element.textContent.startsWith('(d') || element.textContent.startsWith('(e') || element.textContent.startsWith('(f') || element.textContent.startsWith('(g') || element.textContent.startsWith('(h') || element.outerText.startsWith('(2) For those purposes—') || element.outerText.startsWith('(3) Nothing in this section') || element.outerText.startsWith('(4) This section has effect'))) {
                                            const titleString = element.textContent.slice(0, 3);
                                            const transformString = element.textContent.slice(3, element.textContent.length);
                                            try { tags.push("<div class='level4' title='level4'>" + titleString + "</div>"); } catch (e) { }
                                            try { tags.push("<div>" + transformString + "</div>"); } catch (e) { }
                                        } else if (element.textContent.includes('.— (1)') && element.tagName == 'P') {
                                            if (element.textContent.charAt(2) == '.') {
                                                const transformString1 = element.textContent.slice(0, 5);
                                                const titleString = element.textContent.slice(5, 8);
                                                const transformString2 = element.textContent.slice(8, element.textContent.length);
                                                try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                try { tags.push("<div class='level4' title='level4'>" + titleString + "</div>"); } catch (e) { }
                                                try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                            } else if (element.textContent.charAt(6) == '(') {
                                                const transformString1 = element.textContent.slice(0, 6);
                                                const titleString = element.textContent.slice(6, 9);
                                                const transformString2 = element.textContent.slice(9, element.textContent.length);
                                                try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                try { tags.push("<div class='level4' title='level4'>" + titleString + "</div>"); } catch (e) { }
                                                try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                            } else if (!(element.textContent.startsWith('33ANA'))) {
                                                const transformString1 = element.textContent.slice(0, 4);
                                                const titleString = element.textContent.slice(4, 7);
                                                const transformString2 = element.textContent.slice(7, element.textContent.length);
                                                try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                try { tags.push("<div class='level4' title='level4'>" + titleString + "</div>"); } catch (e) { }
                                                try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                            } else {
                                                AddTransform(element);
                                            }
                                        } else if (element.textContent.includes('. (1)') && element.tagName == 'P') {
                                            if (element.textContent.charAt(6) == '(' && element.textContent.charAt(7) == '1') {
                                                const transformString1 = element.textContent.slice(0, 6);
                                                const titleString = element.textContent.slice(6, 9);
                                                const transformString2 = element.textContent.slice(9, element.textContent.length);
                                                try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                try { tags.push("<div class='level4' title='level4'>" + titleString + "</div>"); } catch (e) { }
                                                try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                            }
                                        } else if (element.textContent.charAt(0) == 'F' && element.textContent.charAt(3) == '(' && element.textContent.charAt(5) == ')') {
                                            const transformString1 = element.textContent.slice(0, 3);
                                            const titleString = element.textContent.slice(3, 6);
                                            const transformString2 = element.textContent.slice(6, element.textContent.length);
                                            try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                            try { tags.push("<div class='level4' title='level4'>" + titleString + "</div>"); } catch (e) { }
                                            try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                        } else if (element.textContent.charAt(0) == 'F' && element.textContent.charAt(4) == '(' && element.textContent.charAt(6) == ')') {
                                            const transformString1 = element.textContent.slice(0, 4);
                                            const titleString = element.textContent.slice(4, 7);
                                            const transformString2 = element.textContent.slice(7, element.textContent.length);
                                            try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                            try { tags.push("<div class='level4' title='level4'>" + titleString + "</div>"); } catch (e) { }
                                            try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                        } else {
                                            AddTransform(element);
                                        }
                                    }
                                }
                            } else if (elements.className == 'chapter') {
                                for (const element of elements.childNodes) {
                                    if (element.className == 'title') {
                                        if (element.outerText.startsWith('Chapter')) {
                                            try { tags.push("<div class='level3' title='level3'>" + element.textContent + "</div>"); } catch (e) { }
                                        } else {
                                            try { tags.push("<div class='level3' title='level3'>" + element.childNodes[1].textContent + " " + element.childNodes[3].textContent + "</div>"); } catch (e) { }
                                            AddTransform(element.childNodes[5]);
                                        }
                                    } else if (element.className == 'sect') {
                                        for (const childs of element.childNodes) {
                                            if (childs.className == 'title') {
                                                try { tags.push("<div class='level4' title='level4'>" + childs.textContent + "</div>"); } catch (e) { }
                                            } else if (childs.className != 'number' && childs.tagName == 'P') {
                                                if (childs.textContent.startsWith('(') && !(childs.textContent.startsWith('(i') || childs.textContent.startsWith('(a') || childs.textContent.startsWith('(b') || childs.textContent.startsWith('(c') || childs.textContent.startsWith('(d') || childs.textContent.startsWith('(e') || childs.textContent.startsWith('(f') || childs.textContent.startsWith('(g') || childs.textContent.startsWith('(h') || childs.textContent.startsWith('(i') || childs.textContent.startsWith('(j') || childs.textContent.startsWith('(k') || childs.textContent.startsWith('(l') || childs.textContent.startsWith('(m') || childs.textContent.startsWith('(n') || childs.textContent.startsWith('(o') || childs.textContent.startsWith('(v'))) {
                                                    if (childs.textContent.charAt(3) == ')') {
                                                        if (childs.textContent.charAt(1) == '1') {
                                                            const titleString = childs.textContent.slice(0, 4);
                                                            const transformString = childs.textContent.slice(4, childs.textContent.length);
                                                            try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                            try { tags.push("<div>" + transformString + "</div>"); } catch (e) { }
                                                        } else {
                                                            AddTransform(childs);
                                                        }
                                                    } else {
                                                        const titleString = childs.textContent.slice(0, 3);
                                                        const transformString = childs.textContent.slice(3, childs.textContent.length);
                                                        try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                        try { tags.push("<div>" + transformString + "</div>"); } catch (e) { }
                                                    }
                                                } else if (childs.outerText.startsWith('(') && childs.outerText.charAt(2) == ')' && !(childs.outerText.charAt(1) == 'i' || childs.outerText.charAt(1) == 'a' || childs.outerText.charAt(1) == 'b' || childs.outerText.charAt(1) == 'c' || childs.outerText.charAt(1) == 'd' || childs.outerText.charAt(1) == 'e' || childs.outerText.charAt(1) == 'f' || childs.outerText.charAt(1) == 'g' || childs.outerText.charAt(1) == 'h' || childs.outerText.charAt(1) == 'i' || childs.outerText.charAt(1) == 'j' || childs.outerText.charAt(1) == 'k' || childs.outerText.charAt(1) == 'l' || childs.outerText.charAt(1) == 'm' || childs.outerText.charAt(1) == 'n' || childs.outerText.charAt(1) == 'o' || childs.outerText.charAt(1) == 'v')) {
                                                    const titleString = childs.outerText.slice(0, 3);
                                                    const transformString = childs.outerText.slice(3, childs.textContent.length);
                                                    try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                    try { tags.push("<div>" + transformString + "</div>"); } catch (e) { }
                                                } else if (childs.textContent.includes('.— (1)') && childs.tagName == 'P') {
                                                    if (childs.textContent.charAt(2) == '.') {
                                                        const transformString1 = childs.textContent.slice(0, 5);
                                                        const titleString = childs.textContent.slice(5, 8);
                                                        const transformString2 = childs.textContent.slice(8, childs.textContent.length);
                                                        try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                        try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                        try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                    } else if (childs.textContent.charAt(6) == '(' && childs.textContent.charAt(8) == ')') {
                                                        const transformString1 = childs.textContent.slice(0, 6);
                                                        const titleString = childs.textContent.slice(6, 9);
                                                        const transformString2 = childs.textContent.slice(9, childs.textContent.length);
                                                        try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                        try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                        try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                    } else {
                                                        const transformString1 = childs.textContent.slice(0, 4);
                                                        const titleString = childs.textContent.slice(4, 7);
                                                        const transformString2 = childs.textContent.slice(7, childs.textContent.length);
                                                        try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                        try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                        try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                    }
                                                } else if (childs.textContent.includes('. (1)') && childs.tagName == 'P') {
                                                    if (childs.textContent.charAt(5) == '(' && childs.textContent.charAt(6) == '1') {
                                                        const transformString1 = childs.textContent.slice(0, 5);
                                                        const titleString = childs.textContent.slice(5, 8);
                                                        const transformString2 = childs.textContent.slice(8, childs.textContent.length);
                                                        try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                        try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                        try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                    } else if (childs.textContent.charAt(8) == '(' && childs.textContent.charAt(9) == '1') {
                                                        const transformString1 = childs.textContent.slice(0, 8);
                                                        const titleString = childs.textContent.slice(8, 11);
                                                        const transformString2 = childs.textContent.slice(11, childs.textContent.length);
                                                        try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                        try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                        try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                    } else if (childs.textContent.charAt(4) == '(' && childs.textContent.charAt(5) == '1') {
                                                        const transformString1 = childs.textContent.slice(0, 4);
                                                        const titleString = childs.textContent.slice(4, 7);
                                                        const transformString2 = childs.textContent.slice(7, childs.textContent.length);
                                                        try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                        try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                        try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                    } else if (childs.textContent.charAt(9) == '(' && childs.textContent.charAt(10) == '1') {
                                                        const transformString1 = childs.textContent.slice(0, 9);
                                                        const titleString = childs.textContent.slice(9, 12);
                                                        const transformString2 = childs.textContent.slice(12, childs.textContent.length);
                                                        try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                        try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                        try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                    } else if (childs.outerText.charAt(6) == '(' && childs.textContent.charAt(7) == '1') {
                                                        const transformString1 = childs.outerText.slice(0, 6);
                                                        const titleString = childs.outerText.slice(6, 9);
                                                        const transformString2 = childs.outerText.slice(9, childs.outerText.length);
                                                        try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                        try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                        try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                    } else if (childs.outerText.charAt(7) == '(' && childs.textContent.charAt(8) == '1') {
                                                        const transformString1 = childs.outerText.slice(0, 7);
                                                        const titleString = childs.outerText.slice(7, 10);
                                                        const transformString2 = childs.outerText.slice(10, childs.outerText.length);
                                                        try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                        try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                        try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                    }
                                                } else if (childs.textContent.includes('.—(1)') && childs.tagName == 'P' && childs.textContent.charAt(4) == '(') {
                                                    const transformString1 = childs.textContent.slice(0, 4);
                                                    const titleString = childs.textContent.slice(4, 7);
                                                    const transformString2 = childs.textContent.slice(7, childs.textContent.length);
                                                    try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                    try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                    try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                } else if (childs.textContent.startsWith('F') && childs.textContent.charAt(4) == '(' && childs.textContent.charAt(6) == ')' && childs.textContent.charAt(5) != 'b' && childs.textContent.charAt(5) != 'g' && childs.textContent.charAt(5) != 'c' && childs.textContent.charAt(5) != 'e' && childs.textContent.charAt(5) != 'f' && childs.textContent.charAt(5) != 'a' && childs.textContent.charAt(5) != 'h' && childs.textContent.charAt(5) != 'd') {
                                                    const transformString1 = childs.textContent.slice(0, 4);
                                                    const titleString = childs.textContent.slice(4, 7);
                                                    const transformString2 = childs.textContent.slice(7, childs.textContent.length);
                                                    try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                    try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                    try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                } else if (childs.textContent.startsWith('F') && childs.textContent.charAt(5) == '(' && childs.textContent.charAt(7) == ')' && childs.textContent.charAt(6) != 'b' && childs.textContent.charAt(6) != 'g' && childs.textContent.charAt(6) != 'c' && childs.textContent.charAt(6) != 'e' && childs.textContent.charAt(6) != 'f' && childs.textContent.charAt(6) != 'a' && childs.textContent.charAt(6) != 'h' && childs.textContent.charAt(6) != 'd') {
                                                    const transformString1 = childs.textContent.slice(0, 5);
                                                    const titleString = childs.textContent.slice(5, 8);
                                                    const transformString2 = childs.textContent.slice(8, childs.textContent.length);
                                                    try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                    try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                    try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                } else if (childs.textContent.startsWith('F') && childs.textContent.charAt(4) == '(' && childs.textContent.charAt(7) == ')' && childs.textContent.charAt(5) == '1' && childs.textContent.charAt(6) != 'A') {
                                                    const transformString1 = childs.textContent.slice(0, 4);
                                                    const titleString = childs.textContent.slice(4, 8);
                                                    const transformString2 = childs.textContent.slice(8, childs.textContent.length);
                                                    try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                    try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                    try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                } else if (childs.outerText.includes('(1)') && childs.outerText.charAt(9) == '(') {
                                                    const transformString1 = childs.outerText.slice(0, 9);
                                                    const titleString = childs.outerText.slice(9, 12);
                                                    const transformString2 = childs.outerText.slice(12, childs.outerText.length);
                                                    try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                    try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                    try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                } else if (childs.outerText.includes('(1)') && childs.outerText.charAt(5) == '(') {
                                                    const transformString1 = childs.outerText.slice(0, 5);
                                                    const titleString = childs.outerText.slice(5, 8);
                                                    const transformString2 = childs.outerText.slice(8, childs.outerText.length);
                                                    try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                    try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                    try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                } else if (childs.outerText.includes('(1)') && childs.outerText.charAt(10) == '(') {
                                                    const transformString1 = childs.outerText.slice(0, 10);
                                                    const titleString = childs.outerText.slice(10, 13);
                                                    const transformString2 = childs.outerText.slice(13, childs.outerText.length);
                                                    try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                    try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                    try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                } else if (childs.outerText.includes('(1)') && childs.outerText.charAt(6) == '(') {
                                                    const transformString1 = childs.outerText.slice(0, 6);
                                                    const titleString = childs.outerText.slice(6, 9);
                                                    const transformString2 = childs.outerText.slice(9, childs.outerText.length);
                                                    try { tags.push("<div>" + transformString1 + "</div>"); } catch (e) { }
                                                    try { tags.push("<div class='level5' title='level5'>" + titleString + "</div>"); } catch (e) { }
                                                    try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                                } else {
                                                    AddTransform(childs);
                                                }
                                            } else if (childs.className != 'number' && childs.tagName != 'P') {
                                                AddTransform(childs);
                                            }
                                        }
                                    } else if (element.className == 'annotations' || element.tagName == 'FOOTER') {
                                        AddTransform(element);
                                    }
                                }
                            } else if (elements.tagName == 'FOOTER' || elements.className == 'annotations') {
                                AddTransform(elements);
                            }
                        }
                    }

                    const scheduleElements = document.querySelectorAll('.backmatter');
                    for (const scheduleElement of scheduleElements[0].childNodes) {
                        if (scheduleElement.tagName == 'SECTION') {
                            for (const elements of scheduleElement.childNodes) {
                                if (elements.nodeType != 3) {
                                    if (elements.className == 'title') {
                                        try { tags.push("<div class='level2' title='level2'>" + elements.textContent + "</div>"); } catch (e) { }
                                    } else if (elements.outerText.startsWith('LIST OF ACTIVITIES')) {
                                        try { tags.push("<div class='level3' title='level3'>" + elements.textContent + "</div>"); } catch (e) { }
                                    } else if (elements.tagName == 'P' && elements.outerText.startsWith('(')) {
                                        if (elements.outerText.charAt(2) == ')' && !(elements.outerText.charAt(1) == 'a' || elements.outerText.charAt(1) == 'b' || elements.outerText.charAt(1) == 'c' || elements.outerText.charAt(1) == 'd' || elements.outerText.charAt(1) == 'e' || elements.outerText.charAt(1) == 'f' || elements.outerText.charAt(1) == 'g')) {
                                            const titleString = elements.outerText.slice(0, 3);
                                            const transformString2 = elements.outerText.slice(3, elements.outerText.length);
                                            try { tags.push("<div class='level3' title='level3'>" + titleString + "</div>"); } catch (e) { }
                                            try { tags.push("<div>" + transformString2 + "</div>"); } catch (e) { }
                                        } else {
                                            AddTransform(elements);
                                        }
                                    } else {
                                        AddTransform(elements);
                                    }
                                }
                            }
                        } else if (scheduleElement.tagName == 'FOOTER') {
                            AddTransform(scheduleElement);
                        }
                    }

                    try { tags.push("</div>"); } catch (e) { }
                }
                return Promise.resolve(tags);
            }, url);
            // 4.Build
            await base.build(buildHtmlPath, tags);
            await page.close();
        }
        await test.runTest(browser, originalHtmlPath, originalTextPath, buildHtmlPath, buildTextPath, "#content", [".actsreferredto", "style", ".number", "ul.nav-tabs", ".acttoc"], "body", []);
        await browser.close();
    } catch (e) {
        console.log(e);
        console.log("Failed to scrape!!!");
        process.exit(1);
    }
}

module.exports = scraper;