function wrapElement(document, element, level) {
    const div = document.createElement("div");
    div.title = level;
    div.classList.add(level);
    div.append(element.cloneNode(true));
    element.parentNode.replaceChild(div, element);
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