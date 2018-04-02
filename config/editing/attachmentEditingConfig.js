console.log('well, here is the attchment editing config file')
var siteOrigin=location.origin;
var prjRelatePath="/webgis/ESRI/V323/hellowebgis"
var rootPath=siteOrigin+prjRelatePath;

window.dojoConfig={
    //deps:["src/basemapGallary"],
    deps:["src/editing/attachmentEdit"],
    packages:[
        {
            name:"src",
            location:rootPath+"/src"
        }
    ],
    async: true
   
}

