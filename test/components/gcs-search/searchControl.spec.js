import mapsAPI from "masterportalAPI/src/maps/api.js";
import {getCenter} from "ol/extent";

import SearchControl from "../../../src/components/gcs-search/searchControl";
import * as defaultConfig from "../../../src/components/gcs-map/assets/config.json";
import * as searchResult from "./assets/searchResults.json";

import {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

describe("Search", () => {
    const options = {
            searchUrl: "https://search"
        },
        searchString = "Oldenburg";

    let map;

    beforeEach(() => {
        fetch.resetMocks();
        fetch.mockResponseOnce(JSON.stringify(searchResult));

        map = mapsAPI.map.createMap({...defaultConfig.portal, layerConf: defaultConfig.services}, "2D");
    });

    it("should have added search control", () => {
        expect(SearchControl).toBeDefined();

        const control = new SearchControl(options);

        expect(control.element.className).toBe("ol-control gcs-search");
        expect(control.element.children.length).toBe(2);
        expect(control.element.firstChild.nodeName).toBe("INPUT");
        expect(control.element.lastChild.nodeName).toBe("DIV");
        expect(control.element.lastChild.className).toBe("gcs-search-results");
    });

    it("should start search on enter press", () => {
        const control = new SearchControl(options);

        map.addControl(control);

        control.element.firstChild.value = searchString;
        // simulate enter pressed in input element
        control.handleSearch({keyCode: 13, target: control.element.firstChild, preventDefault: () => {
            // noop
        }, stopPropagation: () => {
            // noop
        }});

        expect(fetch).toHaveBeenCalledWith("https://search?outputformat=json&srsName=EPSG:25832&query=" + searchString + "&count=5");
    });

    it("should render search results", () => {
        const control = new SearchControl(options);

        control.renderResponse(searchResult);

        expect(control.element.lastChild.children.length).toBe(5);

        for (let i = 0; i < control.element.lastChild.children.length; i++) {
            expect(control.element.lastChild.children[i].innerHTML).toBe(searchResult.features[i].properties.text);
        }
    });

    it("should move map to search result coordinate and show selected search text", () => {
        const control = new SearchControl(options),
            resultText = "teststring",
            resultCoord = [450010.0, 5500010.0];

        map.addControl(control);

        control.showResult(resultText, resultCoord);

        expect(control.element.firstChild.value).toBe(resultText);


        expect(map.getView().getCenter()).toEqual(resultCoord);
        // default fallback zoom level
        expect(map.getView().getZoom()).toBe(11);
    });

    it("should move to search result bbox instead of coordinate and fit zoom to bbox", () => {
        const control = new SearchControl(options),
            resultText = "teststring",
            resultCoord = [450010.0, 5500010.0],
            resultBBox = [441632.41251335153, 5881752.268513008, 452479.6627111422, 5895430.011182868];

        map.addControl(control);

        control.showResult(resultText, resultCoord, resultBBox);

        expect(control.element.firstChild.value).toBe(resultText);

        expect(map.getView().getCenter()).toEqual([447056.0376122469, 5888591.139847938]);
        // zoom level defined by bbox
        expect(map.getView().getZoom()).toBe(3);
    });

    it("should zoom map to defined zoom level", () => {
        const fallbackResultZoomLevel = 10,
            control = new SearchControl({fallbackResultZoomLevel: fallbackResultZoomLevel, ...options}),
            resultText = "teststring",
            resultCoord = [450010.0, 5500010.0];

        map.addControl(control);

        control.showResult(resultText, resultCoord);

        expect(control.element.firstChild.value).toBe(resultText);


        expect(map.getView().getCenter()).toEqual(resultCoord);
        expect(map.getView().getZoom()).toBe(fallbackResultZoomLevel);
    });

    it("should select first search result when passing search string in constructor", async () => {
        const control = new SearchControl({searchString: searchString, ...options}),
            resultText = searchResult.features[0].properties.text,
            resultCoord = getCenter(searchResult.features[0].bbox);

        map.addControl(control);
        await new Promise(process.nextTick);

        expect(control.element.firstChild.value).toBe(resultText);
        expect(map.getView().getCenter()).toEqual(resultCoord);
    });

    it("should select first search result when searchString property is changed", async () => {
        const control = new SearchControl(options),
            resultText = searchResult.features[0].properties.text,
            resultCoord = getCenter(searchResult.features[0].bbox);

        map.addControl(control);
        await new Promise(process.nextTick);

        expect(control.element.firstChild.value).toBe("");
        expect(map.getView().getCenter()).toEqual(defaultConfig.portal.startCenter);

        control.set("searchString", searchString);
        await new Promise(process.nextTick);

        expect(control.element.firstChild.value).toBe(resultText);
        expect(map.getView().getCenter()).toEqual(resultCoord);
    });

});