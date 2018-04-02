///<reference path="../../typings.d.ts"/>
define(["require", "exports", "dojo/parser", "dojo/domReady", "../tdt/TDTLayer", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/map"], function (require, exports, parser, ready, TDT, ArcGISDynamicMapServiceLayer, Map) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var map;
    ready(function () {
        parser.parse();
        var mapNode;
        var tdtLayer = new TDT.TDTLayer("vec");
        var ZJ_TZ_LH_ADDV_TOWN = new ArcGISDynamicMapServiceLayer("http://60.191.132.130:6080/arcgis/rest/services/ZJ_TZ_LH_ADDV_TOWN/MapServer");
        var tdt_an = new TDT.TDTLayer("cva");
        //mapNode=dom.byId("map");
        map = new Map("mapDiv", {
            extent: TDT.LH_Extent
        });
        console.log("Begining adding layers to the map");
        map.addLayer(tdtLayer, 0);
        map.addLayer(ZJ_TZ_LH_ADDV_TOWN, 1);
        map.addLayer(tdt_an, 9);
    });
});
//# sourceMappingURL=containerLayout.js.map