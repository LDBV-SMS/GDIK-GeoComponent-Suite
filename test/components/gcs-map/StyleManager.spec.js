import rawLayerList from "masterportalAPI/src/rawLayerList.js";
import mapsAPI from "masterportalAPI/src/maps/api.js";
import LayerManager from "../../../src/components/gcs-map/LayerManager";
import StyleManager from "../../../src/components/gcs-map/StyleManager";

import * as _defaultConfig from "../gcs-map/assets/config.json";

describe("StyleManager", () => {
    const defaultConfig = JSON.parse(JSON.stringify(_defaultConfig));

    let layerManager,
        styleList;

    beforeEach(() => {
        defaultConfig.services = [
            {
                "id": "1001",
                "typ": "WMS",
                "name": "WebAtlasDe",
                "url": "https://sg.geodatenzentrum.de/wms_webatlasde__54a30b0f-b92f-34ba-39c0-3af32cfa13d6",
                "version": "1.1.1",
                "layers": "webatlasde",
                "transparent": true,
                "singleTile": false,
                "tilesize": 256,
                "gutter": 0
            },
            {
                "id": "2003",
                "name": "Landkreise",
                "url": "https://sgx.geodatenzentrum.de/wfs_vg1000",
                "typ": "WFS",
                "featureType": "vg1000_krs",
                "featurePrefix": "vg1000",
                "version": "2.0.0",
                "datasets": [],
                "styleId": "1"
            },
            {
                "id": "3003",
                "name": "Landkreise Wrong StyleId",
                "url": "https://sgx.geodatenzentrum.de/wfs_vg1000",
                "typ": "WFS",
                "featureType": "vg1000_krs",
                "featurePrefix": "vg1000",
                "version": "2.0.0",
                "datasets": [],
                "styleId": "222"
            },
            {
                "id": "4003",
                "name": "Landkreise No StyleId",
                "url": "https://sgx.geodatenzentrum.de/wfs_vg1000",
                "typ": "WFS",
                "featureType": "vg1000_krs",
                "featurePrefix": "vg1000",
                "version": "2.0.0",
                "datasets": []
            }
        ];
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001", "3003", "4003"],
            foregroundLayer = "2003";

        layerManager = new LayerManager(map, backgroundLayerIds, foregroundLayer);

        styleList = [
            {
                styleId: "1",
                rules: [
                    {
                        style: {
                            polygonStrokeColor: [
                                0,
                                0,
                                0,
                                1
                            ],
                            polygonStrokeWidth: 5,
                            polygonFillColor: [
                                10,
                                200,
                                0,
                                0.2
                            ]
                        }
                    }
                ]
            }
        ];
    });

    it("should create a StyleManager with a stylesList", () => {
        const styleManager = new StyleManager(styleList);

        expect(styleManager.styleList).toBe(styleList);
    });

    it("should create a StyleManager with an empty stylesList", () => {
        const styleManager = new StyleManager();

        expect(Array.isArray(styleManager.styleList)).toBe(true);
        expect(styleManager.styleList.length).toBe(0);
    });

    it("should add Style to Layer", () => {
        const styleManager = new StyleManager(styleList),
            defaultStyleFunction = layerManager.foregroundLayer.getStyleFunction();

        styleManager.addStyleToLayer(layerManager.foregroundLayer, true);

        expect(layerManager.foregroundLayer.getStyle()).toEqual(expect.any(Function));
        expect(layerManager.foregroundLayer.getStyle()).not.toBe(defaultStyleFunction);
    });

    it("should return silently if LayerType is not supported", () => {
        const styleManager = new StyleManager(styleList);

        console.error = jest.fn();

        styleManager.addStyleToLayer(layerManager.backgroundLayers[0], true);

        expect(console.error.mock.calls.length).toBe(0);
    });

    it("should return and log error if LayerType is not supported", () => {
        const styleManager = new StyleManager(styleList);

        console.error = jest.fn();

        styleManager.addStyleToLayer(layerManager.backgroundLayers[0], false);

        expect(console.error.mock.calls[0][0]).toBe("Styling is only supported for Layers of type WFS, GeoJSON, SensorThings, TileSet3D, Draw, Select");
    });

    it("should log a warning if Layer is not in styleList", () => {
        const styleManager = new StyleManager(styleList),
            defaultStyleFunction = layerManager.backgroundLayers[1].getStyleFunction();

        console.warn = jest.fn();

        styleManager.addStyleToLayer(layerManager.backgroundLayers[1], true);

        expect(layerManager.backgroundLayers[1].getStyle()).toBe(defaultStyleFunction);
        expect(console.warn.mock.calls[0][0]).toBe("styleId 222 is not in styleList. Styling for Layer 'Landkreise Wrong StyleId' will be skipped.");
    });

    it("should log a warning if Layer has no styleId", () => {
        const styleManager = new StyleManager(styleList),
            defaultStyleFunction = layerManager.backgroundLayers[2].getStyleFunction();

        console.warn = jest.fn();

        styleManager.isLayerInStyleList(layerManager.backgroundLayers[2]);

        expect(layerManager.backgroundLayers[2].getStyle()).toBe(defaultStyleFunction);
        expect(console.warn.mock.calls[0][0]).toBe("Layer has no styleId. Default style will be used");
    });

    it("should return false if Layer has no styleId", () => {
        const styleManager = new StyleManager(styleList);

        expect(styleManager.isLayerInStyleList(layerManager.backgroundLayers[2])).toBe(false);
    });

    it("should return false if Layer is not in styleList", () => {
        const styleManager = new StyleManager(styleList);

        expect(styleManager.isLayerInStyleList(layerManager.backgroundLayers[1])).toBe(false);
    });

    it("should return false if Layer is not in styleList", () => {
        const styleManager = new StyleManager(styleList);

        expect(styleManager.isLayerInStyleList(layerManager.backgroundLayers[1])).toBe(false);
    });

    it("should create a StyleManager with an interactionLayerStyleId", () => {
        const styleManager = new StyleManager(styleList, "testlayer");

        expect(styleManager.interactionLayerStyleId).toBe("testlayer");
    });

    it("should return interactionLayerStyleId", () => {
        const styleManager = new StyleManager(styleList, "testlayer");

        expect(styleManager.getInteractionLayerStyleId()).toBe("testlayer");
    });

    it("should return undefined", () => {
        const styleManager = new StyleManager(styleList);

        expect(styleManager.getInteractionLayerStyleId()).toBe(undefined);
    });

    it("should create a StyleManager with an interactionLayerHighlightStyleId", () => {
        const styleManager = new StyleManager(styleList, null, "highlight");

        expect(styleManager.interactionLayerHighlightStyleId).toBe("highlight");
    });

    it("should return interactionLayerHighlightStyleId", () => {
        const styleManager = new StyleManager(styleList, null, "highlight");

        expect(styleManager.getInteractionLayerHighlightStyleId()).toBe("highlight");
    });
});
