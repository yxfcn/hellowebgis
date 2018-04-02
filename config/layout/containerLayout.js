console.log('well, here is the layout config file')
var siteOrigin=location.origin;
var prjRelatePath="/webgis/ESRI/V323/hellowebgis"
var rootPath=siteOrigin+prjRelatePath;

window.dojoConfig={
    //deps:["src/basemapGallary"],
    deps:["src/layout/containerLayout"],
    packages:[
        {
            name:"src",
            location:rootPath+"/src"
        }
    ],
    locale:'en',
    async: true
   
}

