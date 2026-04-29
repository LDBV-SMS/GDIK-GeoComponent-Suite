import createStyle from "masterportalAPI/src/vectorStyle/createStyle.js";

export default class StyleManager {

    static get supportedLayerTypes () {
        return ["WFS", "GeoJSON", "SensorThings", "TileSet3D", "Draw", "Select"];
    }

    constructor (styleList, interactionLayerStyleId, interactionLayerHighlightStyleId) {
        this.styleList = styleList || [];
        this.interactionLayerStyleId = interactionLayerStyleId || undefined;
        this.interactionLayerHighlightStyleId = interactionLayerHighlightStyleId || undefined;
    }

    addStyleToLayer (layer, failSilent = false) {
        if (!StyleManager.supportedLayerTypes.includes(layer?.get("type"))) {
            if (!failSilent) {
                console.error("Styling is only supported for Layers of type " + StyleManager.supportedLayerTypes.join(", "));
            }
            return;
        }

        if (!this.isLayerInStyleList(layer)) {
            console.warn("styleId " + layer?.get("styleId") + " is not in styleList. Styling for Layer '" + layer?.get("name") + "' will be skipped.");
            return;
        }

        const style = this.styleList.find(styleObject => styleObject.styleId === layer?.get("styleId"));

        layer.setStyle(this.createVectorStyleFunction(style));
    }

    createVectorStyleFunction (style) {
        return function (feature) {
            return createStyle.createStyle(style, feature, false, null);
        };
    }

    isLayerInStyleList (layer) {
        const styleId = layer?.get("styleId");

        if (!styleId) {
            console.warn("Layer has no styleId. Default style will be used");
            return false;
        }

        return this.styleList.some(style => style.styleId === styleId);
    }

    getStyleFunctionFromStyleId (styleId) {
        const style = this.styleList.find(styleObject => styleObject.styleId === styleId);

        return this.createVectorStyleFunction(style);
    }

    getInteractionLayerStyleId () {
        return this.interactionLayerStyleId;
    }

    getInteractionLayerHighlightStyleId () {
        return this.interactionLayerHighlightStyleId;
    }

}
