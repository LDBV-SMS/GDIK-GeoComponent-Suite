import i18next from "i18next";

import rawLayerList from "masterportalAPI/src/rawLayerList.js";

import GeolocationControl from "../../../src/components/gcs-geolocation/geolocationControl";

describe("Geolocation", () => {

    let rawLayers;

    beforeEach(() => {
        rawLayers = [
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


        rawLayerList.initializeLayerList(rawLayers);
    });

    it("should init geolocation", () => {
        expect(GeolocationControl).toBeDefined();

        const control = new GeolocationControl(i18next);

        expect(control.element.className).toBe("ol-control gcs-geolocation");
        expect(control.element.firstChild.nodeName).toBe("BUTTON");
    });
});