vde.Vis.marks.Rect = (function() {
  var rect = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'rect';

    this.properties = {
      x: {value: 0},
      width: {value: 15},
      x2: {value: 0, disabled: true},
      y: {value: 0},
      height: {value: 150},
      y2: {value: 0, disabled: true},
      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    this.extents = {
      horizontal: {fields: ['x', 'x2', 'width'], limit: 2, history: ['x', 'width']},
      vertical: {fields: ['y', 'y2', 'height'],  limit: 2, history: ['y', 'height']}
    };

    return this.init();
  };

  rect.prototype = new vde.Vis.Mark();
  var prototype  = rect.prototype;

  prototype.productionRules = function(prop, scale, field) {
    if(!scale) {
      switch(prop) {
        case 'x':
        case 'x2':
        case 'width':
          scale = this.group().scale(this, {
            field: field
          }, {
            type: field.type || 'ordinal',
            range: new vde.Vis.Field('width')
          }, 'x');
        break;

        case 'y':
        case 'y2':
        case 'height':
          scale = this.group().scale(this, {
            field: field
          }, {
            type: field.type || 'linear',
            range: new vde.Vis.Field('height')
          }, 'y');
        break;
      }
    }

    if(scale.properties.type == 'ordinal')
      scale.properties.points = false;

    return [scale, field]
  };

  prototype.interactive = function() {
    var self = this, item = this.item(vde.iVis.activeItem);

    var positions = function() {
      var b = vde.iVis.translatedBounds(item, item.bounds),
        top    = {x: b.x1 + (b.width()/2), y: b.y1,  pos: 'top',    cursor: 'n-resize', disabled: 1},
        bottom = {x: b.x1 + (b.width()/2), y: b.y2,  pos: 'bottom', cursor: 's-resize', disabled: 1},
        left   = {x: b.x1, y: b.y1 + (b.height()/2), pos: 'left',   cursor: 'w-resize', disabled: 1},
        right  = {x: b.x2, y: b.y1 + (b.height()/2), pos: 'right',  cursor: 'e-resize', disabled: 1};

      if((!self.properties.y.field && !self.properties.y.disabled)   || !self.properties.height.disabled)
        top.disabled = 0;

      if((!self.properties.y2.field && !self.properties.y2.disabled) || !self.properties.height.disabled)
        bottom.disabled = 0;      

      if((!self.properties.x.field && !self.properties.x.disabled)   || !self.properties.width.disabled)
        left.disabled = 0;

      if((!self.properties.x2.field && !self.properties.x2.disabled) || !self.properties.width.disabled)
        right.disabled = 0;

      return [top, bottom, left, right];      
    };    

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging) return;

      var props = self.properties,
          dx = Math.ceil(evt.pageX - dragging.prev[0]), 
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      if(data.disabled) return;    

      switch(data.pos) {
        case 'top':
          var reverse = (props.y.scale && 
            props.y.scale.properties.range.name == 'height') ? -1 : 1;

          self.ngScope().$apply(function() {
            if(!props.y.disabled) props.y.value += dy*reverse;
            if(!props.height.disabled) props.height.value += dy*-1;
          });
        break;

        case 'bottom':
          var reverse = (props.y2.scale && 
            props.y2.scale.properties.range.name == 'height') ? -1 : 1;

          self.ngScope().$apply(function() {
            if(!props.y2.disabled) props.y2.value += dy*reverse;
            if(!props.height.disabled) props.height.value += dy;
          });          
        break;

        case 'left':
          self.ngScope().$apply(function() {
            if(!props.x.disabled) props.x.value += dx;
            if(!props.width.disabled) props.width.value += dx*-1;
          });         
        break;

        case 'right':
          self.ngScope().$apply(function() {
            if(!props.x2.disabled) props.x2.value += dx;
            if(!props.width.disabled) props.width.value += dx;
          });  
        break;
      }

      dragging.prev = [evt.pageX, evt.pageY];

      self.update('x').update('x2').update('width')
        .update('y').update('y2').update('height');

      vde.iVis.view.data({ 'handle_data': positions() }).update();
    };

    return ['handle', positions(), {mousemove: mousemove}];
  };  

  return rect;
})();