///<reference path="../../typings.d.ts"/>

import BorderContainer=require("dijit/layout/BorderContainer");
import ContentPane=require("dijit/layout/ContentPane");
import AccordionContainer =require("dijit/layout/AccordionContainer")


var mainContainer=new BorderContainer({
    design:'headline',
    gutters:false
},"main");

var header=new ContentPane({
    region:'top',
    style:"background-color: #b39b86; height: 10%;"
},"header");
var leftPane=new ContentPane({
    region:'left',
     splitter:'true',
     style:"background-color: #acb386; width: 100px;"
},"menu");

var mapPane=new ContentPane({
    region:'center'
},"mapDiv");

var rightPane=new ContentPane({
    region:'right', 
    splitter:'true',
    style:"background-color: #acb386; width: 100px;"
},"rightPane");
var accordionContainer=new AccordionContainer({
    style:"padding: 0px; overflow: hidden; z-index: 29;"
},"accordionContainer");

var queryPane=new ContentPane({
   
},"queryPane");

var identifyResultsPane=new ContentPane({
  
},"identifyResultsPane");
var parcelResultsPane=new ContentPane({
 
},"parcelResultsPane");

var bottomPane=new ContentPane({
    region:'bottom', splitter:'true',
    style:"background-color: #b39b86; height: 50px;"
},"bottomPane");

mainContainer.startup();