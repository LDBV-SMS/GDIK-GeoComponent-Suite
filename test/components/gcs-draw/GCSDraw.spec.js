import i18next from "i18next";

import mapsAPI from "masterportalAPI/src/maps/api.js";

import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import LayerManager from "../../../src/components/gcs-map/LayerManager";
import GCSDraw from "../../../src/components/gcs-draw/GCSDraw";

import * as defaultConfig from "../../../src/components/gcs-map/assets/config.json";

describe("Draw single mode", () => {

    let map, layerManager;

    beforeEach(() => {
        map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");
        layerManager = new LayerManager(map, defaultConfig.component.backgroundLayers);
    });

    it("should have draw control with inactive draw interaction added when draw-type set", () => {
        const component = new GCSDraw();
        let drawInteraction;

        component.setAttribute("draw-type", "Point");
        component.registerGCSMap(map, layerManager, i18next);

        drawInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Draw");
        expect(drawInteraction.length).toBe(1);
        drawInteraction = drawInteraction[0];
        expect(drawInteraction.getActive()).toBe(true);

        expect(component.control.element.className).toBe("ol-control gcs-delete");
    });

    it("should have feature attribute with FeatureCollection containing drawed feature when feature added to draw layer", () => {
        const component = new GCSDraw();

        component.setAttribute("draw-type", "Point");
        component.registerGCSMap(map, layerManager, i18next);

        expect(component.hasAttribute("feature")).toBe(false);

        component.control.featureSource.addFeature(new Feature({geometry: new Point([1, 1])}));

        expect(component.hasAttribute("feature")).toBe(true);

        expect(JSON.parse(component.getAttribute("feature"))).toEqual({
            type: "FeatureCollection",
            features: [
                {
                    geometry: {
                        coordinates: [1, 1],
                        type: "Point"
                    },
                    properties: null,
                    type: "Feature"
                }
            ]});
    });

    it("shouldn't have feature attrubute when drawed feature was removed", async () => {
        const component = new GCSDraw(),
            feature = new Feature({geometry: new Point([1, 1])});

        component.setAttribute("draw-type", "Point");
        component.registerGCSMap(map, layerManager, i18next);

        expect(component.hasAttribute("feature")).toBe(false);

        component.control.featureSource.addFeature(feature);
        expect(component.control.featureSource.getFeatures()[0]).toBe(feature);
        expect(component.hasAttribute("feature")).toBe(true);

        component.control.featureSource.removeFeature(feature);
        expect(component.hasAttribute("feature")).toBe(true);
        expect(component.getAttribute("feature")).toBe("");
    });

    it("should deactivate draw and activate modify after feature is added to layer", async () => {
        const component = new GCSDraw();
        let drawInteraction, modifyInteraction;

        component.setAttribute("draw-type", "Point");
        component.registerGCSMap(map, layerManager, i18next);

        drawInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Draw");
        drawInteraction = drawInteraction[0];
        modifyInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Modify");
        modifyInteraction = modifyInteraction[0];

        expect(drawInteraction.getActive()).toBe(true);
        expect(modifyInteraction.getActive()).toBe(false);

        component.control.featureSource.addFeature(new Feature({geometry: new Point([1, 1])}));

        expect(drawInteraction.getActive()).toBe(false);
        expect(modifyInteraction.getActive()).toBe(true);
    });

    it("should have active modify control when passing feature collection with point feature", async () => {
        const inputFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}]}",
            component = new GCSDraw();
        let modifyInteraction;

        component.setAttribute("draw-type", "Point");
        component.setAttribute("feature", inputFeature);
        component.registerGCSMap(map, layerManager, i18next);

        modifyInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Modify");

        modifyInteraction = modifyInteraction[0];
        expect(modifyInteraction.getActive()).toBe(true);
    });

    it("should not allow mixed geometry types", async () => {
        const inputFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}, {\"type\":\"Feature\",\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[1, 1],[2, 1], [2, 2]]}}]}",
            component = new GCSDraw();

        component.setAttribute("draw-type", "LineString");
        component.setAttribute("feature", inputFeature);

        expect(() => {
            component.registerGCSMap(map, layerManager, i18next);
        }).toThrow("Inhomogeneous feature collection given");
    });

    it("should update feature on feature attibute change", async () => {
        const initalFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}]}",
            updatedFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[2, 2]}}]}",
            component = new GCSDraw();

        component.setAttribute("draw-type", "Point");
        component.setAttribute("feature", initalFeature);
        component.registerGCSMap(map, layerManager, i18next);

        component.setAttribute("feature", updatedFeature);

        expect(component.control.featureSource.getFeatures().length).toBe(1);
        expect(component.control.featureSource.getFeatures()[0].getGeometry().getType()).toBe("Point");
        expect(component.control.featureSource.getFeatures()[0].getGeometry().getCoordinates()).toEqual([2, 2]);
    });
});

describe("Draw multi mode", () => {

    let map, layerManager;

    beforeEach(() => {
        map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");
        layerManager = new LayerManager(map, defaultConfig.component.backgroundLayers);
    });

    it("should have draw control with inactive draw interaction added when draw-type set", () => {
        const component = new GCSDraw();
        let drawInteraction;

        component.setAttribute("draw-type", "PointCollection");
        component.registerGCSMap(map, layerManager, i18next);
        drawInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Draw");
        expect(drawInteraction.length).toBe(1);
        drawInteraction = drawInteraction[0];
        expect(drawInteraction.getActive()).toBe(true);

        expect(component.control.element.className).toBe("ol-control gcs-delete");
    });

    it("should have feature attribute with FeatureCollection containing drawed feature when feature added to draw layer", () => {
        const component = new GCSDraw();

        component.setAttribute("draw-type", "Point");
        component.registerGCSMap(map, layerManager, i18next);

        expect(component.hasAttribute("feature")).toBe(false);

        component.control.featureSource.addFeature(new Feature({geometry: new Point([1, 1])}));

        expect(component.hasAttribute("feature")).toBe(true);

        expect(JSON.parse(component.getAttribute("feature"))).toEqual({
            type: "FeatureCollection",
            features: [
                {
                    geometry: {
                        coordinates: [1, 1],
                        type: "Point"
                    },
                    properties: null,
                    type: "Feature"
                }
            ]});
    });

    it("shouldn't have feature attrubute when drawed feature was removed", async () => {
        const component = new GCSDraw(),
            feature = new Feature({geometry: new Point([1, 1])});

        component.setAttribute("draw-type", "Point");
        component.registerGCSMap(map, layerManager, i18next);

        expect(component.hasAttribute("feature")).toBe(false);

        component.control.featureSource.addFeature(feature);
        expect(component.control.featureSource.getFeatures()[0]).toBe(feature);
        expect(component.hasAttribute("feature")).toBe(true);

        component.control.featureSource.removeFeature(feature);
        expect(component.hasAttribute("feature")).toBe(true);
        expect(component.getAttribute("feature")).toBe("");
    });

    it("should deactivate draw and activate modify after feature is added to layer", async () => {
        const component = new GCSDraw();
        let drawInteraction, modifyInteraction;

        component.setAttribute("draw-type", "Point");
        component.registerGCSMap(map, layerManager, i18next);

        drawInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Draw");
        drawInteraction = drawInteraction[0];
        modifyInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Modify");
        modifyInteraction = modifyInteraction[0];

        expect(drawInteraction.getActive()).toBe(true);
        expect(modifyInteraction.getActive()).toBe(false);

        component.control.featureSource.addFeature(new Feature({geometry: new Point([1, 1])}));

        expect(drawInteraction.getActive()).toBe(false);
        expect(modifyInteraction.getActive()).toBe(true);
    });

    it("should have active modify control when passing feature collection with point feature", async () => {
        const inputFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}]}",
            component = new GCSDraw();
        let modifyInteraction;

        component.setAttribute("draw-type", "Point");
        component.setAttribute("feature", inputFeature);
        component.registerGCSMap(map, layerManager, i18next);

        modifyInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Modify");

        modifyInteraction = modifyInteraction[0];
        expect(modifyInteraction.getActive()).toBe(true);
    });

    it("should not allow mixed geometry types", async () => {
        const inputFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}, {\"type\":\"Feature\",\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[1, 1],[2, 1], [2, 2]]}}]}",
            component = new GCSDraw();

        component.setAttribute("draw-type", "LineString");
        component.setAttribute("feature", inputFeature);

        expect(() => {
            component.registerGCSMap(map, layerManager, i18next);
        }).toThrow("Inhomogeneous feature collection given");
    });

    it("should update feature on feature attibute change", async () => {
        const initalFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1, 1]}}]}",
            updatedFeature = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[2, 2]}}]}",
            component = new GCSDraw();

        component.setAttribute("draw-type", "Point");
        component.setAttribute("feature", initalFeature);
        component.registerGCSMap(map, layerManager, i18next);

        component.setAttribute("feature", updatedFeature);

        expect(component.control.featureSource.getFeatures().length).toBe(1);
        expect(component.control.featureSource.getFeatures()[0].getGeometry().getType()).toBe("Point");
        expect(component.control.featureSource.getFeatures()[0].getGeometry().getCoordinates()).toEqual([2, 2]);
    });
});