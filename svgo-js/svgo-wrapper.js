"use strict";
var CONFIG = require("../node_modules/svgo/lib/svgo/config.js");
var SVG2JS = require("../node_modules/svgo/lib/svgo/svg2js.js");
var PLUGINS = require("../node_modules/svgo/lib/svgo/plugins.js");
var JS2SVG = require("../node_modules/svgo/lib/svgo/js2svg.js");
var pluginModules = {
  addAttributesToSVGElement: require("../node_modules/svgo/plugins/addAttributesToSVGElement"),
  addClassesToSVGElement: require("../node_modules/svgo/plugins/addClassesToSVGElement"),
  cleanupAttrs: require("../node_modules/svgo/plugins/cleanupAttrs"),
  cleanupEnableBackground: require("../node_modules/svgo/plugins/cleanupEnableBackground"),
  cleanupIDs: require("../node_modules/svgo/plugins/cleanupIDs"),
  cleanupListOfValues: require("../node_modules/svgo/plugins/cleanupListOfValues"),
  cleanupNumericValues: require("../node_modules/svgo/plugins/cleanupNumericValues"),
  collapseGroups: require("../node_modules/svgo/plugins/collapseGroups"),
  convertColors: require("../node_modules/svgo/plugins/convertColors"),
  convertPathData: require("../node_modules/svgo/plugins/convertPathData"),
  convertShapeToPath: require("../node_modules/svgo/plugins/convertShapeToPath"),
  convertStyleToAttrs: require("../node_modules/svgo/plugins/convertStyleToAttrs"),
  convertTransform: require("../node_modules/svgo/plugins/convertTransform"),
  inlineStyles: require("../node_modules/svgo/plugins/inlineStyles"),
  mergePaths: require("../node_modules/svgo/plugins/mergePaths"),
  minifyStyles: require("../node_modules/svgo/plugins/minifyStyles"),
  moveElemsAttrsToGroup: require("../node_modules/svgo/plugins/moveElemsAttrsToGroup"),
  moveGroupAttrsToElems: require("../node_modules/svgo/plugins/moveGroupAttrsToElems"),
  prefixIds: require("../node_modules/svgo/plugins/prefixIds"),
  removeComments: require("../node_modules/svgo/plugins/removeComments"),
  removeDesc: require("../node_modules/svgo/plugins/removeDesc"),
  removeDimensions: require("../node_modules/svgo/plugins/removeDimensions"),
  removeDoctype: require("../node_modules/svgo/plugins/removeDoctype"),
  removeEditorsNSData: require("../node_modules/svgo/plugins/removeEditorsNSData"),
  removeElementsByAttr: require("../node_modules/svgo/plugins/removeElementsByAttr"),
  removeEmptyAttrs: require("../node_modules/svgo/plugins/removeEmptyAttrs"),
  removeEmptyContainers: require("../node_modules/svgo/plugins/removeEmptyContainers"),
  removeEmptyText: require("../node_modules/svgo/plugins/removeEmptyText"),
  removeHiddenElems: require("../node_modules/svgo/plugins/removeHiddenElems"),
  removeMetadata: require("../node_modules/svgo/plugins/removeMetadata"),
  removeNonInheritableGroupAttrs: require("../node_modules/svgo/plugins/removeNonInheritableGroupAttrs"),
  removeRasterImages: require("../node_modules/svgo/plugins/removeRasterImages"),
  removeScriptElement: require("../node_modules/svgo/plugins/removeScriptElement"),
  removeStyleElement: require("../node_modules/svgo/plugins/removeStyleElement"),
  removeTitle: require("../node_modules/svgo/plugins/removeTitle"),
  removeUnknownsAndDefaults: require("../node_modules/svgo/plugins/removeUnknownsAndDefaults"),
  removeUnusedNS: require("../node_modules/svgo/plugins/removeUnusedNS"),
  removeUselessDefs: require("../node_modules/svgo/plugins/removeUselessDefs"),
  removeUselessStrokeAndFill: require("../node_modules/svgo/plugins/removeUselessStrokeAndFill"),
  removeViewBox: require("../node_modules/svgo/plugins/removeViewBox"),
  removeXMLNS: require("../node_modules/svgo/plugins/removeXMLNS"),
  removeXMLProcInst: require("../node_modules/svgo/plugins/removeXMLProcInst"),
  sortAttrs: require("../node_modules/svgo/plugins/sortAttrs"),
  removeAttrs: require("../node_modules/svgo/plugins/removeAttrs")
};

function SVGO(options) {
  var self = this;
  var plugins = options.plugins;
  options.plugins = [];

  Object.keys(plugins).forEach(function(key){
    var value = plugins[key];
    var plugin = {};
    plugin[key] = pluginModules[key];
    switch(typeof value) {
      case "boolean":
        if (value)
          options.plugins.push(plugin);
        break;
      default:
        plugin.params = value;
        options.plugins.push(plugin);
        break;
    }
  });
  var errors = [];
  this.options = CONFIG(options);
  this.optimize = function(svgstr) {
    if (self.options.error)
      errors.push("Configuration error: " + self.options.error);
    var passes = self.options.multipass ? 10 : 1;
    var lastSize = Number.POSITIVE_INFINITY;
    var newSize = 0;
    var counter = 0;
    self.svgjs = undefined;
    SVG2JS(svgstr, function(svgjs) {
      if (svgjs.error) {
        // If we don't have anything yet, throw an exception.
        errors.push("Error before optimization: " + svgjs.error);
      } else {
        while (counter++ <= passes && newSize < lastSize) {
          lastSize = newSize;
          try {
            svgjs = self._optimize(svgjs, self.options.plugins);
            newSize = JS2SVG(svgjs, self.options.js2svg).data.length;
          } catch (exc) {
            // Nothing to return yet..
            if (counter == 1)
              throw exc;
            // Get out of while loop, we have something to return
            // that is somewhat optimized, only the last iteration
            // failed.
            errors.push(
              "Error occurred during optimization pass " + counter +
              ", returning data from pass " + (counter - 1) +"."
            );
            break;
          }
        }
        self.svgjs = svgjs;
      }
    });
    var xml;
    if (self.svgjs !== undefined && typeof self.svgjs.content !== "undefined") {
      xml = JS2SVG(self.svgjs, self.options.js2svg).data;
    }
    return {
      data: xml,
      errors: errors,
      passes: counter
    };
  };
}

SVGO.prototype._optimize = function(svgjs, plugins) {
  // Optimization round..
  svgjs = PLUGINS(svgjs, {}, plugins);
  if (svgjs.error) {
    // If we don"t have anything yet, throw an exception.
    throw "Error during optimization: " + svgjs.error;
  }
  // If all went well keep the result.
  return svgjs;
};

module.exports = function(options, data) {
  options = JSON.parse(options);
  options.full = true;
  var svgoContext = new SVGO(options);
  return svgoContext.optimize(data);
};
