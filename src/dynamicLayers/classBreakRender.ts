///<reference path="../../typings.d.ts"/>
import parser = require("dojo/parser");
import Map = require("esri/map");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Renderer = require("esri/renderers/Renderer");
import Legend = require("esri/dijit/Legend");
import ArcGISDynamicMapServiceLayer = require("esri/layers/ArcGISDynamicMapServiceLayer");
import dom = require("dojo/dom");
import dojoEvent = require("dojo/_base/event");
import Extent = require("esri/geometry/Extent");
import query = require("esri/tasks/query");
import QueryTask = require("esri/tasks/QueryTask");
import PopupTemplate = require("esri/dijit/PopupTemplate");
import dojoArray = require("dojo/_base/array");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");
import StatisticDefinition = require("esri/tasks/StatisticDefinition");
import dojoNumber = require("dojo/number");
import ClassBreaksRenderer = require("esri/renderers/ClassBreaksRenderer");
import dojoColor = require("dojo/_base/Color");
import LayerDrawingOptions = require("esri/layers/LayerDrawingOptions");
import ready=require("dojo/domReady");
import on=require("dojo/on");
import registry=require("dijit/registry");
import esriConfig=require("esri/config");
import HorizontalSlider=require("dijit/form/HorizontalSlider");
import HorizontalRangeSlider=require("dojox/form/HorizontalRangeSlider");

parser.parse();
esriConfig.defaults.io.proxyUrl = "/proxy/";

// one global for persistent app variables
class App {
    dataUrl: string;
    usaLayer: ArcGISDynamicMapServiceLayer;
    // color region
    defaultFrom: string;
    defaultTo: string;
    map: Map;
    legend: Legend;
    usaUrl: string;

    //dom 节点
    appSliderDom:HorizontalRangeSlider;
    maxLabelDom: any;
    minBreakDom: any;
    maxBreakDom: any;

    //符号
    symLine: SimpleLineSymbol;
    symHighlight: SimpleFillSymbol;
    symDefault: SimpleFillSymbol;
    renderer: ClassBreaksRenderer;
    outlineColor: dojoColor;


    //事件
    click: any;

    constructor(usaUrl:string) {
        console.log("init the app");
        this.usaUrl=usaUrl;
        console.log("get the dijit");
        this.appSliderDom = registry.byId("appSlider");
        this.maxLabelDom = registry.byId("maxLabel");
        this.minBreakDom = registry.byId("minBreak");
        this.maxBreakDom = registry.byId("maxBread");

        console.log("set default color");
        this.outlineColor = new dojoColor([220, 220, 220, 1]);
        this.symLine = new SimpleLineSymbol();
        this.symLine.setColor(this.outlineColor);
        this.symHighlight = new SimpleFillSymbol("solid", this.symLine, new dojoColor([55, 255, 102, 0.9]));
        this.symDefault = new SimpleFillSymbol("solid", this.symLine, this.outlineColor);
        this.renderer = new ClassBreaksRenderer(this.symDefault, "AVE_HH_SZ");

        this.map = new Map("map", {
            basemap: "oceans",
            center: [-100.626, 36.408],
            zoom: 5,
            slider: false
        });
        // set up a layer to show counties as a dynamic map service
        // set visible layers to [2]
        this.usaLayer = new ArcGISDynamicMapServiceLayer(this.usaUrl, {
            "id": "usa",
            "opacity": 0.7
        });

        this.usaLayer.setVisibleLayers([2]);
        
        

    }

    queryCounties(e: any) {
        console.log("query counties");
        let mp, pad, queryGeom, q, vals;
        mp = e.mapPoint;//获取点击位置的空间坐标
        vals = this.appSliderDom.get("value");//获取节点的值

        // save copy of the click event
        this.click = e;
        // build an extent around the click point，map.extent.getWidth()/map.width指地图上一个像素的实际长度，*3表示3个像素
        pad = this.map.extent.getWidth() / this.map.width * 3;
        //查询参数：查询区域，
        queryGeom = new Extent(mp.x - pad, mp.y - pad, mp.x + pad, mp.y + pad, this.map.spatialReference);

        //定义查询对象（参数，条件）
        q = new query();
        q.outSpatialReference = this.map.spatialReference;
        q.returnGeometry = true;
        q.where = "AVE_HH_SZ >= " + vals[0] + " AND AVE_HH_SZ <= " + vals[1];
        q.outFields = ["STATE_NAME", "NAME", "AVE_HH_SZ"];
        q.geometry = queryGeom;
        console.log("done with query...", q.where);

        //定义查询任务
        let qt = new QueryTask("https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2");
        qt.execute(q, this.handleCounties);
    }

    //处理查询结果
    handleCounties(result: any) {
        // make sure a feature was clicked，如果没有查询到任何信息，则返回
        if (result.features.length === 0) {
            this.map.infoWindow.hide();
            return;
        }
        //定义提示框样式
        let popupTemplate = new PopupTemplate({
            title: "{NAME} County",//标题
            fieldInfos: [         //字段信息
                { fieldName: "AVE_HH_SZ", visible: true, label: "Average Household Size: " },
                { fieldName: "STATE_NAME", visible: true, label: "State: " }
            ]
        });

        dojoArray.forEach(result.features, function (f: any) {
            f.setInfoTemplate(popupTemplate);
        });
        this.map.infoWindow.setFeatures(result.features);
        this.map.infoWindow.show(this.click.screenPoint, this.map.getInfoWindowAnchor(this.click.screenPoint));
    }

    //退出关闭弹窗
    escClosesPopup(key: any) {
        if (key.keyCode == 27) {
            this.map.infoWindow.hide();
        }
    }

    showCounties(vals: any) {
        this.addClassBreaks(vals);

        // set up the parameters for the dynamic layer
        let optionsArray = [];
        let drawingOptions = new LayerDrawingOptions();
        drawingOptions.renderer = this.renderer;
        optionsArray[2] = drawingOptions;

        this.usaLayer.setLayerDrawingOptions(optionsArray);

        this.map.addLayer(this.usaLayer);

    }

    updateCounties(vals: any) {
        console.log("slider changed", vals, this.renderer.infos[0].minValue, this.renderer.infos[0].maxValue);
        // remove current breaks
        let breakInfo = dojoArray.map(this.renderer.infos, function (info) {
            return [info.minValue, info.maxValue];
        });
        dojoArray.forEach(breakInfo, function (info) {
            this.renderer.removeBreak(info[0], info[1]);
        });

        // add the new break
        // app.renderer.addBreak(vals[0], vals[1], app.symHighlight);
        this.addClassBreaks(vals);
        // set up the parameters for the dynamic layer
        let optionsArray = [];
        let drawingOptions = new LayerDrawingOptions();
        drawingOptions.renderer = this.renderer;
        optionsArray[2] = drawingOptions;

        this.usaLayer.setLayerDrawingOptions(optionsArray);

         // show the new breaks
         this.minBreakDom.innerHTML = dojoNumber.format(vals[0], { "places": 2 });
         this.maxBreakDom.innerHTML = dojoNumber.format(vals[0], { "places": 2 });
    }
    //获取最大平均值
    getMaxAvgHH() {
        let countiesUrl, outFields, queryTask, aquery, statDef;
        // query to get max value
        countiesUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2";
        outFields = ["AVE_HH_SZ", "STATE_NAME", "NAME"];
        queryTask = new QueryTask(countiesUrl);
        aquery = new query();
        aquery.outFields = outFields;
        statDef = new StatisticDefinition();
        statDef.statisticType = "max";
        statDef.onStatisticField = "AVE_HH_SZ"; //基于某个字段统计
        statDef.outStatisticFieldName = "max_avg_hh_size";//明确输出字段

        aquery.returnGeometry = false;
        aquery.where = "1=1";
        aquery.outStatistics = [statDef];
        //执行查询任务，并对查询结果进行处理
        queryTask.execute(aquery, this.handleQueryResult, this.errorHandler);
    }

    handleQueryResult(results: any) {
        if (!results.hasOwnProperty("features") ||
            results.features.length === 0) {
            return; // no features, something went wrong
        }

        var maxSize = results.features[0].attributes.MAX_AVE_HH_SZ;
        console.log("max size: ", maxSize, results.features);
        this.maxLabelDom.innerHTML = dojoNumber.format(maxSize, { "places": 2 });
    }

    addClassBreaks(vals: any) {
        if (vals[0] > 0) {
            this.renderer.addBreak(0, vals[0], this.symDefault);
        }
        this.renderer.addBreak(vals[0], vals[1], this.symHighlight);
        if (vals[1] < 4.40) {
            this.renderer.addBreak(vals[1], 4.40, this.symDefault);
        }
    }

    errorHandler(err: any) {
        console.log('Oops, error: ', err);
    }

}

ready(function(){
    //let ext, basemap, usaUrl,countiesUrl;
    let usaUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer";//?????????

    let app = new App(usaUrl);
    app.map.on("click",app.queryCounties);
    app.map.on("onKeyDown", app.escClosesPopup);
    app.getMaxAvgHH();
    let vals=app.appSliderDom.value;
    console.log("vals:"+vals);
    app.showCounties(vals);
    on(app.appSliderDom,"onChange",app.updateCounties);

});