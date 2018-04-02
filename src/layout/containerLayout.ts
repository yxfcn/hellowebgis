///<reference path="../../typings.d.ts"/>

import parser = require("dojo/parser");
import ready = require("dojo/domReady");
import TDT = require("../tdt/TDTLayer");
import ArcGISDynamicMapServiceLayer = require("esri/layers/ArcGISDynamicMapServiceLayer");
import Map = require("esri/map");
import dom=require("dojo/dom");
var map: Map;

ready(function () {
    parser.parse();
    var mapNode:any;
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

