import rawLayerList from "masterportalAPI/src/rawLayerList.js";
import Observable from "ol/Observable";

/**
 * Applies the visibility limits of the raw layer to the layer.
 * masterportalAPI only does this for some layer types (e.g. WMS), not for WFS.
 * The layer is visible for minResolution <= resolution < maxResolution.
 * @param {ol.layer.Base} layer the layer
 * @param {Object} rawLayer raw layer config
 * @returns {void}
 */
function applyResolutionLimits (layer, rawLayer) {
    if (typeof rawLayer.minResolution === "number") {
        layer.setMinResolution(rawLayer.minResolution);
    }
    if (typeof rawLayer.maxResolution === "number") {
        layer.setMaxResolution(rawLayer.maxResolution);
    }
}

export default class LayerManager extends Observable {

    static get supportedInteractionLayerTypes () {
        return ["WFS", "GeoJSON", "Draw", "Select"];
    }

    constructor (map, backgroundLayerIds, foregroundLayerId = undefined, interactionLayerId = undefined) {
        super();
        this.map = map;
        this.backgroundLayerIds = [];
        this.backgroundLayers = [];
        this.foregroundLayer = null;
        this.interactionLayer = null;
        this.activeBackgroundLayer = null;

        backgroundLayerIds.forEach(layerId => {
            const rawLayer = rawLayerList.getLayerWhere({id: layerId});
            let layer = null;

            if (!rawLayer) {
                console.error("Background layer with id '" + layerId + "' not found. Skipped.");
                return;
            }

            layer = map.addLayer(layerId);
            applyResolutionLimits(layer, rawLayer);
            layer.set("name", rawLayer.name);
            layer.set("styleId", rawLayer.styleId);
            layer.set("type", rawLayer.typ);
            this.backgroundLayers.push(layer);
            this.backgroundLayerIds.push(layerId);

            if (this.activeBackgroundLayer === null) {
                this.activeBackgroundLayer = layer;
            }

            layer.setVisible(layer === this.activeBackgroundLayer);
        });

        if (foregroundLayerId) {
            const rawLayer = rawLayerList.getLayerWhere({id: foregroundLayerId});
            let layer = null;

            if (!rawLayer) {
                console.error("Foreground layer with id '" + foregroundLayerId + "' not found.");
                return;
            }

            layer = map.addLayer(foregroundLayerId);
            applyResolutionLimits(layer, rawLayer);
            layer.set("name", rawLayer.name);
            layer.set("styleId", rawLayer.styleId);
            layer.set("type", rawLayer.typ);
            this.foregroundLayer = layer;
            this.foregroundLayer.setVisible(true);
        }

        if (interactionLayerId) {
            this.setInteractionLayerById(interactionLayerId);
        }
    }

    changeBackgroundLayer (id) {
        if (!this.backgroundLayerIds.includes(id)) {
            console.error(`Background layer with id ${id} not found`);
            return Promise.reject(`Background layer with id ${id} not found`);
        }

        const newBackgroundLayer = this.backgroundLayers.filter(l => l.get("id") === id)[0];

        if (this.activeBackgroundLayer) {
            this.activeBackgroundLayer.setVisible(false);
        }
        newBackgroundLayer.setVisible(true);
        this.activeBackgroundLayer = newBackgroundLayer;
        this.dispatchEvent("backgroudchange");
        return Promise.resolve();
    }

    setInteractionLayer (interactionLayer) {
        this.map.removeLayer(this.interactionLayer);
        this.interactionLayer = interactionLayer;
        this.map.addLayer(interactionLayer);
    }

    setInteractionLayerById (layerId, failSilent = false) {
        const rawLayer = rawLayerList.getLayerWhere({id: layerId});

        let layer = null;

        if (!rawLayer) {
            if (!failSilent) {
                console.error("Interaction layer with id '" + layerId + "' not found. Skipped.");
            }
            return;
        }

        if (!LayerManager.supportedInteractionLayerTypes.includes(rawLayer?.typ)) {
            if (!failSilent) {
                console.error("Interaction layer must be one of the following types: " + LayerManager.supportedInteractionLayerTypes.join(", "));
            }
            return;
        }

        layer = this.map.addLayer(layerId, {layerParams: rawLayer});
        layer.set("name", rawLayer.name);
        layer.set("styleId", rawLayer.styleId);
        layer.set("type", rawLayer.typ);

        this.map.removeLayer(this.interactionLayer);
        this.interactionLayer = layer;
    }

}
