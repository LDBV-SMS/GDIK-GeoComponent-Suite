import i18next from "i18next";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import mapsAPI from "masterportalAPI/src/maps/api.js";

import MultiDrawControl from "../../../src/components/gcs-draw/multiDrawControl";

import LayerManager from "../../../src/components/gcs-map/LayerManager";

import * as defaultConfig from "../gcs-map/assets/config2.json";
import StyleManager from "../../../src/components/gcs-map/StyleManager";

describe("Multi Draw Control", () => {

    let map, layerManager, styleManager;

    beforeEach(() => {
        map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");
        layerManager = new LayerManager(map, []);
        styleManager = new StyleManager(defaultConfig.style, defaultConfig.component.interactionLayerStyleId);
    });

    it("should raise an error when no draw type is given or draw type is not supported", () => {
        expect(MultiDrawControl).toBeDefined();

        let thrownError;

        try {
            new MultiDrawControl(undefined, undefined, undefined, i18next);
        }
        catch (err) {
            thrownError = err;
        }

        expect(thrownError.toString()).toBe("Error: Missing draw type");


        try {
            new MultiDrawControl(layerManager, undefined, {drawType: "Punkt"}, i18next);
        }
        catch (err) {
            thrownError = err;
        }

        expect(thrownError.toString()).toBe("Error: Unsupported draw type \"Punkt\"");

    });

    it("should init multidraw control", () => {
        const control = new MultiDrawControl(layerManager, undefined, {drawType: "PointCollection"}, i18next);

        expect(control.element.className).toBe("ol-control gcs-delete");
        expect(control.element.firstChild.nodeName).toBe("BUTTON");

        expect(control.drawInteraction).toBeDefined();

        expect(control.featureSource).toBeDefined();
    });

    it("should toggle controls depending on feature source", () => {
        const control = new MultiDrawControl(layerManager, undefined, {drawType: "PointCollection"}, i18next),
            feature = new Feature({geometry: new Point([1, 1])}),
            addInteractionSpy = jest.spyOn(map, "addInteraction"),
            removeBtn = control.element.firstChild;

        control.setMap(map);

        expect(addInteractionSpy).toHaveBeenCalledTimes(3); // Draw, Modify, Select

        // Initial state, no feature in source
        expect(removeBtn.nodeName).toBe("BUTTON");
        expect(removeBtn.disabled).toBe(true);
        expect(removeBtn.classList.contains("active")).toBe(false);

        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(false);
        expect(control.selectInteraction.getActive()).toBe(false);

        control.featureSource.addFeature(feature);

        // State after feature added to source
        expect(removeBtn.disabled).toBe(false);
        expect(removeBtn.classList.contains("active")).toBe(false);

        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(true);
        expect(control.selectInteraction.getActive()).toBe(false);

        control.featureSource.removeFeature(feature);

        // State after feature removed from source
        expect(removeBtn.disabled).toBe(true);
        expect(removeBtn.classList.contains("active")).toBe(false);

        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(false);
        expect(control.selectInteraction.getActive()).toBe(false);
    });

    it("should deactivate draw and modify interactions when delete mode is active", () => {
        const control = new MultiDrawControl(layerManager, undefined, {drawType: "PointCollection"}, i18next),
            removeBtn = control.element.firstChild;

        control.setMap(map);

        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}, {\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [2, 2]}}]}");

        control.handleClearDrawBtnClick();

        expect(removeBtn.nodeName).toBe("BUTTON");

        expect(removeBtn.disabled).toBe(false);
        expect(removeBtn.classList.contains("active")).toBe(true);

        expect(control.drawInteraction.getActive()).toBe(false);
        expect(control.modifyInteraction.getActive()).toBe(false);
        expect(control.selectInteraction.getActive()).toBe(true);
    });

    it("should activate draw and modify interactions when delete mode is deactivated", () => {
        const control = new MultiDrawControl(layerManager, undefined, {drawType: "PointCollection"}, i18next),
            removeBtn = control.element.firstChild;

        control.setMap(map);

        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}, {\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [2, 2]}}]}");

        expect(removeBtn.disabled).toBe(false);
        expect(removeBtn.classList.contains("active")).toBe(false);

        control.handleClearDrawBtnClick();
        control.handleClearDrawBtnClick();

        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(true);
        expect(control.selectInteraction.getActive()).toBe(false);

        expect(removeBtn.disabled).toBe(false);
        expect(removeBtn.classList.contains("active")).toBe(false);
    });

    it("should activate draw and modify and deactivate select interactions when all features are removed.", () => {
        const control = new MultiDrawControl(layerManager, undefined, {drawType: "PointCollection"}, i18next),
            removeBtn = control.element.firstChild;

        control.setMap(map);

        expect(removeBtn.nodeName).toBe("BUTTON");

        // initial state, no feature present
        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(false);
        expect(control.selectInteraction.getActive()).toBe(false);

        expect(removeBtn.disabled).toBe(true);
        expect(removeBtn.classList.contains("active")).toBe(false);

        // add 2 deatures
        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}, {\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [2, 2]}}]}");

        expect(removeBtn.disabled).toBe(false);
        expect(removeBtn.classList.contains("active")).toBe(false);

        // activate delete mode
        control.handleClearDrawBtnClick();

        // only select interaction should be active (for selecting feature to remove)
        expect(control.drawInteraction.getActive()).toBe(false);
        expect(control.modifyInteraction.getActive()).toBe(false);
        expect(control.selectInteraction.getActive()).toBe(true);

        expect(removeBtn.disabled).toBe(false);
        expect(removeBtn.classList.contains("active")).toBe(true);


        let feature = control.featureSource.getFeatures()[0];

        control.featureSource.removeFeature(feature);

        expect(control.drawInteraction.getActive()).toBe(false);
        expect(control.modifyInteraction.getActive()).toBe(false);
        expect(control.selectInteraction.getActive()).toBe(true);

        expect(removeBtn.disabled).toBe(false);
        expect(removeBtn.classList.contains("active")).toBe(true);

        feature = control.featureSource.getFeatures()[0];
        control.featureSource.removeFeature(feature);

        // state should be back to initial state with draw and modify active and select inactive because no features left to delete
        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(false);
        expect(control.selectInteraction.getActive()).toBe(false);

        expect(removeBtn.disabled).toBe(true);
        expect(removeBtn.classList.contains("active")).toBe(false);
    });


    it("should add features of given feature collection to feature source", () => {
        const control = new MultiDrawControl(layerManager, undefined, {drawType: "PointCollection"}, i18next);

        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}, {\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [2, 2]}}]}");

        expect(control.featureSource.getFeatures().length).toBe(2);
        expect(control.featureSource.getFeatures()[0].getGeometry().getType()).toBe("Point");
        expect(control.featureSource.getFeatures()[0].getGeometry().getCoordinates()).toEqual([1, 1]);
        expect(control.featureSource.getFeatures()[1].getGeometry().getType()).toBe("Point");
        expect(control.featureSource.getFeatures()[1].getGeometry().getCoordinates()).toEqual([2, 2]);
    });

    it("should not allow feature collections with geometry's unequal to control's draw type", () => {
        const control = new MultiDrawControl(layerManager, undefined, {drawType: "LineStringCollection"}, i18next);

        expect(() => {
            control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}]}");
        })
            .toThrow("Geometry type of given feature collection mismatch draw-type");
    });

    it("should not allow mixed geometry types", () => {
        const control = new MultiDrawControl(layerManager, undefined, {drawType: "PointCollection"}, i18next);

        expect(() => {
            control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}, {\"type\": \"Feature\", \"geometry\": {\"type\": \"LineString\", \"coordinates\": [[1, 1], [2, 1], [2, 2]]}}]}");
        })
            .toThrow("Inhomogeneous feature collection given");
    });

    it("should raise a missing draw type error when only empty feature collection given", () => {
        expect(() => {
            new MultiDrawControl(layerManager, undefined, {featureCollection: {"type": "FeatureCollection", "features": []}}, i18next);
        })
            .toThrow("Missing draw type");
    });

    it("should ignore empty feature collections", () => {
        const control = new MultiDrawControl(layerManager, undefined, {
            drawType: "PointCollection",
            featureCollection: {"type": "FeatureCollection", "features": []}
        },
        i18next);

        expect(control.featureSource.getFeatures().length).toBe(0);
    });

    it("should customize style and name layer", () => {
        const control = new MultiDrawControl(layerManager, styleManager, {drawType: "PointCollection"}, i18next);

        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}]}");

        expect(control.featureLayer.get("styleId")).toBe("1");
        expect(control.featureLayer.get("type")).toBe("Draw");
        expect(control.featureLayer.get("name")).toBe("Internal InteractionLayer");
        expect(layerManager.interactionLayer.getStyle()).toEqual(expect.any(Function));
    });

    it("should not customize style layer if StyleManager is undefined", () => {
        const control = new MultiDrawControl(layerManager, undefined, {drawType: "PointCollection"}, i18next);

        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}]}");

        expect(control.featureLayer.get("styleId")).not.toBe("1");
    });

    it("should not customize style layer if no interactionLayerStlyeId is given", () => {
        const myStyleManager = new StyleManager(defaultConfig.style, undefined),
            control = new MultiDrawControl(layerManager, myStyleManager, {drawType: "PointCollection"}, i18next);

        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}]}");

        expect(control.featureLayer.get("styleId")).not.toBe("1");
    });
});
