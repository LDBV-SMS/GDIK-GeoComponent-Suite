import olCss from "bundle-text:../../../../node_modules/ol/ol.css";

const template = document.createElement("template"),
    style = document.createElement("style"),
    mapDiv = document.createElement("div"),
    contentSlot = document.createElement("slot");

style.appendChild(document.createTextNode(olCss + `
    .ol-full-screen {
        top: auto;
        bottom: 0.5em;
    }

    .ol-zoom {
        left: auto;
        right: 0.5em;
    }

    .gcs-map-container {
        height: 100%;
        width: 100%;
        margin: auto;
    }

    .gcs-map {
        height: 100%;
        width: 100%;
        margin: auto;
    }

    .gcs-geolocation {
        left: auto;
        right: 0.5em;
        top: 4em;
        bottom: auto;
    }

    .gcs-delete {
        left: 0.5em;
        top: 0.5em;
    }

    .gcs-delete button:disabled {
        background-color: #888;
    }

    .gcs-layerswitcher {
        left: 0.5em;
        bottom: 0.5em;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
    }

    .gcs-layerswitcher.ol-control .hidden {
        display: none;
    }

    .gcs-layerswitcher .closer {
        display: inline-block;
    }

    .gcs-layerswitcher ul {
        padding: 0;
        margin: 0;
        display: inline-block;
        background-color: ghostwhite;
    }

    .gcs-layerswitcher ul li {
        display: block;
        border: 1px solid rgba(0, 0, 0, .125);
        white-space: nowrap;
        padding: 0.2em 0.4em;
    }

    .gcs-layerswitcher ul li.active {
        background-color: #003c8880;
    }

    .gcs-search {
        left: auto;
        right: auto;
        width: 60%;
        top: 0.5em;
        bottom: auto;
        margin: 0 auto;
        position: relative;
    }

    .gcs-search input {
        width: 100%;
    }

    .gcs-search .gcs-search-results div {
        padding: 2px;
        background-color: white;
        cursor: pointer;
    }

    .gcs-search .gcs-search-results div:nth-child(odd) {
        padding: 2px;
        background-color: whitesmoke;
    }

    .gcs-search .gcs-search-results div:last-child {
        border-radius: 0 0 4px 4px;
    }

    .gcs-search .gcs-search-results div:hover {
        background-color: lightgray;
    }

    .gcs-delete button.active,
    .gcs-delete button.active:before {
        border: 2px solid #dc3545;
    }
`));

mapDiv.className = "gcs-map";
contentSlot.name = "content";


template.appendChild(style);
template.appendChild(mapDiv);
template.appendChild(contentSlot);

export default template;