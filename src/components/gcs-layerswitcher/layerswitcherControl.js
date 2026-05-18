import {Control} from "ol/control";

export default class LayerswitcherControl extends Control {

    constructor (layerManager, i18next) {
        const containerDiv = document.createElement("div"),
            open = document.createElement("div"),
            opener = document.createElement("button"),
            closer = document.createElement("button");

        containerDiv.className = "ol-control gcs-layerswitcher";
        super({element: containerDiv});

        opener.className = "";
        opener.innerHTML = "&#x3E;";
        opener.title = i18next.t("OPEN", {ns: "layerswitcher"});
        opener.addEventListener("click", () => {
            open.classList.remove("hidden");
            opener.classList.add("hidden");
        });

        open.className = "list-container hidden";

        this.layerManager = layerManager;

        this.layerContainer = document.createElement("ul");
        this.layerContainer.className = "list-group";

        open.appendChild(this.layerContainer);

        closer.className = "closer";
        closer.innerHTML = "&#x3C;";
        closer.title = i18next.t("CLOSE", {ns: "layerswitcher"});
        closer.addEventListener("click", () => {
            opener.classList.remove("hidden");
            open.classList.add("hidden");
        });

        open.appendChild(closer);

        containerDiv.appendChild(opener);
        containerDiv.appendChild(open);

        i18next.on("languageChanged", this.handleLanguageChange.bind(this));

        this.opener = opener;
        this.closer = closer;
        this.i18next = i18next;
    }

    handleLanguageChange () {
        this.opener.title = this.i18next.t("OPEN", {ns: "layerswitcher"});
        this.closer.title = this.i18next.t("CLOSE", {ns: "layerswitcher"});
    }

    setMap (map) {
        this.render();
        super.setMap(map);
    }

    render () {
        this.layerContainer.querySelectorAll("*").forEach(n => n.remove());

        this.layerManager.backgroundLayers.forEach((layer) => {
            const li = document.createElement("li");

            li.className = "list-group-item";
            li.className += layer.getVisible() ? " active" : "";

            li.addEventListener("click", this.handleBackgroundLayerChange.bind(this, layer.get("id")));
            li.textContent = layer.get("name");

            this.layerContainer.appendChild(li);
        });

    }

    handleBackgroundLayerChange (id) {
        return this.layerManager.changeBackgroundLayer(id)
            .then(this.render.bind(this));
    }
}
