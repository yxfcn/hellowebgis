define(["require", "exports", "dojo/parser", "esri/map", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/tasks/query", "esri/tasks/QueryTask", "esri/dijit/PopupTemplate", "dojo/_base/array", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/tasks/StatisticDefinition", "dojo/number", "esri/renderers/ClassBreaksRenderer", "dojo/_base/Color", "esri/layers/LayerDrawingOptions", "dojo/domReady", "dojo/on", "dijit/registry", "esri/config"], function (require, exports, parser, Map, ArcGISDynamicMapServiceLayer, Extent, query, QueryTask, PopupTemplate, dojoArray, SimpleLineSymbol, SimpleFillSymbol, StatisticDefinition, dojoNumber, ClassBreaksRenderer, dojoColor, LayerDrawingOptions, ready, on, registry, esriConfig) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    parser.parse();
    esriConfig.defaults.io.proxyUrl = "/proxy/";
    // one global for persistent app variables
    var App = /** @class */ (function () {
        function App(usaUrl) {
            console.log("init the app");
            this.usaUrl = usaUrl;
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
        App.prototype.queryCounties = function (e) {
            console.log("query counties");
            var mp, pad, queryGeom, q, vals;
            mp = e.mapPoint; //获取点击位置的空间坐标
            vals = this.appSliderDom.get("value"); //获取节点的值
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
            var qt = new QueryTask("https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2");
            qt.execute(q, this.handleCounties);
        };
        //处理查询结果
        App.prototype.handleCounties = function (result) {
            // make sure a feature was clicked，如果没有查询到任何信息，则返回
            if (result.features.length === 0) {
                this.map.infoWindow.hide();
                return;
            }
            //定义提示框样式
            var popupTemplate = new PopupTemplate({
                title: "{NAME} County",
                fieldInfos: [
                    { fieldName: "AVE_HH_SZ", visible: true, label: "Average Household Size: " },
                    { fieldName: "STATE_NAME", visible: true, label: "State: " }
                ]
            });
            dojoArray.forEach(result.features, function (f) {
                f.setInfoTemplate(popupTemplate);
            });
            this.map.infoWindow.setFeatures(result.features);
            this.map.infoWindow.show(this.click.screenPoint, this.map.getInfoWindowAnchor(this.click.screenPoint));
        };
        //退出关闭弹窗
        App.prototype.escClosesPopup = function (key) {
            if (key.keyCode == 27) {
                this.map.infoWindow.hide();
            }
        };
        App.prototype.showCounties = function (vals) {
            this.addClassBreaks(vals);
            // set up the parameters for the dynamic layer
            var optionsArray = [];
            var drawingOptions = new LayerDrawingOptions();
            drawingOptions.renderer = this.renderer;
            optionsArray[2] = drawingOptions;
            this.usaLayer.setLayerDrawingOptions(optionsArray);
            this.map.addLayer(this.usaLayer);
        };
        App.prototype.updateCounties = function (vals) {
            console.log("slider changed", vals, this.renderer.infos[0].minValue, this.renderer.infos[0].maxValue);
            // remove current breaks
            var breakInfo = dojoArray.map(this.renderer.infos, function (info) {
                return [info.minValue, info.maxValue];
            });
            dojoArray.forEach(breakInfo, function (info) {
                this.renderer.removeBreak(info[0], info[1]);
            });
            // add the new break
            // app.renderer.addBreak(vals[0], vals[1], app.symHighlight);
            this.addClassBreaks(vals);
            // set up the parameters for the dynamic layer
            var optionsArray = [];
            var drawingOptions = new LayerDrawingOptions();
            drawingOptions.renderer = this.renderer;
            optionsArray[2] = drawingOptions;
            this.usaLayer.setLayerDrawingOptions(optionsArray);
            // show the new breaks
            this.minBreakDom.innerHTML = dojoNumber.format(vals[0], { "places": 2 });
            this.maxBreakDom.innerHTML = dojoNumber.format(vals[0], { "places": 2 });
        };
        //获取最大平均值
        App.prototype.getMaxAvgHH = function () {
            var countiesUrl, outFields, queryTask, aquery, statDef;
            // query to get max value
            countiesUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2";
            outFields = ["AVE_HH_SZ", "STATE_NAME", "NAME"];
            queryTask = new QueryTask(countiesUrl);
            aquery = new query();
            aquery.outFields = outFields;
            statDef = new StatisticDefinition();
            statDef.statisticType = "max";
            statDef.onStatisticField = "AVE_HH_SZ"; //基于某个字段统计
            statDef.outStatisticFieldName = "max_avg_hh_size"; //明确输出字段
            aquery.returnGeometry = false;
            aquery.where = "1=1";
            aquery.outStatistics = [statDef];
            //执行查询任务，并对查询结果进行处理
            queryTask.execute(aquery, this.handleQueryResult, this.errorHandler);
        };
        App.prototype.handleQueryResult = function (results) {
            if (!results.hasOwnProperty("features") ||
                results.features.length === 0) {
                return; // no features, something went wrong
            }
            var maxSize = results.features[0].attributes.MAX_AVE_HH_SZ;
            console.log("max size: ", maxSize, results.features);
            this.maxLabelDom.innerHTML = dojoNumber.format(maxSize, { "places": 2 });
        };
        App.prototype.addClassBreaks = function (vals) {
            if (vals[0] > 0) {
                this.renderer.addBreak(0, vals[0], this.symDefault);
            }
            this.renderer.addBreak(vals[0], vals[1], this.symHighlight);
            if (vals[1] < 4.40) {
                this.renderer.addBreak(vals[1], 4.40, this.symDefault);
            }
        };
        App.prototype.errorHandler = function (err) {
            console.log('Oops, error: ', err);
        };
        return App;
    }());
    ready(function () {
        //let ext, basemap, usaUrl,countiesUrl;
        var usaUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer"; //?????????
        var app = new App(usaUrl);
        app.map.on("click", app.queryCounties);
        app.map.on("onKeyDown", app.escClosesPopup);
        app.getMaxAvgHH();
        var vals = app.appSliderDom.value;
        console.log("vals:" + vals);
        app.showCounties(vals);
        on(app.appSliderDom, "onChange", app.updateCounties);
    });
});
//# sourceMappingURL=classBreakRender.js.map