( function(Edge) {

  // Thanks bobince http://stackoverflow.com/a/3642265/592125
  var makeSvgElement = function(tag, attrs) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) {
      if (k === "xlink:href") {
        // Pssh namespaces...
        svg.setAttributeNS('http://www.w3.org/1999/xlink','href', attrs[k]);
      } else {
        svg.setAttribute(k, attrs[k]);
      }
    }
    return svg;
  };
  
  Edge.View = Backbone.View.extend({
    tagName: "div",
    className: "edge",
    positions: null,
    initialize: function() {
      this.positions = {
        from: null, 
        to: null
      };
      // Render on source/target view move
      if (this.model.source) {
        this.model.source.parentNode.on("change:x change:y change:w", this.render, this);
        // this.model.source.parentNode.inputs.on("add remove", this.render, this);
        // this.model.source.parentNode.outputs.on("add remove", this.render, this);
      }
      if (this.model.target) {
        this.model.target.parentNode.on("change:x change:y", this.render, this);
      }
      // Set port plug active
      if (this.model.source) {
        this.model.source.view.plugSetActive();
      }
      if (this.model.target) {
        this.model.target.view.plugSetActive();
      }
      // Made SVG elements
      this.el = makeSvgElement("g", {
        "class": "edge"
      });
      this.elEdge = makeSvgElement("path", {
        "class": "edge-wire"
      });
      this.elShadow = makeSvgElement("path", {
        "class": "edge-shadow"
      });

      this.el.appendChild(this.elShadow);
      this.el.appendChild(this.elEdge);

      // Click handler
      var self = this;
      this.el.addEventListener("click", function(event){
        self.showEdit(event);
      });
    },
    render: function(previewPosition){
      var source = this.model.source;
      var target = this.model.target;
      if (source) {
        this.positions.from = source.view.holePosition();
      }
      else {
        // Preview 
        this.positions.from = previewPosition;
      }
      if (target) {
        this.positions.to = target.view.holePosition();
      } else {
        // Preview
        this.positions.to = previewPosition;
      }
      var pathD = this.edgePath(this.positions);
      this.elEdge.setAttribute("d", pathD);
      this.elShadow.setAttribute("d", pathD);
      // Bounding box
      if (this.model.parentGraph && this.model.parentGraph.view){
        this.model.parentGraph.view.sizeSVG();
      }
    },
    fade: function(){
      this.el.setAttribute("class", "edge fade");
    },
    unfade: function(){
      this.el.setAttribute("class", "edge");
    },
    highlight: function(){
      var topZ = 0;
      var thisModel = this.model;
      this.model.parentGraph.edges.each(function(edge){
        if (edge !== thisModel) {
          var thisZ = edge.get("z");
          if (thisZ > topZ) {
            topZ = thisZ;
          }
          if (edge.view){
            edge.view.unhighlight();
          }
        }
      });
      this.model.set("z", topZ+1);
      this.model.collection.sort();
      this.el.setAttribute("class", "edge highlight");
    },
    unhighlight: function(){
      this.el.setAttribute("class", "edge");
    },
    edgePath: function(positions){
      return "M " + positions.from.left + " " + positions.from.top + 
        " L " + (positions.from.left+50) + " " + positions.from.top +
        " L " + (positions.to.left-50) + " " + positions.to.top +
        " L " + positions.to.left + " " + positions.to.top;
    },
    remove: function(){
      var source = this.model.source;
      var target = this.model.target;
      // Remove listeners
      if (source) {
        source.parentNode.off(null, null, this);
      }
      if (target) {
        target.parentNode.off(null, null, this);
      }
      // Check if port plug is still active
      if (source) {
        source.view.plugCheckActive();
      }
      if (target) {
        target.view.plugCheckActive();
      }
      // Remove element
      this.el.parentNode.removeChild(this.el);
    },
    showEdit: function(event){
      // Hide others
      // $(".modal-bg").remove();

      // Highlight
      this.highlight();
      this.bringToTop();

      // Show box 
      // var self = this;
      // var modalBox = $('<div class="modal-bg" style="width:'+$(document).width()+'px; height:'+$(document).height()+'px;" />')
      //   .click(function(){
      //     $(".modal-bg").remove();
      //     self.unhighlight();
      //   });
      // var editBox = $('<div class="edge-edit-box" style="left:'+event.pageX+'px; top:'+event.pageY+'px;" />');
      // editBox.append(this.model.id+"<br />");
      // var deleteButton = $('<button>delete</button>')
      //   .click(function(){
      //     self.removeModel();
      //     $(".modal-bg").remove();
      //   });
      // editBox.append(deleteButton);
      // modalBox.append(editBox);
      // this.model.parentGraph.view.$el.append(modalBox);
    },
    bringToTop: function(){
      var parent = this.el.parentNode;
      if(parent){
        parent.removeChild(this.el);
        parent.appendChild(this.el);
      }
    },
    removeModel: function(){
      this.model.collection.remove(this.model);
    }
  });

}(Dataflow.module("edge")) );
