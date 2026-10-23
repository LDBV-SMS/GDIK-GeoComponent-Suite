import OSGTS from "../../../../src/components/gcs-search/type/osgts.js";

import * as searchResult from "../assets/searchResults.json";

import {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();


describe("OpenSearch Geo and Time Extensions", () => {
    const options = {
        searchUrl: "https://search",
        srs: "epsg:25832"
    };

    beforeEach(() => {
        fetch.resetMocks();
        fetch.mockResponseOnce(JSON.stringify(searchResult));
    });

    it("should init OSGTS", () => {
        expect(OSGTS).toBeDefined();

        const osgts = new OSGTS(options);

        expect(osgts).toBeDefined();
    });

    it("should request search results with given parameters", async () => {
        const osgts = new OSGTS(options),
            result = await osgts.search("Oldenburg");

        expect(fetch).toHaveBeenCalledWith("https://search?outputformat=json&srsName=epsg:25832&query=Oldenburg&count=5");

        expect(result).toEqual(searchResult);
    });

    it("should request search results with additional bbox", async () => {
        const osgts = new OSGTS(Object.assign({}, options, {extent: [123, 321, 124, 322]})),
            result = await osgts.search("Oldenburg");

        expect(fetch).toHaveBeenCalledWith("https://search?outputformat=json&bbox=123,321,124,322&srsName=epsg:25832&query=Oldenburg&count=5");

        expect(result).toEqual(searchResult);
    });
});