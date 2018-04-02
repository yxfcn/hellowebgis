///<reference path="../typings.d.ts"/>
define(["require", "exports", "./tdt/TDTLayer", "esri/map", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/config", "dojo/dom", "esri/toolbars/draw", "esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/on", "esri/tasks/GeometryService", "esri/toolbars/edit", "dojo/_base/event"], function (require, exports, TDT, Map, ArcGISDynamicMapServiceLayer, esriConfig, dom, Draw, SimpleMarkerSymbol, Graphic, on, GeometryService, Edit, dojoEvent) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* esriConfig.defaults.map.panDuration = 1; // time in milliseconds, default panDuration: 350
    esriConfig.defaults.map.panRate = 1; // default panRate: 25
    esriConfig.defaults.map.zoomDuration = 100; // default zoomDuration: 500
    esriConfig.defaults.map.zoomRate = 1; // default zoomRate: 25
     */
    console.log("Here is file named 'main.js'");
    var map;
    var toolbar;
    var drawNode;
    var landuse_lh_add;
    var editTool;
    esriConfig.defaults.geometryService = new GeometryService("http://60.191.132.130:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
    var tdtLayer = new TDT.TDTLayer("vec");
    var ZJ_TZ_LH_ADDV_TOWN = new ArcGISDynamicMapServiceLayer("http://60.191.132.130:6080/arcgis/rest/services/ZJ_TZ_LH_ADDV_TOWN/MapServer");
    var tdt_an = new TDT.TDTLayer("cva");
    var layer_counts = 0;
    ZJ_TZ_LH_ADDV_TOWN.on("load", function (service) {
        layer_counts += 1;
        console.log("ZJ_TZ_LH_RIVER_TOWN has been load");
        console.log("layer_counts=" + layer_counts);
        if (layer_counts == 1) {
            createMapLayers();
        }
    });
    tdt_an.on("load", function (service) {
        layer_counts += 1;
        console.log("tdt_an has been load");
        console.log("layer_counts=" + layer_counts);
        if (layer_counts == 1) {
            createMapLayers();
        }
    });
    /* landuse_lh.on("load", function (service) {
        layer_counts += 1;
        
        console.log("landuse_lh has been load");
        console.log("layer_counts="+layer_counts);
        if (layer_counts == 2) {
            createMapLayers();
        }
    }); */
    tdtLayer.on("load", function (service) {
        layer_counts += 1;
        console.log("tdtLayer has been load");
        console.log("layer_counts=" + layer_counts);
        if (layer_counts == 1) {
            createMapLayers();
        }
    });
    function createMapLayers() {
        console.log("construct a map");
        map = new Map("map", {
            extent: TDT.LH_Extent
        });
        console.log("Begining adding layers to the map");
        map.addLayer(tdtLayer, 0);
        map.addLayer(ZJ_TZ_LH_ADDV_TOWN, 1);
        map.addLayer(tdt_an, 9);
        map.on("load", onMapLoad);
        drawNode = dom.byId("MultiPoint");
        on(drawNode, "click", drawStart);
        map.graphics.on("click", function (evt) {
            dojoEvent.stop(evt);
            crateToolbarsEdit();
            editTool.activate(Edit.MOVE, evt.graphic);
            editTool.on("graphic-move-stop", function () {
                editTool.deactivate();
            });
        });
    }
    function onMapLoad() {
        console.log("map has been loaded,the first layer has been added to the map");
    }
    function createToolbarsDraw() {
        console.log("create the draw toolbar");
        toolbar = new Draw(map, {
            drawTime: 5,
            tolerance: 5
        });
        on(toolbar, "draw-complete", function (evt) {
            drawEnd(evt);
        });
    }
    function crateToolbarsEdit() {
        console.log("create the edit tool");
        editTool = new Edit(map);
    }
    function drawStart() {
        createToolbarsDraw();
        toolbar.activate(Draw.POINT);
        console.log("draw is being activated");
        map.hideZoomSlider();
        map.disableScrollWheelZoom();
    }
    function drawEnd(evt) {
        console.log("draw end");
        toolbar.deactivate();
        var draw_result = new Graphic(evt.geometry, new SimpleMarkerSymbol());
        map.graphics.add(draw_result);
        map.showZoomSlider();
        map.enableScrollWheelZoom();
    }
});
//# sourceMappingURL=main.js.map