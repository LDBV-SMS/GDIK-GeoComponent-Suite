import i18next from "i18next";

import mapsAPI from "masterportalAPI/src/maps/api.js";

import LayerswitcherControl from "../../../src/components/gcs-layerswitcher/layerswitcherControl";

import LayerManager from "../../../src/components/gcs-map/LayerManager";

import * as _defaultConfig from "../gcs-map/assets/config.json";

describe("Layerswitcher", () => {
    const defaultConfig = JSON.parse(JSON.stringify(_defaultConfig));

    let layerManager, map;

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
            }
        ];

        map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");
        layerManager = new LayerManager(map, ["1001", "1002"]);
    });

    it("should init layerswitcher", () => {
        expect(LayerswitcherControl).toBeDefined();

        const control = new LayerswitcherControl(layerManager, i18next);

        expect(control.element.className).toBe("ol-control gcs-layerswitcher");
        expect(control.element.firstChild.nodeName).toBe("BUTTON");
        expect(control.element.lastChild.firstChild.nodeName).toBe("UL");
        expect(control.element.lastChild.lastChild.nodeName).toBe("BUTTON");
    });

    it("should render layer entry as expected", () => {
        const control = new LayerswitcherControl(layerManager, i18next);

        control.setMap(map);

        // TODO review lint settings
        let layerEntries = [];

        layerEntries = control.element.querySelectorAll("div ul li");

        expect(layerEntries.length).toBe(2);

        layerEntries.forEach((layerEntry, idx) => {
            expect(layerEntry.nodeName).toBe("LI");
            expect(layerEntry.className).toContain("list-group-item");
            expect(layerEntry.innerHTML).toBe(defaultConfig.services[idx].name);
        });
    });

    it("should change visible background layer", async () => {
        const control = new LayerswitcherControl(layerManager, i18next);

        control.setMap(map);

        let layerEntries = [];

        layerEntries = control.element.querySelectorAll("div ul li");

        expect(layerEntries[0].className).toBe("list-group-item active");
        expect(map.getLayers().item(0).getVisible()).toBe(true);
        expect(layerEntries[1].className).toBe("list-group-item");
        expect(map.getLayers().item(1).getVisible()).toBe(false);

        await control.handleBackgroundLayerChange("1002").then(() => {
            layerEntries = control.element.querySelectorAll("div ul li");

            expect(layerEntries[0].className).toBe("list-group-item");
            expect(map.getLayers().item(0).getVisible()).toBe(false);
            expect(layerEntries[1].className).toBe("list-group-item active");
            expect(map.getLayers().item(1).getVisible()).toBe(true);
        });

    });

    it("should toggle open and close element", () => {
        const control = new LayerswitcherControl(layerManager, i18next);

        let opener = control.element.querySelector("button"),
            listContainer = control.element.querySelector("div div"),
            closer = control.element.querySelector("div div button");

        expect(opener.className).toBe("");
        expect(listContainer.className).toBe("list-container hidden");
        expect(closer.className).toBe("closer");

        opener.click();

        opener = control.element.querySelector("button");
        listContainer = control.element.querySelector("div div");
        closer = control.element.querySelector("div div button");

        expect(opener.className).toBe("hidden");
        expect(listContainer.className).toBe("list-container");
        expect(closer.className).toBe("closer");

        closer.click();

        opener = control.element.querySelector("button");
        listContainer = control.element.querySelector("div div");
        closer = control.element.querySelector("div div button");

        expect(opener.className).toBe("");
        expect(listContainer.className).toBe("list-container hidden");
        expect(closer.className).toBe("closer");
    });
});