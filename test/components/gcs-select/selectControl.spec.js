import mapsAPI from "masterportalAPI/src/maps/api.js";
import LayerManager from "../../../src/components/gcs-map/LayerManager";
import StyleManager from "../../../src/components/gcs-map/StyleManager";
import * as defaultConfig from "../gcs-map/assets/config3.json";
import i18next from "i18next";
import SelectControl from "../../../src/components/gcs-select/selectControl";
import rawLayerList from "masterportalAPI/src/rawLayerList.js";
import Select from "ol/interaction/Select.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

describe("Select Control", () => {

    rawLayerList.initializeLayerList(defaultConfig.services);

    let map, layerManager, layerManager2, styleManager;

    beforeEach(() => {
        map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");
        layerManager = new LayerManager(map, []);
        layerManager2 = new LayerManager(map, [], undefined, defaultConfig.component.interactionLayer);
        styleManager = new StyleManager(defaultConfig.style, defaultConfig.component.interactionLayerStyleId, defaultConfig.component.interactionLayerHighlightStyleId);
    });

    it("should raise an error when no interaction layer is defined", () => {
        expect(SelectControl).toBeDefined();

        let thrownError;

        try {
            new SelectControl(layerManager, undefined, undefined, i18next);
        }
        catch (err) {
            thrownError = err;
        }

        expect(thrownError.toString()).toBe("Error: Interaction layer is undefined");
    });

    it("should init select control", () => {
        const control = new SelectControl(layerManager2, undefined, {}, i18next);

        expect(control.element.className).toBe("ol-control gcs-delete");
        expect(control.element.firstChild.nodeName).toBe("BUTTON");

        expect(control.selectInteraction).toBeDefined();

        expect(control.featureLayer).toBeDefined();
    });

    it("name and type of interaction layer should be set correctly", () => {
        new SelectControl(layerManager2, undefined, {}, i18next);

        expect(layerManager2.interactionLayer.get("name")).toBe("Internal InteractionLayer");
        expect(layerManager2.interactionLayer.get("type")).toBe("Select");

    });

    it("should add an active click interaction to the interaction layer and map", () => {
        const control = new SelectControl(layerManager2, undefined, {}, i18next);

        control.setMap(map);

        let selectInteraction = map.getInteractions().getArray().filter((interaction) => interaction.constructor.name === "Select");

        expect(selectInteraction.length).toBe(1);

        selectInteraction = selectInteraction[0];

        expect(selectInteraction instanceof Select).toBe(true);
        expect(selectInteraction.getActive()).toBe(true);
    });

    it("should apply interaction layer style", () => {
        const control = new SelectControl(layerManager2, styleManager, {}, i18next);

        expect(control.featureLayer.get("styleId")).toBe(styleManager.getInteractionLayerStyleId());
    });

    it("should apply interaction layer highlight style", () => {
        const control = new SelectControl(layerManager2, styleManager, {}, i18next);

        expect(control.featureLayer.getStyle()).toEqual(expect.any(Function));
    });

    it("should toggle controls depending on selection", () => {
        const control = new SelectControl(layerManager2, undefined, {}, i18next),
            feature = new Feature({geometry: new Point([1, 1])}),
            addInteractionSpy = jest.spyOn(map, "addInteraction");

        control.setMap(map);

        expect(addInteractionSpy).toHaveBeenCalledTimes(1);

        // Initial state, no feature in source
        expect(control.element.firstChild.nodeName).toBe("BUTTON");
        expect(control.element.firstChild.disabled).toBe(true);

        control.featureLayer.getSource().addFeature(feature);

        // State after feature added to source
        expect(control.element.firstChild.disabled).toBe(true);

        control.selectInteraction.getFeatures().push(feature);
        control.selectInteraction.dispatchEvent({type: "select", selected: [feature], deselected: []});

        // State after selecting a feature
        expect(control.element.firstChild.disabled).toBe(false);

        control.selectInteraction.getFeatures().pop();
        control.selectInteraction.dispatchEvent({type: "select", selected: [], deselected: [feature]});

        // State after deleslecting a feauture
        expect(control.element.firstChild.disabled).toBe(true);

        control.featureLayer.getSource().removeFeature(feature);

        // State after feature removed from source
        expect(control.element.firstChild.disabled).toBe(true);
    });

    it("should set a new map to the select interaction", () => {
        const control = new SelectControl(layerManager2, undefined, {}, i18next),
            addInteractionSpy = jest.spyOn(map, "addInteraction");

        control.setMap(map);
        expect(addInteractionSpy).toHaveBeenCalledTimes(1);
    });

    it("should dispatch a selectfeature event when selecting or deselecting a feature", () => {
        const selectFeatureSpy = jest.fn(),
            deselectFeatureSpy = jest.fn(),
            control = new SelectControl(layerManager2, undefined, {}, i18next),
            feature = new Feature({geometry: new Point([1, 1])});

        control.on("selectfeature", selectFeatureSpy);
        control.on("deselectfeature", deselectFeatureSpy);

        control.featureLayer.getSource().addFeature(feature);

        // Selecting a feature
        control.selectInteraction.getFeatures().push(feature);
        control.selectInteraction.dispatchEvent({type: "select", selected: [feature], deselected: []});

        // Deselcting a feature
        control.selectInteraction.getFeatures().pop();
        control.selectInteraction.dispatchEvent({type: "select", selected: [], deselected: [feature]});

        expect(selectFeatureSpy).toHaveBeenCalledTimes(1);
        expect(deselectFeatureSpy).toHaveBeenCalledTimes(1);
    });

    it("should clear the selection", () => {
        const deselectFeatureSpy = jest.fn(),
            control = new SelectControl(layerManager2, undefined, {}, i18next),
            feature = new Feature({geometry: new Point([1, 1])});

        control.on("deselectfeature", deselectFeatureSpy);

        control.featureLayer.getSource().addFeature(feature);

        // Selecting a feature
        control.selectInteraction.getFeatures().push(feature);
        control.selectInteraction.dispatchEvent({type: "select", selected: [feature], deselected: []});

        control.handleClearDrawBtnClick();

        expect(deselectFeatureSpy).toHaveBeenCalledTimes(1);
        expect(control.selectInteraction.getFeatures().getLength()).toEqual(0);

    });

    it("should get the selected features as geojson string", () => {
        const control = new SelectControl(layerManager2, undefined, {}, i18next),
            feature = new Feature({geometry: new Point([1, 1])});

        control.featureLayer.getSource().addFeature(feature);

        // Selecting a feature
        control.selectInteraction.getFeatures().push(feature);
        control.selectInteraction.dispatchEvent({type: "select", selected: [feature], deselected: []});

        expect(control.getSelectedFeatures()).toEqual("{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[1,1]},\"properties\":null}]}");
    });

    it("should return undefined if there are no features selected", () => {
        const control = new SelectControl(layerManager2, undefined, {}, i18next),
            feature = new Feature({geometry: new Point([1, 1])});

        control.featureLayer.getSource().addFeature(feature);

        expect(control.getSelectedFeatures()).toEqual(undefined);
    });

    it("should be single select", () => {
        const control = new SelectControl(layerManager2, undefined, {}, i18next);

        // eslint-disable-next-line no-underscore-dangle
        expect(control.selectInteraction.multi_).toEqual(false);
    });

});
