var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "esri/SpatialReference", "esri/geometry/Extent", "esri/layers/TileInfo", "esri/geometry/Point", "esri/layers/WebTiledLayer"], function (require, exports, SpatialReference, Extent, TileInfo, EsriPoint, WebTiledLayer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //天地图坐标系
    var GCS2000 = new SpatialReference(4490); //GCS_China_Geodetic_Coordinate_System_2000
    //临海地图范围
    exports.LH_Extent = new Extent(120.82287337300001, 28.666733309, 121.71025052300001, 29.068217945, GCS2000);
    //天地图原点
    var TDT_ORIGIN = new EsriPoint(-180, 90);
    //天地图范围
    var TDT_FULLEXTENT = new Extent(-180.0, -90.0, 180.0, 90.0, GCS2000);
    //天地图服务器
    var TDT_SUBDOMAINS = ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    //天地图切片矩阵
    var TDT_LODS = [
        { level: 0, resolution: 1.40625, scale: 590995197.14166909755553014475, levelValue: '0' },
        { level: 1, resolution: 0.703125, scale: 295497598.57083454877776507238, levelValue: '1' },
        { level: 2, resolution: 0.3515625, scale: 147748799.28541727438888253619, levelValue: '2' },
        { level: 3, resolution: 0.17578125, scale: 73874399.642708637194441268094, levelValue: '3' },
        { level: 4, resolution: 0.087890625, scale: 36937199.821354318597220634047, levelValue: '4' },
        { level: 5, resolution: 0.0439453125, scale: 18468599.910677159298610317023, levelValue: '5' },
        { level: 6, resolution: 0.02197265625, scale: 9234299.955338579649305158512, levelValue: '6' },
        { level: 7, resolution: 0.010986328125, scale: 4617149.9776692898246525792559, levelValue: '7' },
        { level: 8, resolution: 0.0054931640625, scale: 2308574.9888346449123262896279, levelValue: '8' },
        { level: 9, resolution: 0.00274658203125, scale: 1154287.494417322456163144814, levelValue: '9' },
        { level: 10, resolution: 0.001373291015625, scale: 577143.74720866122808157240698, levelValue: '10' },
        { level: 11, resolution: 0.0006866455078125, scale: 288571.87360433061404078620349, levelValue: '11' },
        { level: 12, resolution: 0.00034332275390625, scale: 144285.93680216530702039310175, levelValue: '12' },
        { level: 13, resolution: 0.000171661376953125, scale: 72142.968401082653510196550873, levelValue: '13' },
        { level: 14, resolution: 8.58306884765625e-005, scale: 36071.484200541326755098275436, levelValue: '14' },
        { level: 15, resolution: 4.291534423828125e-005, scale: 18035.742100270663377549137718, levelValue: '15' },
        { level: 16, resolution: 2.1457672119140625e-005, scale: 9017.871050135331688774568859, levelValue: '16' },
        { level: 17, resolution: 1.0728836059570313e-005, scale: 4508.9355250676658443872844296, levelValue: '17' },
        { level: 18, resolution: 5.3644180297851563e-006, scale: 2254.4677625338329221936422148, levelValue: '18' } /* ,
        { level: 19, resolution: 0.000002682209014892578125, scale: 1127.2338812669164610968211074,levelValue:'19'},
        { level: 20, resolution: 0.0000013411045074462890625, scale: 563.61694063345823054841055369 ,levelValue:'20'} */
    ];
    //天地图切片信息
    var TDT_TILEINFO = new TileInfo({
        dpi: 96,
        compressionQuality: 0,
        rows: 256,
        cols: 256,
        lods: TDT_LODS,
        origin: TDT_ORIGIN,
        spatialReference: GCS2000
    });
    //天地图电子地图模板
    var TDT_URLPATTERN_VEC = "http://{subDomain}.tianditu.com/vec_c/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=vec&STYLE="
        + "default&FORMAT=&TILEMATRIXSET=c&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&format=tiles";
    //天地图卫星影像地图模块
    var TDT_URLPATTERN_IMG = "http://{subDomain}.tianditu.com/img_c/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=img&STYLE="
        + "default&FORMAT=&TILEMATRIXSET=c&TILEMATRIX=${level}&TILEROW=${row}&TILECOL=${col}&format=tiles";
    //天地图注记模块   
    var TDT_URLPATTERN_CVA = "http://{subDomain}.tianditu.com/cva_c/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=cva&STYLE="
        + "default&FORMAT=&TILEMATRIXSET=c&TILEMATRIX=${level}&TILEROW=${row}&TILECOL=${col}&format=tiles";
    //天地图电子地图图层组件初始化
    var TDT_OPTIONS = {
        fullExtent: TDT_FULLEXTENT,
        initialExtent: TDT_FULLEXTENT,
        subDomains: TDT_SUBDOMAINS,
        tileInfo: TDT_TILEINFO
    };
    var URL_TEMPLATE = {
        "vec": TDT_URLPATTERN_VEC,
        "img": TDT_URLPATTERN_IMG,
        "cva": TDT_URLPATTERN_CVA
    };
    var TDTLayer = /** @class */ (function (_super) {
        __extends(TDTLayer, _super);
        function TDTLayer(tdtType) {
            var _this = this;
            console.log("Here is TDTLayer constructor which is located in the file named TDTLayer.js'");
            _this = _super.call(this, URL_TEMPLATE[tdtType], TDT_OPTIONS) || this;
            _this.urlPattern = URL_TEMPLATE[tdtType];
            _this.options = TDT_OPTIONS;
            return _this;
        }
        return TDTLayer;
    }(WebTiledLayer));
    exports.TDTLayer = TDTLayer;
});
/*
map.on("click", function (evt) {
    map.infoWindow.setTitle("Coordinates");
    map.infoWindow.setContent("(x,y) : " + evt.mapPoint.x + ", " + evt.mapPoint.y);
    map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));
}); */ 
//# sourceMappingURL=TDTLayer.js.map