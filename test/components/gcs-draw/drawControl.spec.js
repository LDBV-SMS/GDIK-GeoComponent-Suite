import i18next from "i18next";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import mapsAPI from "masterportalAPI/src/maps/api.js";

import DrawControl from "../../../src/components/gcs-draw/drawControl";

import LayerManager from "../../../src/components/gcs-map/LayerManager";

import * as defaultConfig from "../gcs-map/assets/config2.json";
import StyleManager from "../../../src/components/gcs-map/StyleManager";

describe("Draw Control", () => {

    let map, layerManager, styleManager;

    beforeEach(() => {
        map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");
        layerManager = new LayerManager(map, []);
        styleManager = new StyleManager(defaultConfig.style, defaultConfig.component.interactionLayerStyleId);
    });

    it("should raise an error when no draw type is given or draw type is not supported", () => {
        expect(DrawControl).toBeDefined();

        let thrownError;

        try {
            new DrawControl(undefined, undefined, undefined, i18next);
        }
        catch (err) {
            thrownError = err;
        }

        expect(thrownError.toString()).toBe("Error: Missing draw type");


        try {
            new DrawControl(layerManager, undefined, {drawType: "Punkt"}, i18next);
        }
        catch (err) {
            thrownError = err;
        }

        expect(thrownError.toString()).toBe("Error: Unsupported draw type \"Punkt\"");

    });

    it("should init draw control", () => {
        const control = new DrawControl(layerManager, undefined, {drawType: "Point"}, i18next);

        expect(control.element.className).toBe("ol-control gcs-delete");
        expect(control.element.firstChild.nodeName).toBe("BUTTON");

        expect(control.drawInteraction).toBeDefined();

        expect(control.featureSource).toBeDefined();
    });

    it("should toggle controls depending on feature source", () => {
        const control = new DrawControl(layerManager, undefined, {drawType: "Point"}, i18next),
            feature = new Feature({geometry: new Point([1, 1])}),
            addInteractionSpy = jest.spyOn(map, "addInteraction");

        control.setMap(map);

        expect(addInteractionSpy).toHaveBeenCalledTimes(2);

        // Initial state, no feature in source
        expect(control.element.firstChild.nodeName).toBe("BUTTON");
        expect(control.element.firstChild.disabled).toBe(true);
        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(false);

        control.featureSource.addFeature(feature);

        // State after feature added to source
        expect(control.element.firstChild.disabled).toBe(false);
        expect(control.drawInteraction.getActive()).toBe(false);
        expect(control.modifyInteraction.getActive()).toBe(true);

        control.featureSource.removeFeature(feature);

        // State after feature removed from source
        expect(control.element.firstChild.disabled).toBe(true);
        expect(control.drawInteraction.getActive()).toBe(true);
        expect(control.modifyInteraction.getActive()).toBe(false);

    });

    it("should add features of given feature collection to feature source", () => {
        const control = new DrawControl(layerManager, undefined, {drawType: "Point"}, i18next);

        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}]}");

        expect(control.featureSource.getFeatures().length).toBe(1);
        expect(control.featureSource.getFeatures()[0].getGeometry().getType()).toBe("Point");
        expect(control.featureSource.getFeatures()[0].getGeometry().getCoordinates()).toEqual([1, 1]);
    });

    it("should not allow feature collections with geometry's unequal to control's draw type", () => {
        const control = new DrawControl(layerManager, undefined, {drawType: "LineString"}, i18next);

        expect(() => {
            control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}]}");
        })
            .toThrow("Geometry type of given feature collection mismatch draw-type");
    });

    it("should not allow mixed geometry types", () => {
        const control = new DrawControl(layerManager, undefined, {drawType: "Point"}, i18next);

        expect(() => {
            control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}, {\"type\": \"Feature\", \"geometry\": {\"type\": \"LineString\", \"coordinates\": [[1, 1], [2, 1], [2, 2]]}}]}");
        })
            .toThrow("Inhomogeneous feature collection given");
    });

    it("should raise a missing draw type error when only empty feature collection given", () => {
        expect(() => {
            new DrawControl(layerManager, undefined, {featureCollection: {"type": "FeatureCollection", "features": []}}, i18next);
        })
            .toThrow("Missing draw type");
    });

    it("should ignore empty feature collections", () => {
        const control = new DrawControl(layerManager, undefined, {
            drawType: "Point",
            featureCollection: {"type": "FeatureCollection", "features": []}
        },
        i18next);

        expect(control.featureSource.getFeatures().length).toBe(0);
    });

    it("should customize style and name layer", () => {
        const control = new DrawControl(layerManager, styleManager, {drawType: "Point"}, i18next);

        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}]}");

        expect(control.featureLayer.get("styleId")).toBe("1");
        expect(control.featureLayer.get("type")).toBe("Draw");
        expect(control.featureLayer.get("name")).toBe("Internal InteractionLayer");
        expect(layerManager.interactionLayer.getStyle()).toEqual(expect.any(Function));
    });

    it("should not customize style layer if StyleManager is undefined", () => {
        const control = new DrawControl(layerManager, undefined, {drawType: "Point"}, i18next);

        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}]}");

        expect(control.featureLayer.get("styleId")).not.toBe("1");
    });

    it("should not customize style layer if no interactionLayerStlyeId is given", () => {
        const myStyleManager = new StyleManager(defaultConfig.style, undefined),
            control = new DrawControl(layerManager, myStyleManager, {drawType: "Point"}, i18next);

        control.setFeatureCollection("{\"type\": \"FeatureCollection\", \"features\": [{\"type\": \"Feature\", \"geometry\": {\"type\": \"Point\", \"coordinates\": [1, 1]}}]}");

        expect(control.featureLayer.get("styleId")).not.toBe("1");
    });
});
