import VectorLayer from "ol/layer/Vector";

import mapsAPI from "masterportalAPI/src/maps/api.js";

import LayerManager from "../../../src/components/gcs-map/LayerManager";

import * as _defaultConfig from "../gcs-map/assets/config.json";

describe("LayerManager", () => {
    const defaultConfig = JSON.parse(JSON.stringify(_defaultConfig));

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
                "id": "1002",
                "typ": "WMS",
                "name": "TopPlusOpen - Farbe",
                "url": "https://sgx.geodatenzentrum.de/wms_topplus_open",
                "version": "1.1.1",
                "layers": "web",
                "transparent": true,
                "singleTile": false,
                "tilesize": 256,
                "gutter": 20
            },
            {
                "id": "2003",
                "typ": "WMS",
                "name": "My WMS",
                "url": "https://sgx.geodatenzentrum.de/wms_topplus_open",
                "version": "1.1.1",
                "layers": "web",
                "transparent": true,
                "singleTile": false,
                "tilesize": 256,
                "gutter": 20
            },
            {
                "id": "1337",
                "name": "WFS-Layer",
                "url": "https://mywfs.de/wfs",
                "typ": "WFS",
                "featureType": "test_polygon",
                "featurePrefix": "test",
                "featureNS": "http://opengeo.org/test",
                "version": "1.1.0",
                "gfiAttributes": "showAll",
                "layerAttribution": "nicht vorhanden",
                "legend": true,
                "isSecured": false,
                "datasets": [],
                "gfiTheme": "default"
            },
            {
                "id": "1338",
                "name": "WFS-Layer",
                "url": "https://mywfs.de/wfs",
                "typ": "WMS",
                "featureType": "test_polygon",
                "featurePrefix": "test",
                "featureNS": "http://opengeo.org/test",
                "version": "1.1.0",
                "gfiAttributes": "showAll",
                "layerAttribution": "nicht vorhanden",
                "legend": true,
                "isSecured": false,
                "datasets": [],
                "gfiTheme": "default"
            }
        ];
    });

    it("should create layers from given ids", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001"],
            layerManager = new LayerManager(map, backgroundLayerIds);

        expect(layerManager.backgroundLayers.length).toBe(1);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");

    });

    it("should create foreground layer from given id", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = [],
            foregroundLayerId = "2003",
            layerManager = new LayerManager(map, backgroundLayerIds, foregroundLayerId);

        expect(layerManager.foregroundLayer).not.toBeNull();

        expect(layerManager.foregroundLayer.get("name")).toBe("My WMS");

    });

    it("should create only background layers from given ids", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001"],
            layerManager = new LayerManager(map, backgroundLayerIds);

        expect(layerManager.backgroundLayers.length).toBe(1);
        expect(layerManager.foregroundLayer).toBeNull();

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");

    });

    it("should have first given background layer visible", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");

        let backgroundLayerIds = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayerIds);

        expect(layerManager.backgroundLayers.length).toBe(2);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");

        expect(layerManager.backgroundLayers[0].get("name")).toBe("WebAtlasDe");
        expect(layerManager.backgroundLayers[0].getVisible()).toBe(true);
        expect(layerManager.backgroundLayers[1].get("name")).toBe("TopPlusOpen - Farbe");
        expect(layerManager.backgroundLayers[1].getVisible()).toBe(false);

        backgroundLayerIds = ["1002", "1001"];
        layerManager = new LayerManager(map, backgroundLayerIds);

        expect(layerManager.backgroundLayers.length).toBe(2);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("TopPlusOpen - Farbe");

        expect(layerManager.backgroundLayers[0].get("name")).toBe("TopPlusOpen - Farbe");
        expect(layerManager.backgroundLayers[0].getVisible()).toBe(true);
        expect(layerManager.backgroundLayers[1].get("name")).toBe("WebAtlasDe");
        expect(layerManager.backgroundLayers[1].getVisible()).toBe(false);
    });

    it("should change the active and visible background layer", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayersIds = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayersIds);

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("WebAtlasDe");
        expect(layerManager.backgroundLayers[0].getVisible()).toBe(true);
        expect(layerManager.backgroundLayers[1].getVisible()).toBe(false);

        layerManager.changeBackgroundLayer("1002");

        expect(layerManager.activeBackgroundLayer.get("name")).toBe("TopPlusOpen - Farbe");
        expect(layerManager.backgroundLayers[0].getVisible()).toBe(false);
        expect(layerManager.backgroundLayers[1].getVisible()).toBe(true);
    });

    it("should keep the foreground layer on top when changing the active background layer", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayersIds = ["1001", "1002"],
            foregroundLayerId = "2003",
            layerManager = new LayerManager(map, backgroundLayersIds, foregroundLayerId);

        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("My WMS");

        layerManager.changeBackgroundLayer("1002");

        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("My WMS");
    });

    it("should log an error when given background layer id not present", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1003"];

        console.error = jest.fn();

        new LayerManager(map, backgroundLayerIds);

        expect(console.error.mock.calls[0][0]).toBe("Background layer with id '1003' not found. Skipped.");
    });

    it("should log an error when given foreground layer id not present", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = [],
            foregroundLayerId = "1339";

        console.error = jest.fn();

        new LayerManager(map, backgroundLayerIds, foregroundLayerId);

        expect(console.error.mock.calls[0][0]).toBe("Foreground layer with id '1339' not found.");
    });

    it("should log an error when changing background layer to a not present id", async () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1002"],
            layerManager = new LayerManager(map, backgroundLayerIds);

        console.error = jest.fn();

        await layerManager.changeBackgroundLayer("1003").catch((err) => {
            expect(err).toEqual("Background layer with id 1003 not found");
        });

        expect(console.error.mock.calls[0][0]).toBe("Background layer with id 1003 not found");
    });

    it("should set the interaction layer on top", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayerIds),
            layerOne = new VectorLayer(),
            layerTwo = new VectorLayer();

        layerOne.set("name", "layerOne");
        layerTwo.set("name", "layerTwo");

        layerManager.setInteractionLayer(layerOne);

        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerOne");

        layerManager.setInteractionLayer(layerTwo);
        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerTwo");
    });

    it("should replace the existing interactionLayer with a new one", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayerIds),
            layerOne = new VectorLayer(),
            layerTwo = new VectorLayer();

        layerOne.set("name", "layerOne");
        layerTwo.set("name", "layerTwo");

        layerManager.setInteractionLayer(layerOne);

        expect(map.getLayers().getLength()).toBe(3);

        layerManager.setInteractionLayer(layerTwo);
        expect(map.getLayers().getLength()).toBe(3);
    });

    it("should keep the foregroundLayer 1 below the interactionLayer", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001", "1002"],
            foregroundLayerId = "2003",
            layerManager = new LayerManager(map, backgroundLayerIds, foregroundLayerId),
            layerOne = new VectorLayer(),
            layerTwo = new VectorLayer();

        layerOne.set("name", "layerOne");
        layerTwo.set("name", "layerTwo");

        layerManager.setInteractionLayer(layerOne);

        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerOne");
        expect(map.getLayers().item(map.getLayers().getLength() - 2).get("name")).toBe("My WMS");

        layerManager.setInteractionLayer(layerTwo);
        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerTwo");
        expect(map.getLayers().item(map.getLayers().getLength() - 2).get("name")).toBe("My WMS");
    });

    it("should have foreground layer on top", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001", "1002"],
            foregroundLayerId = "2003",
            layerManager = new LayerManager(map, backgroundLayerIds, foregroundLayerId);

        expect(layerManager.foregroundLayer).not.toBeNull();

        expect(layerManager.foregroundLayer.get("name")).toBe("My WMS");
        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("My WMS");

    });

    it("should initialize with interaction layer", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001"],
            foregroundLayerId = null,
            interactionLayerId = "1337",
            layerManager = new LayerManager(map, backgroundLayerIds, foregroundLayerId, interactionLayerId);

        expect(layerManager.interactionLayer.get("name")).toBe("WFS-Layer");
        expect(layerManager.interactionLayer.get("styleId")).toBe(undefined);
        expect(layerManager.interactionLayer.get("type")).toBe("WFS");
    });

    it("should log an error when given interaction layer id is not present", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001"],
            foregroundLayerId = null,
            interactionLayerId = "1336";

        console.error = jest.fn();

        new LayerManager(map, backgroundLayerIds, foregroundLayerId, interactionLayerId);

        expect(console.error.mock.calls[0][0]).toBe("Interaction layer with id '1336' not found. Skipped.");
    });

    it("should log an error when given interaction layer can't have interactions", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001"],
            foregroundLayerId = null,
            interactionLayerId = "1338";

        console.error = jest.fn();

        new LayerManager(map, backgroundLayerIds, foregroundLayerId, interactionLayerId);

        expect(console.error.mock.calls[0][0]).toBe("Interaction layer must be one of the following types: WFS, GeoJSON, Draw, Select");
    });

    it("should fail silently when given interaction layer id is not present", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001"],
            foregroundLayerId = null,
            interactionLayerId = "1336";

        console.error = jest.fn();

        // eslint-disable-next-line one-var
        const layerManager = new LayerManager(map, backgroundLayerIds, foregroundLayerId);

        layerManager.setInteractionLayerById(interactionLayerId, true);

        expect(console.error.mock.calls.length).toBe(0);
    });

    it("should fail silently when given interaction layer can't have interactions", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001"],
            foregroundLayerId = null,
            interactionLayerId = "1338";

        console.error = jest.fn();

        // eslint-disable-next-line one-var
        const layerManager = new LayerManager(map, backgroundLayerIds, foregroundLayerId);

        layerManager.setInteractionLayerById(interactionLayerId, true);

        expect(console.error.mock.calls.length).toBe(0);
    });

    it("should set the interaction layer on top by Id", () => {
        const map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D"),
            backgroundLayerIds = ["1001", "1002"],
            layerManager = new LayerManager(map, backgroundLayerIds),
            layerOne = new VectorLayer(),
            layerTwo = "1337";

        layerOne.set("name", "layerOne");

        layerManager.setInteractionLayer(layerOne);

        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("layerOne");

        layerManager.setInteractionLayerById(layerTwo);
        expect(map.getLayers().item(map.getLayers().getLength() - 1).get("name")).toBe("WFS-Layer");
    });
});
