import {GCSMap, GCSGeolocation, GCSDraw, GCSLayerSwitcher, GCSSearch} from "../components";

export default class GDIKInput extends HTMLElement {

    static get observedAttributes () {
        return ["lon", "lat", "zoom", "active-bg", "value", "search-string", "lng"];
    }

    // Web Component Callback
    connectedCallback () {
        const shadow = this.attachShadow({mode: "open"});

        this.mapElement = new GCSMap();
        if (this.hasAttribute("config-url")) {
            this.mapElement.setAttribute("config-url", this.getAttribute("config-url"));
        }

        if (this.hasAttribute("lng")) {
            this.mapElement.setAttribute("lng", this.getAttribute("lng"));
        }

        this.mapElement.addEventListener("configloaded", this.handleConfigLoaded.bind(this));
        shadow.appendChild(this.mapElement);

        this.layerswitcherElement = new GCSLayerSwitcher();
        this.layerswitcherElement.slot = "content";

        this.mapElement.appendChild(this.layerswitcherElement);

        GDIKInput.observedAttributes.forEach((attrName) => {
            if (this.hasAttribute(attrName)) {
                this.mapElement.setAttribute(attrName, this.getAttribute(attrName));
            }
        });

        this.observer = new MutationObserver(this.handleObservedAttributeCallback.bind(this));
        this.observer.observe(this.mapElement, {attributes: true, childList: false, subtree: false});

        this.geolocationElement = new GCSGeolocation();
        this.geolocationElement.slot = "content";
        this.mapElement.appendChild(this.geolocationElement);
    }

    // Web Component Callback
    handleObservedAttributeCallback (mutationList) {
        mutationList.forEach((mutation) => {
            if (mutation.type !== "attributes") {
                return;
            }

            if (GDIKInput.observedAttributes.includes(mutation.attributeName)) {
                const newValue = mutation.target.getAttribute(mutation.attributeName);

                if (this.getAttribute(mutation.attributeName) === newValue) {
                    return;
                }
                this.setAttribute(mutation.attributeName, newValue);
            }

            if (mutation.attributeName === "feature") {
                const newValue = mutation.target.getAttribute(mutation.attributeName);

                this.setValue(newValue);
            }
        });
    }

    // Web Component Callback
    detachedCallback () {
        this.observer.disconnect();
    }

    // Web Component Callback
    attributeChangedCallback (name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }
        if (this.mapElement === undefined) {
            return;
        }
        switch (name) {
            case "lon":
            case "lat":
            case "zoom":
            case "active-bg":
            case "lng":
                this.mapElement.setAttribute(name, newValue);
                break;
            case "value":
                this.setValue(this.getAttribute("value"), true);
                break;
            case "search-string":
                if (this.searchElement) {
                    this.searchElement.setAttribute("search-string", newValue);
                }
                break;
            default:
                break;
        }
    }

    handleConfigLoaded (e) {
        const config = e.detail,
            drawType = this.getAttribute("draw-type") || config?.component?.drawType;

        if (drawType) {
            this.input = document.createElement("input");
            this.input.name = this.getAttribute("name") || "gdik-input";
            this.input.type = "hidden";
            this.appendChild(this.input);

            this.drawElement = new GCSDraw();
            this.drawElement.slot = "content";
            this.drawElement.setAttribute("draw-type", drawType);

            if (this.hasAttribute("value")) {
                this.setValue(this.getAttribute("value"), true);
            }

            this.mapElement.appendChild(this.drawElement);
            this.observer.observe(this.drawElement, {attributes: true, childList: false, subtree: false});
        }

        if (config.component.searchUrl) {
            this.searchElement = new GCSSearch();
            this.searchElement.slot = "content";
            this.searchElement.setAttribute("search-url", config.component.searchUrl);
            this.searchElement.setAttribute("suggest-url", config.component.suggestUrl);
            if (this.hasAttribute("search-string")) {
                this.searchElement.setAttribute("search-string", this.getAttribute("search-string"));
            }
            this.mapElement.appendChild(this.searchElement);
        }
        this.dispatchEvent(new CustomEvent("configloaded", {detail: config, bubbles: true}));
    }

    setValue (value, silent) {
        if (this.value !== undefined && this.input.value === value) {
            return;
        }

        this.setAttribute("value", value);

        let jsonValue = null,
            strValue = value;

        try {
            jsonValue = JSON.parse(value);
        }
        catch (e) {
            strValue = "";
        }

        this.value = jsonValue;

        this.input.value = strValue;
        if (this.drawElement !== undefined) {
            this.drawElement.setAttribute("feature", strValue);
        }

        if (silent === true) {
            return;
        }

        // InputEvent pass only text in data, so we have to use
        // string value as data
        this.dispatchEvent(new InputEvent("input", {
            data: strValue, composed: true, bubbles: true
        }));
        // CustomEvent can handle objects, so we can pass value
        // as object
        this.dispatchEvent(new CustomEvent("change", {
            detail: jsonValue, composed: true, bubbles: true
        }));
    }

    getImage (mimetype = "image/png") {
        return this.mapElement.getImage(mimetype);
    }

    centerToFeature () {
        if (!this.value) {
            return;
        }
        this.mapElement.fit(this.value.features[0].geometry);
    }
}

customElements.define("gdik-input", GDIKInput);
