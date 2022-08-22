function wrapElement(document, element, level) {
    if (!element) {
        throw "wrapElement failed. " + level + " element is null!"
    }
    const div = document.createElement("div");
    div.title = level;
    div.classList.add(level);
    if (element.tagName.toLowerCase() == "body") {
        // cannot wrap body since its a main tag in HTML standard. so wrapping all childs in the body instead
        var nodes = [];
        for (const childNode of element.childNodes) {
            nodes.push(childNode);
        }
        for (const childNode of nodes) {
            div.append(childNode);
        }
        element.append(div);
    } else {
        div.append(element.cloneNode(true));
        element.parentNode.replaceChild(div, element);
    }
}

function wrapElements(document, elements, level, group = false) {
    if (group) {
        const div = document.createElement("div");
        div.title = level;
        div.classList.add(level);
        elements.forEach(function (element, index) {
            if (index == 0) {
                // adding new div parent before the 1st child of the group
                element.parentElement.insertBefore(div, element);
            }
            div.append(element)
        });
    } else {
        for (element of elements) {
            wrapElement(document, element, level);
        }
    }
}

// only use this if the level1 is not available in the page and you wants to match the previous level1 text 100%
function wrapElementLevel1(document, value) {
    const div = document.createElement("div");
    div.id = "ease-transient-level1";
    div.title = "level1";
    div.classList.add("level1");
    div.textContent = value;
    document.querySelector("body").after(div);
}

// pass the date value from the actual page. passing hardcoded value should be the last option if the date is not available in the page
function wrapElementDate(document, level, value) {
    const div = document.createElement("div");
    div.id = "ease-transient-" + level;
    div.title = level;
    div.classList.add(level);
    div.textContent = value;
    document.querySelector(".level1").after(div);
}