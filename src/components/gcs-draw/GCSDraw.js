import DrawControl from "./drawControl";
import MultiDrawControl from "./multiDrawControl";

export default class GCSDraw extends HTMLElement {


    static get observedAttributes () {
        return ["feature"];
    }

    constructor () {
        super();
        this.control = null;
    }

    registerGCSMap (map, layerManager, i18next, styleManager) {
        const drawType = this.getAttribute("draw-type"),
            ControlClass = drawType && drawType.endsWith("Collection") ? MultiDrawControl : DrawControl;

        i18next.addResources("en", "draw", {ERASE_DRAW: "Erase geometry"});
        i18next.addResources("de", "draw", {ERASE_DRAW: "Geometrie löschen"});

        this.control = new ControlClass(layerManager, styleManager, {
            drawType: drawType
        }, i18next);

        if (this.hasAttribute("feature")) {
            this.control.setFeatureCollection(this.getAttribute("feature"));
        }

        this.control.on("featureupdate", () => {
            const fc = this.control.getFeatureCollection();

            if (fc === undefined) {
                this.setAttribute("feature", "");
                return;
            }
            this.setAttribute("feature", fc);
        });

        map.addControl(this.control);
    }

    attributeChangedCallback (name, oldValue, newValue) {

        if (oldValue === null) {
            return;
        }

        if (oldValue === newValue) {
            return;
        }
        if (this.control === null) {
            return;
        }

        switch (name) {
            case "feature":
                if (newValue === null) {
                    this.control.featureSource.clear();
                    return;
                }
                this.control.setFeatureCollection(newValue);
                break;
            default:
                break;
        }
    }
}

customElements.define("gcs-draw", GCSDraw);
