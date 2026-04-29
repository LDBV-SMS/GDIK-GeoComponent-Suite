import {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

import GCSMap from "../../../src/components/gcs-map/GCSMap";
import * as defaultConfig from "../../../src/components/gcs-map/assets/config.json";
import * as customConfig from "./assets/config.json";
import * as customConfig2 from "./assets/config2.json";
import * as customConfig3 from "./assets/config3.json";

describe("Init gcs-map", () => {

    beforeEach(() => {
        fetch.resetMocks();
    });

    it("can create gcs-map component", () => {
        expect(GCSMap).toBeDefined();

        const component = new GCSMap();

        expect(component).toBeDefined();
    });

    it("should render gcs-map component", async () => {
        const component = new GCSMap();

        await component.connectedCallback();

        expect(component.shadowRoot.childNodes.length).toBe(3);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("STYLE");
        expect(component.shadowRoot.childNodes[1].nodeName).toBe("DIV");
        expect(component.shadowRoot.childNodes[2].nodeName).toBe("SLOT");

        expect(component.shadowRoot.childNodes[1].firstChild.className).toBe("ol-viewport ol-touch");
    });

    it("should use values from default config", async () => {
        const component = new GCSMap();

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(defaultConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(defaultConfig.portal.startCenter[1]);

        expect(Number(component.getAttribute("zoom"))).toBe(defaultConfig.portal.startZoomLevel);

        expect(component.map.getView().getCenter()).toEqual(defaultConfig.portal.startCenter);

        expect(component.getAttribute("active-bg")).toBe("basemapColor");
    });

    it("should use values from given config", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig));
        const component = new GCSMap(),
            loadedConfig = await component.fetchConfig("http://config.service/config.json");

        expect(loadedConfig).not.toBe(false);
        expect(loadedConfig.portal).not.toBe(undefined);
        expect(loadedConfig).toEqual(customConfig);
    });

    it("should apply loaded config values to element attributes", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig));
        const component = new GCSMap();

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();

        expect(fetch).toBeCalledWith("http://config.service/config.json");

        expect(Number(component.getAttribute("lon"))).toBe(customConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(customConfig.portal.startCenter[1]);
        expect(Number(component.getAttribute("zoom"))).toBe(customConfig.portal.startZoomLevel);

        expect(component.map.getView().getCenter()).toEqual(customConfig.portal.startCenter);

        expect(component.getAttribute("active-bg")).toBe(customConfig.component.backgroundLayers[0]);
    });

    it("should apply values given by element attributes", async () => {
        const component = new GCSMap(),
            lon = 450000.0,
            lat = 5500000.0,
            zoom = 8;

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(lon);
        expect(Number(component.getAttribute("lat"))).toBe(lat);

        expect(component.map.getView().getCenter()).toEqual([lon, lat]);
        expect(Number(component.map.getView().getZoom())).toBe(zoom);
    });

    it("should set language to language defined by attribute on init", async () => {
        const component = new GCSMap(),
            spy = jest.spyOn(component.i18next, "changeLanguage");

        component.setAttribute("lng", "en");

        await component.connectedCallback();

        expect(spy).toBeCalledWith("en");
    });
});

describe("Attribute active-bg", () => {
    beforeAll(() => {
        jest.spyOn(console, "error").mockImplementation(() => {
            // noop
        });
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    afterEach(() => {
        console.error.mockClear();
    });

    it("should use background layer given by attribute for init", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig));
        const component = new GCSMap(),
            backgroundLayer = "1002";

        component.setAttribute("config-url", "http://config.service/config.json");

        component.setAttribute("active-bg", backgroundLayer);
        await component.connectedCallback();

        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe(backgroundLayer);
    });

    it("should change background layer when attribute changes", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig));
        const component = new GCSMap(),
            backgroundLayer = "1002";

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();
        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe("1001");

        component.setAttribute("active-bg", backgroundLayer);

        await new Promise(process.nextTick);

        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe(backgroundLayer);
    });

    it("should log an error when background layer cannot be found on init", async () => {
        const component = new GCSMap(),
            backgroundLayer = "1003";

        console.error = jest.fn();

        component.setAttribute("active-bg", backgroundLayer);
        await component.connectedCallback();
        expect(console.error.mock.calls[0][0]).toBe("Background layer with id 1003 not found");

        expect(component.getAttribute("active-bg")).toBe("basemapColor");
        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe("basemapColor");
    });

    it("should log an error when background layer cannot be found on attribute change", async () => {
        const component = new GCSMap(),
            backgroundLayer = "1003";

        console.error = jest.fn();

        await component.connectedCallback();

        expect(component.getAttribute("active-bg")).toBe("basemapColor");

        component.setAttribute("active-bg", backgroundLayer);

        await new Promise(process.nextTick);

        expect(console.error.mock.calls[0][0]).toBe("Background layer with id 1003 not found");
        expect(component.getAttribute("active-bg")).toBe("basemapColor");
        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe("basemapColor");
    });
});

describe("Attribute change related", () => {
    it("should change map content on component attribute change", async () => {
        const component = new GCSMap(),
            lon = 450000.0,
            lat = 5500000.0,
            zoom = 8,
            backgroundLayer = "basemapGray";

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(defaultConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(defaultConfig.portal.startCenter[1]);
        expect(Number(component.getAttribute("zoom"))).toBe(defaultConfig.portal.startZoomLevel);

        expect(component.getAttribute("active-bg")).toBe(defaultConfig.component.backgroundLayers[0]);

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);
        component.setAttribute("active-bg", backgroundLayer);

        await new Promise(process.nextTick);

        expect(component.map.getView().getCenter()).toEqual([lon, lat]);
        expect(component.map.getView().getZoom()).toBe(zoom);

        expect(component.layerManager.activeBackgroundLayer.get("id")).toBe(backgroundLayer);
    });

    it("should change lon lat attributes when map center changed", async () => {
        const component = new GCSMap(),
            center = [450000.0, 5500000.0];

        await component.connectedCallback();

        expect(Number(component.getAttribute("lon"))).toBe(defaultConfig.portal.startCenter[0]);
        expect(Number(component.getAttribute("lat"))).toBe(defaultConfig.portal.startCenter[1]);

        component.map.getView().setCenter(center);
        component.map.dispatchEvent("moveend");

        expect(Number(component.getAttribute("lon"))).toBe(center[0]);
        expect(Number(component.getAttribute("lat"))).toBe(center[1]);
    });

    it("should change zoom attribte when map zoom changes", async () => {
        const component = new GCSMap(),
            zoom = 8;

        await component.connectedCallback();

        expect(Number(component.getAttribute("zoom"))).toBe(defaultConfig.portal.startZoomLevel);

        component.map.getView().setZoom(zoom);
        component.map.dispatchEvent("moveend");

        expect(Number(component.getAttribute("zoom"))).toBe(zoom);
    });

    it("shoud change background layer attribute when background layer changes", async () => {
        const component = new GCSMap(),
            backgroundLayer = "basemapGray";

        await component.connectedCallback();

        expect(component.getAttribute("active-bg")).toBe(defaultConfig.component.backgroundLayers[0]);

        component.layerManager.changeBackgroundLayer(backgroundLayer);

        expect(component.getAttribute("active-bg")).toBe(backgroundLayer);
    });

    it("should change language when lng attribute value changes", async () => {
        const component = new GCSMap(),
            spy = jest.spyOn(component.i18next, "changeLanguage");

        await component.connectedCallback();

        expect(component.getAttribute("lng")).toBe("de");

        component.setAttribute("lng", "en");

        expect(spy).toBeCalledWith("en");
    });
});

describe("Reading of config.json", () => {

    beforeEach(() => {
        jest.resetAllMocks();
        fetch.resetMocks();
    });

    it("should initialize LayerManager correctly with foregroundLayer and backgroundLayer", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig)); // customConfig has a foregroundLayer defined
        const component = new GCSMap();

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();

        expect(component.layerManager.backgroundLayers.length).toBe(2);
        expect(component.layerManager.foregroundLayer).not.toBeNull();
        expect(component.layerManager.foregroundLayer.get("name")).toBe("My WMS");
    });

    it("should initialize LayerManager correctly without foregroundLayer", async () => {
        const component = new GCSMap(); // defaultConfig has no foregroundLayer defined

        await component.connectedCallback();

        expect(component.layerManager.backgroundLayers.length).toBe(2);
        expect(component.layerManager.foregroundLayer).toBeNull();
    });

    it("should initialize StyleManager correctly with style defined", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig2));
        const component = new GCSMap();

        console.error = jest.fn();

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();

        expect(Array.isArray(component.styleManager.styleList)).toBe(true);
        expect(component.styleManager.styleList.length).toBe(1);
        expect(console.error.mock.calls.length).toBe(0);
    });

    it("should initialize StyleManager correctly without style defined", async () => {
        const component = new GCSMap();

        await component.connectedCallback();

        expect(Array.isArray(component.styleManager.styleList)).toBe(true);
        expect(component.styleManager.styleList.length).toBe(0);
    });

    it("should initialize LayerManager correctly with interactionLayer", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig3)); // customConfig3 has an interactionLayer defined
        const component = new GCSMap();

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();

        expect(component.layerManager.backgroundLayers.length).toBe(2);
        expect(component.layerManager.interactionLayer).not.toBeNull();
        expect(component.layerManager.interactionLayer.get("name")).toBe("WFS-Layer");
    });

    it("should initialize LayerManager correctly without interactionLayer", async () => {
        const component = new GCSMap(); // defaultConfig has no interaction defined

        await component.connectedCallback();

        expect(component.layerManager.backgroundLayers.length).toBe(2);
        expect(component.layerManager.interactionLayer).toBeNull();
    });

    it("should initialize StyleManager correctly with interactionLayer Style defined", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig3));
        const component = new GCSMap();

        console.error = jest.fn();

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();

        expect(Array.isArray(component.styleManager.styleList)).toBe(true);
        expect(component.styleManager.getInteractionLayerStyleId()).toBe("1");
        expect(component.styleManager.styleList.length).toBe(2);
        expect(console.error.mock.calls.length).toBe(0);
    });

    it("should initialize StyleManager correctly with interactionLayer highlight style defined", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig3));
        const component = new GCSMap();

        console.error = jest.fn();

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();

        expect(Array.isArray(component.styleManager.styleList)).toBe(true);
        expect(component.styleManager.getInteractionLayerHighlightStyleId()).toBe("2");
        expect(component.styleManager.styleList.length).toBe(2);
        expect(console.error.mock.calls.length).toBe(0);
    });
});


describe("public functions", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        // setupJestCanvasMock();
    });

    it.todo("should return current OL canvas content");
    // , async () => {
    //    const target = document.createElement("div"),
    //        component = new GCSMap();

    //    document.querySelector("body").appendChild(target);

    //    target.appendChild(component);

    //    await component.mapPromise;

    //    // Map element don't have a canvas.
    //    // Probably this is related to jest-canvas-mock or/and jest-environment-jsdom?
    //    expect(component.getImage()).toMatch(new RegExp("^data:image/([a-zA-Z]*);base64,.*$"));
    // });

    it("should center map on given feature", async () => {
        const component = new GCSMap(),
            coordinate = [455555.0, 5555555.0],
            geometry = {"type": "Point", "coordinates": coordinate};

        await component.connectedCallback();

        expect(component.map.getView().getCenter()).not.toEqual(coordinate);

        component.fit(geometry);

        expect(component.map.getView().getCenter()).toEqual(coordinate);
    });
});

describe("Event triggering", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        fetch.resetMocks();
    });

    it("should trigger configloaded event when config is loaded", async () => {
        fetch.mockResponse(JSON.stringify(customConfig));
        const component = new GCSMap(),
            spy = jest.spyOn(component, "dispatchEvent");

        component.setAttribute("config-url", "http://config.service/config.json");

        await component.connectedCallback();

        expect(spy).toBeCalledWith(expect.objectContaining({
            type: "configloaded"
        }));

        expect(spy.mock.calls[0][0].detail.portal.startCenter).toEqual(customConfig.portal.startCenter);
    });

    it("should trigger configloaded event with default config when no config-url is set", async () => {
        const component = new GCSMap(),
            spy = jest.spyOn(component, "dispatchEvent");

        await component.connectedCallback();

        expect(spy).toBeCalledWith(expect.objectContaining({
            type: "configloaded"
        }));
    });
});