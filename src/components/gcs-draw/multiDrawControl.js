import DrawControl from "./drawControl";
import Modify from "ol/interaction/Modify";
import Select from "ol/interaction/Select";
import GeoJSON from "ol/format/GeoJSON";

const format = new GeoJSON();

export default class MultiDrawControl extends DrawControl {

    getSupportedDrawTypes () {
        return ["MultiPoint", "MultiLineString", "MultiPolygon"];
    }

    /**
        feature added
            -> enable edit, enable remove (changefeature, removefeature listener), enable draw, enable select
        feature removed
            -> if no features left disable edit, disable remove

     */

    constructor (layerManager, styleManager, options, i18next) {
        super(layerManager, styleManager, options, i18next);

        this.drawing = false;

        this.selectInteraction = new Select({
            layers: [this.featureLayer]
        });
        this.selectInteraction.setActive(false);

        this.selectInteraction.on("select", this.handleSelectFeature.bind(this));

        this.drawInteraction.on("drawstart", this.handleDrawStart.bind(this));
        this.drawInteraction.on("drawend", this.handleDrawEnd.bind(this));
    }

    initModifyInteraction () {
        this.modifyInteraction = new Modify({
            source: this.featureSource
        });

        this.modifyInteraction.on("modifyend", this.handleChangeFeature.bind(this));
        this.modifyInteraction.setActive(false);

        this.getMap().addInteraction(this.modifyInteraction);
    }

    setMap (map) {
        super.setMap(map);

        this.initModifyInteraction();
    }

    handleDrawStart () {
        this.drawing = true;
    }

    handleDrawEnd () {
        this.drawing = false;
    }

    handleAddFeature () {
        // in some test cases, there is no map.
        if (!this.getMap()) {
            return;
        }
        this.modifyInteraction.setActive(true);
        this.clearDrawBtn.disabled = false;
        this.dispatchEvent("featureupdate");
    }

    handleSelectFeature (event) {
        this.selectInteraction.deselectFeature(event.selected[0]);
        this.featureSource.removeFeature(event.selected[0]);
    }

    handleRemoveFeature () {
        this.dispatchEvent("featureupdate");
        if (this.featureSource.getFeatures().length > 0) {
            return;
        }

        this.clearDrawBtn.disabled = true;
        this.clearDrawBtn.classList.remove("active");

        this.selectInteraction.setActive(false);
        this.drawInteraction.setActive(true);

        this.initModifyInteraction();
    }

    handleClearDrawBtnClick () {
        // when selectInteraction is active, we want to switch to draw mode,
        // when selectInteraction is inactive we want to switch to delete mode
        const isRemoveActive = this.selectInteraction.getActive();

        // toggle active state of remove button and map interactions

        isRemoveActive ? this.clearDrawBtn.classList.remove("active") : this.clearDrawBtn.classList.add("active");

        this.selectInteraction.setActive(!isRemoveActive);
        this.drawInteraction.setActive(isRemoveActive);

        if (isRemoveActive) {
            this.initModifyInteraction();
            if (this.featureSource.getFeatures().length > 0) {
                this.modifyInteraction.setActive(true);
            }
        }
        else {
            this.modifyInteraction.setActive(false);
            this.getMap().removeInteraction(this.modifyInteraction);
        }
    }

    determinDrawType () {
        return this.drawType.replace("Multi", "");
    }
}
