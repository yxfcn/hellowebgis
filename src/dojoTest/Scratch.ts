///<reference path="../../typings.d.ts"/>
import declare = require("dojo/_base/declare");
import parser = require("dojo/parser");
import _WidgetBase = require("dijit/_WidgetBase");
import ready = require("dojo/domReady");
import domConstruct = require("dojo/dom-construct");
import win = require("dojo/_base/window");
import on=require("dojo/on");
import dojoNumber=require("dojo/number");
import _TemplatedMixin=require("dijit/_TemplatedMixin");


declare("FancyCounter", [_WidgetBase,_TemplatedMixin], {
    _i: 0,
    templateString: "<div>" +
    "<button data-dojo-attach-event='click:increment'>press me</button>" +
    "&nbsp; count: <span data-dojo-attach-point='counter'>0</span>" +
    "</div>",

    increment: function(){
        console.log("using click");
        //let i:number=dojoNumber.parse(evt.target.innerHTML);
        this.counter.innerHTML=++this._i;
    }
});


ready(function () {
    //parser.parse();
    parser.parse();
}); 
