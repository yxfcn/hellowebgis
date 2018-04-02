define(["require", "exports", "dojo/_base/declare", "dojo/parser", "dijit/_WidgetBase", "dojo/domReady", "dijit/_TemplatedMixin"], function (require, exports, declare, parser, _WidgetBase, ready, _TemplatedMixin) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    declare("FancyCounter", [_WidgetBase, _TemplatedMixin], {
        _i: 0,
        templateString: "<div>" +
            "<button data-dojo-attach-event='click:increment'>press me</button>" +
            "&nbsp; count: <span data-dojo-attach-point='counter'>0</span>" +
            "</div>",
        increment: function () {
            console.log("using click");
            //let i:number=dojoNumber.parse(evt.target.innerHTML);
            this.counter.innerHTML = ++this._i;
        }
    });
    ready(function () {
        //parser.parse();
        parser.parse();
    });
});
//# sourceMappingURL=Scratch.js.map