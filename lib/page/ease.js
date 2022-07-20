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

function wrapElements(document, elements, level) {
    for (element of elements) {
        wrapElement(document, element, level);
    }
}

function wrapElementDate(document, level, value) {
    const div = document.createElement("div");
    div.id = "ease-transient-" + level;
    div.title = level;
    div.classList.add(level);
    div.textContent = value;
    document.querySelector(".level1").after(div);
}