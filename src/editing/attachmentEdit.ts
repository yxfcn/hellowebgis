///<reference path="../../typings.d.ts"/>
import Map = require("esri/map");
import FeatureLayer = require("esri/layers/FeatureLayer");
import AttachmentEditor = require("esri/dijit/editing/AttachmentEditor");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");
import registry = require("dijit/registry");
import ready = require("dojo/domReady");
import parser = require("dojo/parser");
import dom = require("dojo/dom");
import Draw = require("esri/toolbars/draw");
import Edit = require("esri/toolbars/edit");
import TemplatePicker = require("esri/dijit/editing/TemplatePicker");
import event = require("dojo/_base/event");
import esriConfig = require("esri/config");
import GeometryService = require("esri/tasks/GeometryService");
import Graphic = require("esri/graphic");
import dojoArray = require("dojo/_base/array");
import Button=require("dijit/form/Button");
import domConstruct=require("dojo/dom-construct");


parser.parse();
console.log("here is the js file");
var map: Map, toolbar: any, symbol, geomTask, editToolbar;
ready(function () {
  
    map = new Map("map", {
        basemap: "gray",
        center: [-95, 40],
        zoom: 4
    });
    esriConfig.defaults.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
    map.on("load", mapLoaded);

    // loop through all dijits, connect onClick event
    // listeners for buttons to activate drawing tools
    dojoArray.forEach(registry.toArray(), function (d) {
        // d is a reference to a dijit
        // could be a layout container or a button
        if (d.declaredClass === "dijit.form.Button") {
            d.on("click", activateTool);
        }
    });
    editToolbar = new Edit(map);
    

   /*  map.graphics.on("click", function (evt) {
        console.log("graphics clicked!");
        event.stop(evt);
        activateEditToolbar(evt.graphic);
    }); */
 /*    map.on("click", function(evt){
        editToolbar.deactivate();
      });
 */
      function activateToolbar(graphic) {
        var tool = 0;
        
        if (registry.byId("tool_move").checked) {
          tool = tool | Edit.MOVE; 
        }
        if (registry.byId("tool_vertices").checked) {
          tool = tool | Edit.EDIT_VERTICES; 
        }
        if (registry.byId("tool_scale").checked) {
          tool = tool | Edit.SCALE; 
        }
        if (registry.byId("tool_rotate").checked) {
          tool = tool | Edit.ROTATE; 
        }
        // enable text editing if a graphic uses a text symbol
        if ( graphic.symbol.declaredClass === "esri.symbol.TextSymbol" ) {
          tool = tool | Edit.EDIT_TEXT;
        }
        //specify toolbar options        
        var options = {
          allowAddVertices: registry.byId("vtx_ca").checked,
          allowDeleteVertices: registry.byId("vtx_cd").checked,
          uniformScaling: registry.byId("uniform_scaling").checked
        };
        editToolbar.activate(tool, graphic, options);
      }
    
    function activateTool() {
        var tool = this.label.toUpperCase().replace(/ /g, "_");
        toolbar.activate(Draw[tool]);
        map.hideZoomSlider();
    }
    function createToolbar() {
        toolbar = new Draw(map);
        toolbar.on("draw-end", addToMap);
    }
    
    function addToMap(evt) {
        var symbol;
        toolbar.deactivate();
        map.showZoomSlider();
        switch (evt.geometry.type) {
            case "point":
            case "multipoint":
                symbol = new SimpleMarkerSymbol();
                break;
            case "polyline":
                symbol = new SimpleLineSymbol();
                break;
            default:
                symbol = new SimpleFillSymbol();
                break;
        }
        var graphic = new Graphic(evt.geometry, symbol);
    
        map.graphics.add(graphic);
    }
    
    function mapLoaded() {
        createToolbar();
        let featureLayer: FeatureLayer = new FeatureLayer("https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Prominent_Peaks_attach/FeatureServer/0",
            {
                mode: FeatureLayer.MODE_ONDEMAND
            });
        map.infoWindow.setContent("<div id='content' style='width:100%'></div>");
        map.infoWindow.resize(350, 200);
        let attachmentEditor: AttachmentEditor = new AttachmentEditor({}, dom.byId("content"));
        attachmentEditor.startup();
    
        featureLayer.on("click", function (evt) {
            let objectId = evt.graphic.attributes[featureLayer.objectIdField];
            map.infoWindow.setTitle(objectId);
            attachmentEditor.showAttachments(evt.graphic, featureLayer);
            map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));
        });
        map.addLayer(featureLayer);
    }
});
