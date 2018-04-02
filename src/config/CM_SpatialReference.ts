///<reference path="../../typings.d.ts"/>
import SpatialReference=require("esri/SpatialReference");

//天地图坐标系
export const GCS2000:SpatialReference=new SpatialReference(4490);//GCS_China_Geodetic_Coordinate_System_2000
export const GCS_WGS_1984:SpatialReference=new SpatialReference(4326);
