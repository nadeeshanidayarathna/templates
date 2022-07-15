function wrapElement(document, element, level) {
    const div = document.createElement("div");
    div.title = level;
    div.classList.add(level);
    element.after(div);
    div.insertBefore(element, div.firstChild);
}

function wrapElements(document, elements, level) {
    for (element of elements) {
        const div = document.createElement("div");
        div.title = level;
        div.classList.add(level);
        element.after(div);
        div.insertBefore(element, div.firstChild);
    }
}

function wrapElementDate(document, element, level, value) {
    const div = document.createElement("div");
    div.classList.add(level);
    element.after(div);
    element.textContent = value;
    div.title = level;
    div.insertBefore(element, div.firstChild);
    div.textContent = value;
}