import rawLayerList from "masterportalAPI/src/rawLayerList.js";
import mapsAPI from "masterportalAPI/src/maps/api.js";
import LayerManager from "../../../src/components/gcs-map/LayerManager";
import * as defaultConfig from "../gcs-map/assets/config3.json";
import i18next from "i18next";
import GCSSelect from "../../../src/components/gcs-select/GCSSelect";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

describe("Select related", () => {
    rawLayerList.initializeLayerList(defaultConfig.services);

    let map, layerManager;

    beforeEach(() => {
        map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");
        layerManager = new LayerManager(map, [], undefined, defaultConfig.component.interactionLayer);
    });

    it("should have select control with active select interaction added", () => {
        const component = new GCSSelect();
        let selectInteraction;

        component.registerGCSMap(map, layerManager, i18next);

        selectInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Select");
        expect(selectInteraction.length).toBe(1);
        selectInteraction = selectInteraction[0];
        expect(selectInteraction.getActive()).toBe(true);

        expect(component.control.element.className).toBe("ol-control gcs-delete");
    });

    it("should have value attribute with FeatureCollection containing the selected feature when feature is selected", () => {
        const component = new GCSSelect(),
            feature = new Feature({geometry: new Point([1, 1])});

        component.registerGCSMap(map, layerManager, i18next);

        expect(component.hasAttribute("value")).toBe(false);

        component.control.featureLayer.getSource().addFeature(feature);

        // Selecting a feature
        component.control.selectInteraction.getFeatures().push(feature);
        component.control.selectInteraction.dispatchEvent({type: "select", selected: [feature], deselected: []});

        expect(component.hasAttribute("value")).toBe(true);

        expect(JSON.parse(component.getAttribute("value"))).toEqual({
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

    it("should have empty attribute when feature was deselected", async () => {
        const component = new GCSSelect(),
            feature = new Feature({geometry: new Point([1, 1])});

        component.registerGCSMap(map, layerManager, i18next);

        expect(component.hasAttribute("value")).toBe(false);

        component.control.featureLayer.getSource().addFeature(feature);

        // Selecting a feature
        component.control.selectInteraction.getFeatures().push(feature);
        component.control.selectInteraction.dispatchEvent({type: "select", selected: [feature], deselected: []});
        expect(component.control.featureLayer.getSource().getFeatures()[0]).toBe(feature);
        expect(component.hasAttribute("value")).toBe(true);

        // Deselect a feature
        component.control.selectInteraction.getFeatures().pop();
        component.control.selectInteraction.dispatchEvent({type: "select", selected: [], deselected: [feature]});
        expect(component.hasAttribute("value")).toBe(true);
        expect(component.getAttribute("value")).toBe("");
    });

    it("should not select a feature by assigning it to the value attribute (value should be read-only)", async () => {
        const component = new GCSSelect();

        component.registerGCSMap(map, layerManager, i18next);

        component.setAttribute("value", JSON.stringify({
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
            ]}));

        expect(component.control.selectInteraction.getFeatures().getLength()).toEqual(0);
    });
});
