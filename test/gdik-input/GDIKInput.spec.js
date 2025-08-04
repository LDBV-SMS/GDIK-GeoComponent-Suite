import {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

import GDIKInput from "../../src/gdik-input/GDIKInput";
import GCSMap from "../../src/components/gcs-map/GCSMap";

import * as searchConfig from "./assets/search.json";
import * as drawTypeConfig from "./assets/drawType.json";

import * as customConfig from "../components/gcs-map/assets/config.json";

describe("Init gdik-input", () => {
    const featureCollection = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [1, 1]}}]},
        value = JSON.stringify(featureCollection);

    it("can create gdik-input component", () => {
        expect(GDIKInput).toBeDefined();

        const component = new GDIKInput();

        expect(component).toBeDefined();
    });

    it("should rendered by default without draw component", () => {
        const component = new GDIKInput();

        component.connectedCallback();

        expect(component.shadowRoot.childNodes.length).toBe(1);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].childNodes.length).toBe(2);
        expect(component.shadowRoot.childNodes[0].childNodes[0].nodeName).toBe("GCS-LAYERSWITCHER");
        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-GEOLOCATION");
    });

    it("should rendered with draw component when draw-type given", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(component.shadowRoot.childNodes.length).toBe(1);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].childNodes.length).toBe(3);
        expect(component.shadowRoot.childNodes[0].childNodes[0].nodeName).toBe("GCS-LAYERSWITCHER");
        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-GEOLOCATION");
        expect(component.shadowRoot.childNodes[0].childNodes[2].nodeName).toBe("GCS-DRAW");

        expect(component.childNodes.length).toBe(1);
        expect(component.childNodes[0].nodeName).toBe("INPUT");
    });

    it("should pass attributes to child components", async () => {
        const component = new GDIKInput(),
            lon = "1",
            lat = "2",
            zoom = "8",
            activeBg = "basemapGray",
            drawType = "Point",
            lng = "en";

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);
        component.setAttribute("active-bg", activeBg);
        component.setAttribute("draw-type", drawType);
        component.setAttribute("value", value);
        component.setAttribute("lng", lng);

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("lon")).toBe(lon);
        expect(component.shadowRoot.childNodes[0].getAttribute("lat")).toBe(lat);
        expect(component.shadowRoot.childNodes[0].getAttribute("zoom")).toBe(zoom);
        expect(component.shadowRoot.childNodes[0].getAttribute("active-bg")).toBe(activeBg);
        expect(component.shadowRoot.childNodes[0].getAttribute("lng")).toBe(lng);

        expect(component.shadowRoot.childNodes[0].childNodes[2].nodeName).toBe("GCS-DRAW");
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("draw-type")).toBe(drawType);
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("feature")).toBe(value);

        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.value).toEqual(featureCollection);
    });

    it("should pass attribute changes to child components", async () => {
        const component = new GDIKInput(),
            lon = "1",
            lat = "2",
            zoom = "8",
            activeBg = "basemapGray",
            lng = "en";

        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        component.setAttribute("lon", lon);
        component.setAttribute("lat", lat);
        component.setAttribute("zoom", zoom);
        component.setAttribute("active-bg", activeBg);
        component.setAttribute("value", value);
        component.setAttribute("lng", lng);

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("lon")).toBe(lon);
        expect(component.shadowRoot.childNodes[0].getAttribute("lat")).toBe(lat);
        expect(component.shadowRoot.childNodes[0].getAttribute("zoom")).toBe(zoom);
        expect(component.shadowRoot.childNodes[0].getAttribute("active-bg")).toBe(activeBg);
        expect(component.shadowRoot.childNodes[0].getAttribute("lng")).toBe(lng);

        expect(component.shadowRoot.childNodes[0].childNodes[2].nodeName).toBe("GCS-DRAW");
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("feature")).toBe(value);

        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.value).toEqual(featureCollection);
    });

    it("should reflect child attribute changes", async () => {
        const mutationObserverMock = jest.fn(function MutationObserver () {
                this.observe = jest.fn();
            }),
            storedMutationObserver = MutationObserver,
            component = new GDIKInput(),
            changedAttributes = {
                lon: "1",
                lat: "2",
                zoom: "8",
                "active-bg": "basemapGray",
                value: value,
                "search-string": "search-string",
                lng: "en"
            };

        global.MutationObserver = mutationObserverMock;

        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(mutationObserverMock.mock.instances.length).toBe(1);

        expect(mutationObserverMock.mock.instances[0].observe).toHaveBeenCalledTimes(2);

        Object.keys(changedAttributes).forEach((k) => {
            component.handleObservedAttributeCallback([{target: {getAttribute: () => {
                return changedAttributes[k];
            }}, attributeName: k, type: "attributes"}]);
        });

        expect(component.nodeName).toBe("GDIK-INPUT");
        expect(component.getAttribute("lon")).toBe(changedAttributes.lon);
        expect(component.getAttribute("lat")).toBe(changedAttributes.lat);
        expect(component.getAttribute("zoom")).toBe(changedAttributes.zoom);
        expect(component.getAttribute("active-bg")).toBe(changedAttributes["active-bg"]);
        expect(component.getAttribute("search-string")).toBe(changedAttributes["search-string"]);
        expect(component.getAttribute("lng")).toBe(changedAttributes.lng);
        expect(component.getAttribute("value")).toBe(changedAttributes.value);
        expect(component.childNodes[0].getAttribute("value")).toBe(changedAttributes.value);
        expect(component.value).toEqual(featureCollection);

        global.MutationObserver = storedMutationObserver;
    });


});

describe("value assignment", () => {
    const featureCollection = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [1, 1]}}]},
        featureCollection2 = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [2, 2]}, "properties": null}]},
        value = JSON.stringify(featureCollection),
        value2 = JSON.stringify(featureCollection2);

    it("should set state by value on init", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");
        component.setAttribute("value", value);

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(component.value).toEqual(featureCollection);
        expect(component.getAttribute("value")).toBe(value);
        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("feature")).toBe(value);
    });

    it("should set state by value at runtime", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        component.setAttribute("value", value);

        expect(component.value).toEqual(featureCollection);
        expect(component.getAttribute("value")).toBe(value);
        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("feature")).toBe(value);
    });

    it("should set state by changed value", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");
        component.setAttribute("value", value);

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        component.setAttribute("value", value2);

        expect(component.value).toEqual(featureCollection2);
        expect(component.getAttribute("value")).toBe(value2);
        expect(component.childNodes[0].getAttribute("value")).toBe(value2);
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("feature")).toBe(value2);
    });

    it("should set state when child state is changed", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return value;
        }}, attributeName: "feature", type: "attributes"}]);

        expect(component.value).toEqual(featureCollection);
        expect(component.getAttribute("value")).toBe(value);
        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("feature")).toBe(value);
    });

    it("should not emit events when value is given before component init", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        component.setAttribute("draw-type", "Point");
        component.setAttribute("value", value);

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(dispatchEventSpy.mock.calls.length).toBe(1);
        expect(dispatchEventSpy.mock.calls.some(([evt]) => evt.type === "onConfigLoaded")).toBe(true);
        expect(dispatchEventSpy.mock.calls.some(([evt]) => evt.type === "change")).toBe(false);
    });

    it("should not emit events when component value is set from outside", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        fetch.mockResponseOnce(JSON.stringify(customConfig));

        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        component.setAttribute("value", value);

        expect(dispatchEventSpy.mock.calls.length).toBe(1);
        expect(dispatchEventSpy.mock.calls.some(([evt]) => evt.type === "onConfigLoaded")).toBe(true);
        expect(dispatchEventSpy.mock.calls.some(([evt]) => evt.type === "change")).toBe(false);

        expect(component.value).toEqual(featureCollection);
        expect(component.getAttribute("value")).toBe(value);
        expect(component.childNodes[0].getAttribute("value")).toBe(value);
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("feature")).toBe(value);

    });

    it("should emit events when value is changed by child", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        fetch.mockResponseOnce(JSON.stringify(customConfig));

        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return value;
        }}, attributeName: "feature", type: "attributes"}]);

        expect(dispatchEventSpy).toHaveBeenCalledTimes(3);
    });

    it("should pass changed value in emitted event", async () => {

        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        fetch.mockResponseOnce(JSON.stringify(customConfig));

        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return value;
        }}, attributeName: "feature", type: "attributes"}]);

        expect(dispatchEventSpy).toHaveBeenCalledTimes(3);

        // eslint-disable-next-line one-var
        const mockCalls = dispatchEventSpy.mock.calls;

        // configloaded
        expect(mockCalls[0][0]).toBeInstanceOf(CustomEvent);
        // input event
        expect(mockCalls[1][0]).toBeInstanceOf(InputEvent);
        // change event
        expect(mockCalls[2][0]).toBeInstanceOf(CustomEvent);

        // eslint-disable-next-line one-var
        const inputEvent = mockCalls[1][0],
            changeEvent = mockCalls[2][0];

        expect(inputEvent.type).toBe("input");
        expect(inputEvent.data).toEqual(value);

        expect(changeEvent.type).toBe("change");
        expect(changeEvent.detail).toEqual(featureCollection);
    });

    it("should unset value when child value is removed", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        fetch.mockResponseOnce(JSON.stringify(customConfig));

        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        component.handleObservedAttributeCallback([{target: {getAttribute: () => {
            return "";
        }}, attributeName: "feature", type: "attributes"}]);

        expect(dispatchEventSpy).toHaveBeenCalledTimes(3);

        // eslint-disable-next-line one-var
        const mockCalls = dispatchEventSpy.mock.calls;

        expect(mockCalls[0][0]).toBeInstanceOf(CustomEvent);
        expect(mockCalls[1][0]).toBeInstanceOf(InputEvent);
        expect(mockCalls[2][0]).toBeInstanceOf(CustomEvent);

        // eslint-disable-next-line one-var
        const inputEvent = mockCalls[1][0],
            changeEvent = mockCalls[2][0];

        expect(inputEvent.type).toBe("input");
        expect(inputEvent.data).toEqual("");

        expect(changeEvent.type).toBe("change");
        expect(changeEvent.detail).toEqual(null);

        expect(component.value).toEqual(null);
        expect(component.getAttribute("value")).toBe("");
        expect(component.childNodes[0].getAttribute("value")).toBe("");
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("feature")).toBe("");
    });

    it("should not break when value is set to nonsense on init", async () => {
        const component = new GDIKInput();

        component.setAttribute("draw-type", "Point");
        component.setAttribute("value", "foobar");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(component.value).toEqual(null);
        expect(component.getAttribute("value")).toBe("foobar");
        expect(component.childNodes[0].getAttribute("value")).toBe("");
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("feature")).toBe("");
    });

    it("should not break when value is set to nonsense at runtime", async () => {
        const component = new GDIKInput(),
            dispatchEventSpy = jest.spyOn(component, "dispatchEvent");

        fetch.mockResponseOnce(JSON.stringify(customConfig));

        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        component.setAttribute("value", "foobar");

        expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

        // eslint-disable-next-line one-var
        const mockCalls = dispatchEventSpy.mock.calls;

        expect(mockCalls[0][0]).toBeInstanceOf(CustomEvent);
        expect(mockCalls[0][0].type).toBe("onConfigLoaded");

        expect(component.value).toEqual(null);
        expect(component.getAttribute("value")).toBe("foobar");
        expect(component.childNodes[0].getAttribute("value")).toBe("");
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("feature")).toBe("");
    });
});

describe("config file handling", () => {

    let mockedFetchConfig;

    beforeEach(() => {
        mockedFetchConfig = jest.spyOn(GCSMap.prototype, "fetchConfig");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should load given config url", async () => {
        const component = new GDIKInput(),
            configUrl = "https://config";

        mockedFetchConfig.mockImplementation(() => JSON.parse(JSON.stringify(searchConfig)));

        component.setAttribute("config-url", configUrl);

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].getAttribute("config-url")).toBe(configUrl);

        expect(mockedFetchConfig).toHaveBeenCalledWith(configUrl);
    });

    it("should trigger onConfigLoaded event when config is loaded", async () => {
        const component = new GDIKInput(),
            configUrl = "https://config",
            spy = jest.spyOn(component, "dispatchEvent");

        mockedFetchConfig.mockImplementation(() => JSON.parse(JSON.stringify(searchConfig)));

        component.setAttribute("config-url", configUrl);

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(spy).toBeCalledWith(expect.objectContaining({
            type: "onConfigLoaded"
        }));
    });

    it("should trigger onConfigLoaded event with default config when no config-url is set", async () => {
        fetch.mockResponseOnce(JSON.stringify(customConfig));
        const component = new GDIKInput(),
            spy = jest.spyOn(component, "dispatchEvent");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(spy).toBeCalledWith(expect.objectContaining({
            type: "onConfigLoaded"
        }));
    });

    it("should set draw type by config file value", async () => {
        const component = new GDIKInput(),
            configUrl = "https://config";

        mockedFetchConfig.mockImplementation(() => JSON.parse(JSON.stringify(drawTypeConfig)));

        component.setAttribute("config-url", configUrl);

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(component.shadowRoot.childNodes.length).toBe(1);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].childNodes.length).toBe(3);
        expect(component.shadowRoot.childNodes[0].childNodes[0].nodeName).toBe("GCS-LAYERSWITCHER");
        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-GEOLOCATION");
        expect(component.shadowRoot.childNodes[0].childNodes[2].nodeName).toBe("GCS-DRAW");
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("draw-type")).toBe("Point");
    });

    it("should use draw-type attribute over config file value", async () => {
        const component = new GDIKInput(),
            configUrl = "https://config";

        mockedFetchConfig.mockImplementation(() => JSON.parse(JSON.stringify(drawTypeConfig)));

        component.setAttribute("config-url", configUrl);
        component.setAttribute("draw-type", "Polygon");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(component.shadowRoot.childNodes.length).toBe(1);
        expect(component.shadowRoot.childNodes[0].nodeName).toBe("GCS-MAP");
        expect(component.shadowRoot.childNodes[0].childNodes.length).toBe(3);
        expect(component.shadowRoot.childNodes[0].childNodes[0].nodeName).toBe("GCS-LAYERSWITCHER");
        expect(component.shadowRoot.childNodes[0].childNodes[1].nodeName).toBe("GCS-GEOLOCATION");
        expect(component.shadowRoot.childNodes[0].childNodes[2].nodeName).toBe("GCS-DRAW");
        expect(component.shadowRoot.childNodes[0].childNodes[2].getAttribute("draw-type")).toBe("Polygon");
    });

    it("should add search component when searchUrl defined in loaded config", async () => {
        const component = new GDIKInput(),
            configUrl = "https://config";

        mockedFetchConfig.mockImplementation(async () => JSON.parse(JSON.stringify(searchConfig)));

        component.setAttribute("config-url", configUrl);

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(component.searchElement).toBeDefined();
        expect(component.searchElement.nodeName).toBe("GCS-SEARCH");
    });

    it.todo("should not break when a gdik-select config is passed");
});

describe("public functions", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should call map getImage method", async () => {
        // eslint-disable-next-line no-empty-function
        const gcsMapGetImage = jest.spyOn(GCSMap.prototype, "getImage").mockImplementation(() => {}),
            component = new GDIKInput();

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        component.getImage();

        expect(gcsMapGetImage).toHaveBeenCalled();
    });

    it("should call map fit method when component have a value", async () => {
        // eslint-disable-next-line no-empty-function
        const gcsMapFit = jest.spyOn(GCSMap.prototype, "fit").mockImplementation(() => {}),
            component = new GDIKInput(),
            geometry = {"type": "Point", "coordinates": [1, 1]},
            jsonValue = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": geometry}]},
            value = JSON.stringify(jsonValue);

        component.setAttribute("value", value);
        component.setAttribute("draw-type", "Point");

        document.body.appendChild(component);
        await new Promise(process.nextTick);

        expect(component.value).toEqual(jsonValue);

        component.centerToFeature();

        expect(gcsMapFit).toHaveBeenCalledWith(geometry);
    });
});