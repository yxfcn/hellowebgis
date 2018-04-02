console.log('well, here is the config file')
var siteOrigin=location.origin;
var prjRelatePath="/webgis/ESRI/V323/hellowebgis"
var rootPath=siteOrigin+prjRelatePath;
console.log("classBreakRender");
window.dojoConfig={
    //deps:["src/basemapGallary"],
    deps:["src/dynamicLayers/classBreakRender"],
    packages:[
        {
            name:"src",
            location:rootPath+"/src"
        }
    ]
   
}