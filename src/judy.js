/*
 * Judy - a javaScript charting library
 * ©2013 zhiyu zheng (http://github.com/nodengine/judy)
 * Licensed under the MIT (http://raphaeljs.com/license.html) license.
 */
 
var Chart = function(container, type, data, options){
    this.options = {
        title:"",
        margin:[60,20,40,30],
        showTracker:false,
        enableMultiTips:true,
        showGrid:true,
        stacked:false,
        threshold: null,
        tickSize:10,
        tickLength:5,
        tickInterval: null,
        tickFixed:2,
        colors:[
          ["#1ba5b2"],
          ["#cd2642"],
          ["#84ad29"]
        ],
        animationType:"<",
        timing:500,
        dotTiming:100,
        formatX: null,
        formatY: null,
        getY: null,
        getTickY: null,
        formatTickY: null,
        getTickX: null,
        formatTickX: null,
        getTip:null,
        showAxes: true,
        showMarkers: true,
        titleAttr:{
            "font-weight":"bold",
            "font-size":14
        },
        bgAttr:{
           fill:"#fff",
           "stroke":"none"
        },
        trackerAttr:{
            "stroke-width":1,
            "opacity":0.5,
            "fill":"#666666"
        },
        gridXAttr:{
          "stroke-width":1,
          "opacity":0.1,
          "fill":"#666666",
        },
        gridYAttr:{
          "stroke-width":1,
          "opacity":0.1,
          "fill":"#666666",
        },
        tickYAttr:{
          "font-size":12,
          fill:"#666666",
          "opacity":0.8
        },
        tickXAttr:{
          "font-size":12,
          "fill":"#666666",
          "opacity":0.8
        },
        tipAttr:{
          "stroke-width":2,
          "opacity":0.8,
          "fill":"#f4f4f4",
          "stroke":"#666666",
          "padding":10,
          "textAttr":{
            "font-size":12,
            "fill":"#000000",
            "opacity":1,
            "text-anchor":"start"
          }
        },
        lineAttr:{
          "stroke-width":5,
          "opacity":0.9       
        },
        pieAttr:{
          "stroke":"#fff",  
          "stroke-width":3,
          "opacity":1      
        },
        lineHoverAttr:{
          "stroke-width":5,
          "opacity":0.9       
        },
        dotAttr:{
          "stroke-width":2,
          "r":5,
          "opacity":1,
          "stroke":"#fff"
        },
        dotHoverAttr:{
          "stroke-width":2,
          "r":4,
          "opacity":1,
          "stroke":"#fff"
        },
        columnAttr:{
          "stroke-width":1,
          "opacity":0.9       
        },
        legendAttr:{
        }
    };

    return this.init(container, type, data, options);
}

Chart.prototype = {
    init:function(container, type, data, options){
        this.elements = {
            series:[],
            ticks:[[[],[]],[[],[]]], 
            markers:[]     
        }

        this.setContainer(container);
        this.setOptions(options);
        this.setType(type);
        this.setData(data);
        this.setMax();
        this.setMin();

        this.gc = Raphael(this.container, this.options.width, this.options.height);
        this.setRender(new Render(this));

        return this;
    },
    setContainer: function(container){
        this.container = container;
    },
    setOptions: function(options){
        extend(this.options, options);
        if(this.options.width == undefined){
            this.options.width = this.container.clientWidth;
        }
        if(this.options.height == undefined){
            this.options.height = this.container.clientHeight;
        }
    },
    draw: function(){
        this.render.run();
    },
    setSize: function (size) {
        this.size = size;
    },
    getSize: function () {
        return this.size;
    },
    setGC: function (gc) {
        this.gc = gc;
    },
    getGC: function () {
        return this.gc;
    },
    setType: function (type) {
        this.type = type;
    },
    setRender: function (render) {
        this.render = render;
    },
    setData: function (data) {
        this.data = data;
    },
    setFrame: function(){
        var left = 0;
        if(this.elements.axes.length > 0){
            for(var i=0;i<this.elements.axes[0][1].length;i++){
                var text = this.elements.axes[0][1][i][0];    
                if(text.getBBox().width > left)
                    left = text.getBBox().width;
            }
        }
        this.setSize({width: this.options.width, height: this.options.height});
        var size   = this.getSize();
        this.frame = {x:this.options.margin[3] + left, y:this.options.margin[0], width:(size.width - this.options.margin[1] - this.options.margin[3] - left), height:(size.height - this.options.margin[0] - this.options.margin[2])}
    },
    getFrame: function(){
        return this.frame?this.frame:{x:0,y:0,width:0,height:0};
    },
    setMax: function(){
        var max;
        if(this.options.stacked){
            for(var j=0;j<this.data.series[0].length;j++){
                var _max;
                for(var i=0;i<this.data.series.length;i++){
                    var y = this.getY(this.data.series[i], j);
                    if(i==0){
                        _max = y;
                    }else{
                        _max += y;
                    }
                }
                if(j==0){
                    max = _max;
                }else{
                    if(_max > max)
                        max = _max;
                }
            }
        }else{
            for(var i=0;i<this.data.series.length;i++){
                for(var j=0;j<this.data.series[i].length;j++){
                    var y = this.getY(this.data.series[i],j);
                    if(i==0 && j==0){
                        max = y;
                    }else{
                        if(y > max)
                            max = y;
                    }
                }
            }
        }
        this.max = max;
    },
    getMax: function(){
        return this.options.getMax != undefined ? this.options.getMax() : this.max;
    },
    setMin: function(){
        var min;
        for(var i=0;i<this.data.series.length;i++){
            for(var j=0;j<this.data.series[i].length;j++){
                var y = this.getY(this.data.series[i],j);
                if(i==0 && j==0){
                    min = y;
                }else{
                    if(y < min)
                        min = y;
                }
            }
        }
        return this.min = min;
    },
    getMin: function(){
        return this.options.getMin != undefined?this.options.getMin():this.min;
    },
    getPixX: function(count, i, align){
        var frame = this.getFrame(), iw = frame.width/(count-1), px = frame.x + i*iw;
        if(align == 1){
            iw = frame.width/(count); 
            px = frame.x + i*iw + iw/2;
        }
        return px;
    },
    getPixY: function(y){
        return this.getFrame().height * (1-(y-this.getMin())/(this.getMax()-this.getMin())) + this.getFrame().y;
    },
    getY: function(data,i){
        return this.options.getY != undefined?this.options.getY(data, i):data[i];
    },
    getTotal: function(){
        var total = 0;
        for(var i=0;i<this.data.series.length;i++){
            for(var j=0;j<this.data.series[i].length;j++){
                var y = this.getY(this.data.series[i],j);
                total += y;
            }
        }
        return this.total = total;
    },
    getTickY: function(i){
        var max = this.getMax(), min = this.getMin();
        var interval = (max - min)/this.options.tickSize;
        var tickVal  = decimal(min + interval*i, this.options.tickFixed);
        return this.options.getTickY != undefined ? this.options.getTickY(tickVal,i) : tickVal;
    },
    formatTickY: function(i){
        return this.options.formatTickY != undefined ? this.options.formatTickY(this.getTickY(i),i) : this.getTickY(i);
    },
    getTickX: function(i){
        return this.options.getTickX != undefined ? this.options.getTickX(this.data.categories[i],i) : this.data.categories[i];
    },
    formatTickX: function(i){
        return this.options.formatTickX != undefined ? this.options.formatTickX(this.getTickX(i),i) : this.getTickX(i);
    },
    getTip: function(data, i, j){
        return this.options.getTip != undefined ? this.options.getTip(data,i) : this.data.legends[i]+":"+data[j];
    },
    getThreshold: function(){
        return (this.options.threshold != null) ? this.getPixY(this.options.threshold) : this.getPixY(this.getMin());
    }
}

/*
 * Render Prototype
 */
function Render(chart){
    this.chart = chart;
    this.data    = this.chart.data;
    this.options = this.chart.options;
    this.gc      = this.chart.getGC();
    
    //this.clear();
    this.tdata = {};
    this.elements = this.chart.elements = {
        axes:[],
        series:[], 
        markers: [],
        tooltips: [],
        tipTexts:[],
        legends:[[],[]]
    };

    this.renderNames = ['Line','Area', 'Column','Pie'];
    this.renders = {};

    if(this.chart.type){
        eval("var RenderName = " + this.chart.type + "Render");
        this.renders[this.chart.type] = new RenderName(this);
    }else{
        for(var i in this.data.types){
            var renderName = this.data.types[i];
            eval("var RenderName = " + renderName + "Render");
            this.renders[renderName] = new RenderName(this);
        }
    }
    
}

Render.prototype = {
    run: function(){ 
        this.init();
        this.build();
        this.draw();
    },
    init: function(){

    },
    clear:function(){
        this.gc.clear();
    },
    getType:function (i){
        return this.chart.type?this.chart.type:this.data.types[i];
    },
    getNumberOfType : function(i){
        if(this.chart.type)
            return this.tdata.series.length;
        
        var index = this.getIndex(i);
        var type = this.getType(index);
        var count = 0;
        for(var i=0; i< this.data.types.length;i++){
            if(this.data.types[i]==type && !this.isHidden(i)){
                count++;
            }
        }
        return count;
    },
    getIndexOfTypes : function(index){
        var count = 0;
        var index = this.getIndex(index);
        var tp    = this.getType(index);

        for(var i = 0; i< index; i++){
            if(this.getType(i) == tp && !this.isHidden(i)){
                count++;
            }
        }
        return count;
    },
    getAlign:function (){
        var self = this;
        if(this.chart.type){
            return this.renders[this.chart.type].align;
        }else{
            for(var i=0;i<self.data.types.length;i++){
                if(this.renders[self.data.types[i]].align == 1){
                    return 1;
                }
            }
        }
        return 0;
    },
    build: function(){
        this.buildAxes();
        this.chart.setFrame();
        this.buildTitle();
        this.buildLegends();
        this.buildPlots();
        this.buildMarkers();
    },
    buildTitle: function(){
        this.createTitle();
    },
    buildLegends: function(){
        this.createLegends();
    },
    buildAxes: function(){
        this.createAxes();
    },
    buildPlots: function(){
        this.buildPlotsData();
        this.removePlots();
        this.createPlots();
    },
    buildMarkers:function(){
        this.createMarkers();
    },
    draw: function(){
        var self = this;
        if(!this.isRedraw){
            setTimeout(function(){
                self.drawTitle();
                self.drawLegends();
                self.drawAxes();
                self.drawBackground();
                self.drawPlots();   
                self.drawMarkers();   
            },self.options.timing);
        }else{
            self.buildPlots();  
            self.drawPlots(); 
            self.buildMarkers(); 
            self.drawMarkers();   
        }
    },
    redraw: function(){
        this.isRedraw = true;
        this.draw();
    },
    buildPlotsData: function(){
        var self = this;
        this.tdata.series = [];

        for(var i=0;i<self.data.series.length;i++){
            var hidden = self.isHidden(i);
            if(!hidden){
                var serie = [];
                this.tdata.series.push(serie);
                var data = self.data.series[i];
                for(var j = 0;j<data.length;j++){
                    var x = self.chart.getPixX(data.length, j, this.getAlign());
                    var y =  self.chart.getPixY(self.chart.getY(data,j));
                    serie[j] = [x, y, self.chart.getY(data,j)];
                }
            }
        }
    },
    createTitle: function(){
        var self = this;
        var frame = self.chart.getFrame();
        var x =frame.x, y= 10;
        var text = self.gc.text(x, y);
        text.attr(self.options.titleAttr);
        text.attr("text-anchor", "start");
        text.attr("text", self.options.title);
    },
    createLegends: function(){
        var self = this;
        var frame = self.chart.getFrame();
        var r = 5;
        var x =frame.x + r + 1, y= frame.y - 20, margin = [10, 15];
        for(var i=0;i<self.data.legends.length;i++){
            var title = self.data.legends[i];
            //compute x
            if(i>0){
                x = margin[1]+self.elements.legends[1][i-1].getBBox().x + self.elements.legends[1][i-1].getBBox().width;
            }
            //create plot for legend
            var circle = self.gc.circle(x, y);
            circle.attr("stroke", self.options.colors[i]);
            circle.attr("fill", self.options.colors[i]);
            circle.attr("r", r);
            //create text for legend
            var text = self.gc.text(x+margin[0], y);
            text.attr(self.options.legendAttr);
            text.attr("width", frame.x);
            text.attr("text-anchor", "start");
            text.attr("cursor", "pointer");
            text.attr("text", title);
            text.data("i", i);
            //bind click event to text element
            text.click(function(){
                var hidden = this.data("hidden");
                if(hidden){
                    self.elements.legends[0][this.data("i")].attr("opacity","1");
                    this.data("hidden", false);
                }else{
                    self.elements.legends[0][this.data("i")].attr("opacity","0.4");
                    this.data("hidden", true);
                }
                self.redraw();
            });
            //save elements
            self.elements.legends[0].push(circle);
            self.elements.legends[1].push(text);
        }
    },
    createAxes:function(){
        if(!this.options.showAxes)
            return;
        
        var self      = this;
       
        //YAxis
        self.elements.axes[0]    = []; // 0 - yaxis, 1 - xaxis
        self.elements.axes[0][1] = []; // texts, ticks
        self.elements.axes[0][2] = []; // grid

        var yaxis = self.gc.path("");
        yaxis.attr(self.options.tickYAttr);
        self.elements.axes[0][0] = yaxis;

        for(var i=0;i<this.options.tickSize+1;i++){
            self.elements.axes[0][1][i] = [];

            //texts
            var text = this.gc.text(0,0,this.chart.formatTickY(i));
            text.attr(this.options.tickYAttr);
            text.attr("text-anchor", "start");
            text.hide();

            //tick
            var tick = this.gc.path("");
            tick.attr(self.options.tickYAttr);
            tick.hide();

            //grid
            var grid = this.gc.path("");
            grid.attr(self.options.gridYAttr);
            grid.hide();
            
            //save elements
            self.elements.axes[0][1][i][0] = text;
            self.elements.axes[0][1][i][1] = tick;
            self.elements.axes[0][2][i]    = grid;
        }

        //XAxis
        self.elements.axes[1] = [], self.elements.axes[1][1] = [], self.elements.axes[1][2] = [];

        var xaxis = this.gc.path("");
        xaxis.attr(self.options.tickXAttr);
        self.elements.axes[1][0] = xaxis;
        
        for(var i=0;i<this.data.categories.length;i++){
            self.elements.axes[1][1][i] = [];
            
            var text = this.gc.text(0,0,this.chart.getTickX(i));
            text.attr(this.options.tickYAttr);
            text.attr("text-anchor", "middle");
            text.hide();

            //tick
            var tick = this.gc.path("");
            tick.attr(self.options.tickXAttr);
            tick.hide();

            //grid
            var grid = this.gc.path("");
            grid.attr(self.options.gridXAttr);
            grid.hide();

            //save elements
            self.elements.axes[1][1][i][0] = text;
            self.elements.axes[1][1][i][1] = tick;
            self.elements.axes[1][2][i]    = grid;
        }
    },
    drawAxes: function(){
        if(!this.options.showAxes)
            return;
        
        var self = this;
        var minY = self.chart.getPixY(self.chart.getMin());
        
        var threshold = (self.chart.options.threshold!=null)?self.chart.getPixY(self.chart.options.threshold):minY;
        var frame = this.chart.getFrame();

        var yaxis = self.elements.axes[0][0];
        yaxis.attr("path","M"+frame.x+","+frame.y+"L"+frame.x+","+(frame.y+frame.height));
        
        //YAxis
        for(var i=0;i<this.elements.axes[0][1].length;i++){
            var y    = this.chart.getPixY(this.chart.getTickY(i));
            var text = this.elements.axes[0][1][i][0];
            text.show();
            text.attr("width", frame.x);
            text.attr("x", self.chart.options.margin[3] - self.chart.options.tickLength - 5);
            text.attr("y", threshold);
            text.animate({"y":y}, self.options.timing);
            
            var tick = this.elements.axes[0][1][i][1];
            tick.show();
            tick.attr("path","M"+frame.x+","+threshold+"L"+(frame.x-this.options.tickLength)+","+threshold);
            tick.animate({"path":"M"+frame.x+","+y+"L"+(frame.x-this.options.tickLength)+","+y}, self.options.timing);
           
            var grid = this.elements.axes[0][2][i];
            if(this.options.showGrid){
                grid.show();
                grid.attr("path","M"+frame.x+","+threshold+"L"+(frame.width+frame.x)+","+threshold);
                grid.animate({"path":"M"+frame.x+","+y+"L"+(frame.x+frame.width)+","+y}, self.options.timing);
            }
        }

        //XAxis
        var xaxis =  self.elements.axes[1][0];
        xaxis.attr("path","M"+frame.x+","+(frame.y+frame.height)+"L"+(frame.x+frame.width)+","+(frame.y+frame.height));

        for(var i=0;i<this.data.categories.length;i++){
            var x = this.chart.getPixX(this.data.categories.length, i, this.getAlign());

            var text = this.elements.axes[1][1][i][0];
            text.show();
            text.attr("x", frame.x);
            text.attr("y", minY+3*this.options.tickLength);
            text.animate({"x":x}, self.options.timing);

            var tick = this.elements.axes[1][1][i][1];
            tick.show();
            tick.attr("path","M"+frame.x+","+minY+"L"+frame.x+","+(minY+this.options.tickLength));
            tick.animate({"path":"M"+x+","+minY+"L"+x+","+(minY+this.options.tickLength)}, self.options.timing);
            
            var grid = this.elements.axes[1][2][i];
            if(this.options.showGrid){
                grid.show();
                grid.attr("path","M"+frame.x+","+frame.y+"L"+frame.x+","+minY);
                grid.animate({"path":"M"+x+","+frame.y+"L"+x+","+minY}, self.options.timing);  
            }
        }
    },
    createPlots:function(){
        //create plots
        for(var i=0;i<this.tdata.series.length;i++){
            this.renders[this.getType(this.getIndex(i))].createPlot(i);
        }
    },
    removePlots:function(){
        var self = this;
        //clear plots
        for(var i=0;i<self.elements.series.length;i++){
            var serie = self.elements.series[i];
            if(serie.constructor == Array){
                for(var j=0;j<serie.length;j++){
                    serie[j].remove();
                }
            }else{
                serie.remove();
            }
        }
        self.elements.series.splice(0);
    },
    createMarkers:function(){
        if(!this.options.showMarkers) return;

        var self = this;

        //clear markers
        for(var i=0;i<self.elements.markers.length;i++){
            var markers = self.elements.markers[i]
            for(var j=0;j<markers.length;j++){
                markers[j].remove();
            }
        }
        self.elements.markers.splice(0);

        for(var i=0;i<self.tdata.series.length;i++){
            var data = self.tdata.series[i];
            var dot  = new Array();
            for(var j = 0;j<data.length;j++){
                var d = self.gc.circle(0, 0);
                d.hide();
                d.attr("stroke", self.options.colors[self.getIndex(i)]);
                //d.attr("stroke-opacity", 0.5);
                d.attr("fill", self.options.colors[self.getIndex(i)]);
                d.attr(self.options.dotAttr);
                d.data("i",i);
                d.data("j",j);
                d.data("data", self.data.series[self.getIndex(i)]);
                d.mouseover(function(){
                    this.animate(self.options.dotHoverAttr, self.options.dotTiming);
                    var box = this.getBBox();
                    self.drawTooltips((box.x+box.x2)/2, (box.y+box.y2)/2, [[this.data("data"), self.getIndex(this.data("i")), this.data("j")]]);
                }).mouseout(function(){
                    this.animate(self.options.dotAttr, self.options.dotTiming);
                    self.clearTooltips();
                });
                dot.push(d);
            }
            self.elements.markers.push(dot);
        }
    },
    drawTitle: function(){

    },
    drawLegends: function(){

    },
    drawBackground: function(){
        var self  = this;
        var minY  = this.chart.getPixY(this.chart.getMin());
        var frame = this.chart.getFrame();
        var bg    = this.gc.rect(0, 0, this.chart.getSize().width, this.chart.getSize().height);
        
        bg.toBack();
        bg.attr(self.options.bgAttr);

        if(this.options.showTracker){
            var tracker = this.gc.path("");
            tracker.attr(self.options.trackerAttr);
        }

        var els = [];
        bg.mousemove(function(e){
            var offsetX = e.offsetX?e.offsetX:e.layerX;
            var offsetY = e.offsetY?e.offsetY:e.layerY;
            for(var i=0;i<els.length;i++){
                if (els[i].events != undefined) {
                    for(var j = 0;j < els[i].events.length; j++) {
                        if (els[i].events[j].name == 'mouseout') {
                            els[i].events[j].f.apply(els[i]);
                        }
                    }
                }
            }

            self.clearTooltips();
            if(self.options.enableMultiTips){
                els = self.getMarkers(0, offsetX);
                //draw tracker
                if(offsetX >= frame.x && offsetX <= frame.x+frame.width && offsetY > frame.y){
                    //draw tips
                    for(var i=0;i<els.length;i++){
                        for(var j = 0; j < els[i].events.length; j++) {
                            if (els[i].events[j].name == 'mouseover') {
                                els[i].events[j].f.apply(els[i]);
                            }
                        }
                    }
                    if(self.options.showTracker){
                        tracker.attr("path","M"+offsetX+","+self.options.margin[0]+"L"+offsetX+","+minY); 
                    }
                }
            }
        });

    },
    drawPlots: function(){
        var self = this;
        for(var i=0;i<self.tdata.series.length;i++){
            var data   = self.tdata.series[i];
            var serie  = self.elements.series[i];
            for(var j=0;j<data.length;j++){
                var el = serie;
                if(serie.length){
                    el = serie[j];
                }
                this.renders[this.getType(this.getIndex(i))].drawPlot(el, self.tdata.series, i, j);
            }
        }
    },
    drawMarkers: function(){
        if(!this.options.showMarkers) return;

        var self = this;
        for(var i=0;i<self.tdata.series.length;i++){
            var dot    = self.elements.markers[i];
            var data   = self.tdata.series[i];
            for(var j=0;j<data.length;j++){
                var el = dot[j];
                el.show();
                this.renders[this.getType(this.getIndex(i))].drawMarker(el, self.tdata.series, i, j);
            } 
        }
    },
    drawTooltips: function (x, y, els) {
        var index = els[0][1];
        var angle = 5, indent = 7, xcorner = ycorner = 10 , padding = this.options.tipAttr.padding;
        var h = 2 * padding, w = h, maxWidth = 0; 
        x = Math.round(x) + indent;
        y = Math.round(y);

        var path = this.gc.path("");
        path.attr(this.options.tipAttr);
        this.elements.tooltips.push(path);

        var texts = [];
        for(var i=0;i<els.length;i++){
            var el   = els[i];
            var tip  = this.chart.getTip(el[0], el[1], el[2]);
            var text = this.gc.text(0, y, tip);
            text.attr(this.options.tipAttr.textAttr);
            texts.push(text);
            this.elements.tipTexts.push(texts);
            h += text.getBBox().height;
            if(text.getBBox().width > maxWidth){
                maxWidth = text.getBBox().width;
            }
        }

        w += maxWidth;
        var hh = Math.round(h/2);
        if(hh < angle){
            angle = hh;
        }
        if(hh < angle + ycorner){
            xcorner = ycorner = hh-angle;
        }
    
        var xa, tx, frame = this.chart.getFrame();
        //check if tip's frame is out of bounds
        if(x+angle+w > frame.x+frame.width){
            w  = -w;
            x  -= 2*indent;
            xa = x-angle;
            tx = xa + w + padding;
            xcorner = -xcorner;  
        }else{
            xa = x+angle;
            tx = xa+padding;
        }

        var p = "M"+x+","+y+"L"+xa+","+(y-angle);
        p += "L"+xa+","+(y-hh+ycorner);
        p += "C"+xa+","+(y-hh)+" "+xa+","+(y-hh)+" "+(xa+xcorner)+","+(y-hh);
        p += "L"+(xa+w-xcorner)+","+(y-hh);
        p += "C"+(xa+w)+","+(y-hh)+" "+(xa+w)+","+(y-hh)+" "+(xa+w)+","+(y-hh+ycorner);
        p += "L"+(xa+w)+","+(y+hh-ycorner);
        p += "C"+(xa+w)+","+(y+hh)+" "+(xa+w)+","+(y+hh)+" "+(xa+w-xcorner)+","+(y+hh);
        p += "L"+(xa+xcorner)+","+(y+hh);
        p += "C"+xa+","+(y+hh)+" "+xa+","+(y+hh)+" "+xa+","+(y+hh-ycorner);
        p += "L"+xa+","+(y+angle);
        p += "L"+x+","+y;
        path.attr("path",p);

        for(var i=0;i<texts.length;i++){
            texts[i].attr("x",tx);
        }
    },
    clearTooltips: function(){
        for(var i=0;i<this.elements.tooltips.length;i++){
            this.elements.tooltips[i].remove();
            for(var j = 0; j< this.elements.tipTexts[i].length;j++){
                this.elements.tipTexts[i][j].remove();
            }
        }
        this.elements.tooltips.splice(0);
        this.elements.tipTexts.splice(0);
    },
    getMarkers:function(type, pos1, pos2){
        var els = [];
        //vertical
        if(type == 0){
            for(var i=0;i<this.elements.markers.length;i++){
                var markers = this.elements.markers[i];
                for(var j=0;j<markers.length;j++){
                    var el = markers[j];
                    var box = el.getBBox();
                    if(pos1 >= box.x && pos1 <= box.x2){
                        els.push(el);
                    }
                }
            }
        }

        //point
        if(type == 3){
            for(var i=0;i<this.elements.markers.length;i++){
                var markers = this.elements.markers[i];
                for(var j=0;j<markers.length;j++){
                    var el = markers[j];
                    var box = el.getBBox();
                    if(pos1 >= box.x && pos1 <= box.x2 && pos2 >= box.y && pos2 <= box.y2){
                        els.push(el);
                    }
                }
            }
        }
        return els;
    },
    isHidden: function(i){
        var legend = this.elements.legends[1][i];
        return legend.data("hidden") == undefined?false:legend.data("hidden");
    },
    getIndex: function(index){
        var pos = -1;
        for(var i=0;i<this.elements.legends[1].length;i++){
            var legend = this.elements.legends[1][i];
            if(!legend.data("hidden")){
                pos ++;
            }
            if(pos == index){
                pos = i;
                break;
            }
        }
        return pos;
    }
}

/*
 * Line Chart 
 */
function LineRender(render){
    extend(this, render);
    
    this.drawPlot = function(el, data, i, j){
        var self = this, data = data[i], x = data[j][0], y = data[j][1];
        var threshold = self.chart.getThreshold();
        var pathStart = el.data("pathStart")==undefined?"":el.data("pathStart");
        var pathEnd   = el.data("pathEnd")==undefined?"":el.data("pathEnd");

        if(j==0){
            pathStart = "M"+x+","+threshold;
            pathEnd   = "M"+x+","+y;
        }else{
            var x1    = data[j-1][0], y1 = data[j-1][1];
            var ix    = (x - x1)/1.5;
            pathStart += "S"+(x1+ix)+","+threshold+" "+x+","+threshold;
            pathEnd   += "S"+(x1+ix)+","+y+" "+x+","+y;   
        }
        el.data("pathStart", pathStart);
        el.data("pathEnd", pathEnd);
        if(j == data.length-1){
            el.attr("path", pathStart);
            el.animate({path:pathEnd}, self.options.timing, self.options.animationType);
        }
    }

    this.createPlot = function(i){
        var self = this;
        var data = self.tdata.series[i];
        var path = self.gc.path("");
        path.attr(self.options.lineAttr);
        path.attr("stroke", self.options.colors[self.getIndex(i)]);
        self.elements.series.push(path);
    }

    this.drawMarker = function(el, data, i, j){
        var self = this, data = data[i], x = data[j][0], y = data[j][1];
        var threshold = self.chart.getThreshold();
        el.attr("cx",x);
        el.attr("cy",threshold);
        el.animate({"cy":y}, self.options.timing, self.options.animationType);
    }
}

/*
 * Area Chart 
 */
function AreaRender(render){
    extend(this, render);

    this.drawPlot = function(el, data, i, j){
        data = data[i];
        var self = this, x = data[j][0], y = data[j][1];
        var threshold = self.chart.getThreshold();
        var pathStart = el.data("pathStart")==undefined?"":el.data("pathStart");
        var pathEnd   = el.data("pathEnd")==undefined?"":el.data("pathEnd");
        if(j==0){
            pathStart  = "M"+x+","+threshold;
            pathEnd = "M"+x+","+y;
        }else{
            var x0    = data[0][0], y0 = data[0][1];
            var x1    = data[j-1][0], y1 = data[j-1][1];
            var ix    = (x - x1)/1.4;
            pathStart += "S"+(x1+ix)+","+threshold+" "+x+","+threshold;
            pathEnd   += "S"+(x1+ix)+","+y+" "+x+","+y;   

            if(j == data.length - 1){
                pathStart += "L"+x+","+threshold+"L"+x+","+threshold+"L"+x0+","+threshold+"Z"+x0+","+threshold;
                pathEnd   += "L"+x+","+y+"L"+x+","+threshold+"L"+x0+","+threshold+"Z"+x0+","+y;
            }
        }
        el.data("pathStart", pathStart);
        el.data("pathEnd", pathEnd);

        if(j == data.length-1){
            el.attr("fill", el.attr("stroke"));
            el.attr("fill-opacity", el.attr("opacity")/2);
            el.attr("path", pathStart);
            el.animate({path:pathEnd}, self.options.timing, self.options.animationType);
        }
    } 

    this.createPlot = function(i){
        var self = this;
        var data = self.tdata.series[i];
        var path = self.gc.path("");
        path.attr(self.options.lineAttr);
        path.attr("stroke", self.options.colors[self.getIndex(i)]);
        self.elements.series.push(path);
    }

    this.drawMarker = function(el, data, i, j){
        var self = this, data = data[i], x = data[j][0], y = data[j][1];
        var threshold = self.chart.getThreshold();
        el.attr("cx",x);
        el.attr("cy",threshold);
        el.animate({"cy":y}, self.options.timing, self.options.animationType);
    }
}


/*
 * Column Chart 
 */
function ColumnRender(render){
    extend(this, render);
    
    this.align = 1;
  
    this.createPlot = function(i){
        var self = this;
        self.elements.series[i] = [];
        var data = self.tdata.series[i];
        for(var j=0;j<data.length;j++){
            var path = self.gc.path("");
            path.attr(self.options.columnAttr);
            path.attr("stroke", self.options.colors[self.getIndex(i)]);
            self.elements.series[i].push(path);
        }
    }

    this.drawPlot = function(el, data, i, j){
        el.mouseover(function(){
            var dot = self.elements.markers[this.data("i")][this.data("j")];
            for(var e in dot.events){
                if (dot.events[e].name == 'mouseover') {
                    dot.events[e].f.apply(dot);
                }
            }
        }).mouseout(function(){
            var dot = self.elements.markers[this.data("i")][this.data("j")];
            for(var e in dot.events){
                if (dot.events[e].name == 'mouseout') {
                    dot.events[e].f.apply(dot);
                }
            }
        });

        el.attr("fill", el.attr("stroke"));
        el.attr("fill-opacity", el.attr("opacity"));
        el.data("i",i);
        el.data("j",j);

        var self      = this;
        var frame     = this.chart.getFrame();
        var base      = self.chart.getThreshold();
        var w         = (self.tdata.series[0][0][0] - frame.x)*2;

        var padding   = w/5;
        var num       = self.getNumberOfType(i);
        var index     = self.getIndexOfTypes(i)
        var iw        = (w-2*padding)/num;
        var ix        = data[i][j][0] - w/2 + padding + iw*index, y = data[i][j][1];
        var pathStart = "M"+ix+","+base+"L"+ix+","+base+"L"+(ix+iw)+","+base+"L"+(ix+iw)+","+base+"Z";
        var pathEnd   = "M"+ix+","+base+"L"+ix+","+y+"L"+(ix+iw)+","+y+"L"+(ix+iw)+","+base+"Z";

        if(self.chart.options.stacked){
            iw = w-2*padding;
            ix = data[i][j][0] - w/2 + padding;
            if(i>0){
                var baseNew = base; 
                for(var ii=0;ii<i;ii++){
                    var dis = base - data[ii][j][1]
                    baseNew  -= dis, y -= dis;
                }
                base = baseNew;
            }
            pathStart = "M"+ix+","+base+"L"+ix+","+base+"L"+(ix+iw)+","+base+"L"+(ix+iw)+","+base+"Z";
            pathEnd   = "M"+ix+","+base+"L"+ix+","+y+"L"+(ix+iw)+","+y+"L"+(ix+iw)+","+base+"Z";
        }
        
        el.attr("path", pathStart);
        el.animate({path:pathEnd}, self.options.timing, self.options.animationType);
    }
    
    this.drawMarker = function(el, data, i, j){
        var self = this;
        var frame = this.chart.getFrame();
        var base = self.chart.getThreshold();
        var w    = (self.tdata.series[0][0][0] - frame.x)*2;
        var padding = w/5;

        var num       = self.getNumberOfType(i);
        var index     = self.getIndexOfTypes(i)
        var iw   = (w-2*padding)/num;
        var ix   = data[i][j][0] - w/2 + padding + iw*index + iw/2, y = data[i][j][1];

        if(self.options.stacked){
            iw = w-2*padding;
            ix = data[i][j][0];

            if(i>0){
                for(var ii=0;ii<i;ii++){
                    var dis = base - data[ii][j][1]
                    y -= dis;
                }
            }
        }
        var dot = self.elements.markers[i][j];
        dot.attr("cx",ix);
        dot.attr("cy",base);
        dot.animate({"cy":y}, self.options.timing, self.options.animationType);
    }
}

/*
 * Pie Chart 
 */
function PieRender(render){
    extend(this, render);
    
    this.align = 1;
    this.options.showAxes = false;
    this.options.showMarkers = false;
    this.options.margin = [60,0,0,0];

    this.sector = function(cx, cy, rFrom, rTo, start, end) {
        this.endAngle = end;
        var rad = Math.PI / 180;
        var x1 = cx + rFrom * Math.cos(-start * rad);
        var y1 = cy + rFrom * Math.sin(-start * rad);
        var x2 = cx + rFrom * Math.cos(-end * rad);
        var y2 = cy + rFrom * Math.sin(-end * rad);
        var x3 = cx + rTo * Math.cos(-end * rad);
        var y3 = cy + rTo * Math.sin(-end * rad);
        var x4 = cx + rTo * Math.cos(-start * rad);
        var y4 = cy + rTo * Math.sin(-start * rad);
        return ["M", x1, y1, "A", rFrom, rFrom, 0, +(end - start > 180), 0, x2, y2, "L", x3, y3,  "A", rTo, rTo, 0, +(end - start > 180), 1, x4, y4, "Z"];
    }

    this.createPlot = function(i){
        var self = this;
        self.elements.series[i] = [];
        var data = self.tdata.series[i];
        for(var j=0;j<data.length;j++){
            var path = self.gc.path("");
            path.attr(self.options.pieAttr);
            path.attr("fill", self.options.colors[self.getIndex(i)]); 
            self.elements.series[i].push(path);
        }
    }

    this.drawPlot = function(el, data, i, j){
        if(j==0){
            this.endAngle = 0;
        }
        var total = this.chart.getTotal(i);
        var self      = this;
        var frame     = this.chart.getFrame();
        var cx = frame.x+frame.width/2;
        var cy = frame.y+frame.height/2;
        var r = (frame.height > frame.width ? frame.width/2 : frame.height/2)/self.tdata.series.length;
        var rFrom = i*r;
        var rTo = (i+1)*r;
        var ang = this.endAngle;
        el.attr("path", this.sector(cx, cy, rFrom, rFrom, ang, ang + 360*data[i][j][2]/total));
        el.animate({path:this.sector(cx, cy, rFrom, rTo, ang, ang + 360*data[i][j][2]/total)}, self.options.timing, self.options.animationType);
    }
}

/*
 * utils
 */
function extend(){
    var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
    if ( typeof target === "boolean" ) {
        deep = target, target = arguments[1] || {}, i = 2;
    }
    if ( typeof target !== "object" && !this.isFunction(target)) target = {};
    if ( length === i ) {
        target = this, --i;
    }
    for ( ; i < length; i++ ) {
        if ( (options = arguments[i]) != null ) {
            for ( name in options ) {
                src = target[name], copy = options[name];
                if ( target === copy ) {
                    continue;
                }
                if ( deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)) ) ) {
                    if ( copyIsArray ) {
                        copyIsArray = false, clone = src && this.isArray(src) ? src : [];
                    } else {
                        clone = src && this.isPlainObject(src) ? src : {};
                    }
                    target[name] = this.extend( deep, clone, copy );
                } else if ( copy !== undefined ) {
                    target[name] = copy;
                }
            }
        }
    }
    return target;
}

function decimal(val, position) {
    var f = parseFloat(val);
    if (isNaN(f)) return false;
    var f = Math.round(f*100)/100, s = f.toString(), pos = s.indexOf('.');
    if (pos < 0) {
        pos = s.length, s += '.';
    }
    while (s.length <= pos + position) {
        s += '0'
    }
    return s;
}
