///<reference path="../../typings.d.ts"/>

import Map = require("esri/map");
import parser = require("dojo/parser");
import ArcGISDynamicMapServiceLayer = require("esri/layers/ArcGISDynamicMapServiceLayer");
import ArcGISTiledMapServiceLayer = require("esri/layers/ArcGISTiledMapServiceLayer");
import ClassBreaksDefinition = require("esri/tasks/ClassBreaksDefinition");
import AlgorithmicColorRamp = require("esri/tasks/AlgorithmicColorRamp");
import GenerateRendererTask = require("esri/tasks/GenerateRendererTask");
import GenerateRendererParameters = require("esri/tasks/GenerateRendererParameters");
import LayerDrawingOptions = require("esri/layers/LayerDrawingOptions");
import Legend = require("esri/dijit/Legend");
import arrayUtils = require("dojo/_base/array");
import Color = require("esri/Color");
import domStyle = require("dojo/dom-style");
import registry = require("dijit/registry");
import esriRequest = require("esri/request");
import esriConfig = require("esri/config");
import Memory = require("dojo/store/Memory");
import ready = require("dojo/domReady");
import SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");
import dom = require("dojo/dom");
import Layer = require("esri/layers/layer");
import FilteringSelect=require("dijit/form/FilteringSelect");


parser.parse();

console.log("come in the dynamiclayers");
class App {
    dataUrl: string;

    // color region
    defaultFrom: string;
    defaultTo: string;
    map: Map;
    legend: Legend;

}

var app = new App();
//解析页面


//定义数据地址
app.dataUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2";
// add US Counties as a dynamic map service layer
var urlDyn = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer";


//颜色范围
app.defaultFrom = "#ffffcc";
app.defaultTo = "#006837";

//底图（切片）
var basemap = new ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer");
//切片地图服务
var ref = new ArcGISTiledMapServiceLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer");

var usaLayer = new ArcGISDynamicMapServiceLayer(urlDyn, {
    id: "us_counties",
    opacity: 0.7,
    visible: false
});


esriConfig.defaults.io.proxyUrl = "/proxy/";


app.map = new Map("map", {
    center: [-85.787, 39.782],
    zoom: 6,
    slider: false
});
usaLayer.setVisibleLayers([2]);
app.map.addLayer(basemap);
app.map.addLayer(ref);
app.map.addLayer(usaLayer);



// get field info
/**-------------esri/request-----------------
 * 作用：Retrieve data from a remote server or upload a file.
 * 
 * 先决条件：需要查询的数据地址、查询参数、返回的数据格式要求
 * 
 */

var fieldNamesWidget;
var fieldNames: object, fieldStore;
fieldNames = { identifier: "value", label: "name", items: [] };
ready(function () {
    fieldNamesWidget = registry.byId("fieldNames");
});

var countyFields = esriRequest({
    url: app.dataUrl,
    content: {
        f: "json"
    },
    handleAs: "json",//默认是"json"
    callbackParamName: "callback" //只用于JSONP格式，对于arcgis服务，一般都是 "callback"
});


// update renderer when field name changes
countyFields.then(function (resp) {
    //console.log(resp);
    arrayUtils.forEach(resp.fields.slice(6, 16), function (f) { // add some field names to the FS
        fieldNames.items.push({ "name": f.name, "value": f.name });// 获取字段信息
    });
    fieldStore = new Memory({ data: fieldNames }); //不使用ItemFileReadStore
    fieldNamesWidget.set("store", fieldStore);
    fieldNamesWidget.set("value", "POP2007"); // set a value
    fieldNamesWidget.on("change", getData);
fieldNamesWidget.set("value", "POP_2007"); // triggers getData()
}, function (err) {
    console.log("failed to get field names: ", err);
});





function getData() {
    classBreaks(app.defaultFrom, app.defaultTo);
}

function classBreaks(c1: string, c2: string) {
    var classDef = new ClassBreaksDefinition();//?2018-03-22
    classDef.classificationField = registry.byId("fieldNames").get("value") || "POP2000";
    classDef.classificationMethod = "natural-breaks"; // always natural breaks
    classDef.breakCount = 5; // always five classes

    var colorRamp = new AlgorithmicColorRamp();
    colorRamp.fromColor = Color.fromHex(c1);
    colorRamp.toColor = Color.fromHex(c2);
    colorRamp.algorithm = "hsv"; // options are:  "cie-lab", "hsv", "lab-lch"

    classDef.baseSymbol = new SimpleFillSymbol();
    classDef.colorRamp = colorRamp;

    var params = new GenerateRendererParameters();
    params.classificationDefinition = classDef;
    var generateRenderer = new GenerateRendererTask(app.dataUrl);
    generateRenderer.execute(params, applyRenderer, errorHandler);
}

function applyRenderer(renderer) {
    // dynamic layer stuff
    var optionsArray = [];
    var drawingOptions = new LayerDrawingOptions();
    drawingOptions.renderer = renderer;
    // set the drawing options for the relevant layer
    // optionsArray index corresponds to layer index in the map service
    optionsArray[2] = drawingOptions;
    //let countriesLayer:Layer= app.map.getLayer("us_counties");

    usaLayer.setLayerDrawingOptions(optionsArray);
    usaLayer.show();
    // create the legend if it doesn't exist
    if (!app.hasOwnProperty("legend")) {
        createLegend();
    }
}

function createLegend() {
    app.legend = new Legend({
        map: app.map,
        layerInfos: [{
            layer: app.map.getLayer("us_counties"),
            title: "US Counties"
        }]
    }, dom.byId("legendDiv"));
    app.legend.startup();
}

function errorHandler(err) {
    // console.log("Something broke, error: ", err);
    console.log("error: ", JSON.stringify(err));
}
