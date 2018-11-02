'use strict';

var CONFIG = require('../node_modules/svgo/lib/svgo/config.js');
var SVG2JS = require('../node_modules/svgo/lib/svgo/svg2js.js');
var PLUGINS = require('../node_modules/svgo/lib/svgo/plugins.js');
var JS2SVG = require('../node_modules/svgo/lib/svgo/js2svg.js');
var addAttributesToSVGElement = require("../node_modules/svgo/plugins/addAttributesToSVGElement");
var addClassesToSVGElement = require("../node_modules/svgo/plugins/addClassesToSVGElement");
var cleanupAttrs = require("../node_modules/svgo/plugins/cleanupAttrs");
var cleanupEnableBackground = require("../node_modules/svgo/plugins/cleanupEnableBackground");
var cleanupIDs = require("../node_modules/svgo/plugins/cleanupIDs");
var cleanupListOfValues = require("../node_modules/svgo/plugins/cleanupListOfValues");
var cleanupNumericValues = require("../node_modules/svgo/plugins/cleanupNumericValues");
var collapseGroups = require("../node_modules/svgo/plugins/collapseGroups");
var convertColors = require("../node_modules/svgo/plugins/convertColors");
var convertPathData = require("../node_modules/svgo/plugins/convertPathData");
var convertShapeToPath = require("../node_modules/svgo/plugins/convertShapeToPath");
var convertStyleToAttrs = require("../node_modules/svgo/plugins/convertStyleToAttrs");
var convertTransform = require("../node_modules/svgo/plugins/convertTransform");
var inlineStyles = require("../node_modules/svgo/plugins/inlineStyles");
var mergePaths = require("../node_modules/svgo/plugins/mergePaths");
var minifyStyles = require("../node_modules/svgo/plugins/minifyStyles");
var moveElemsAttrsToGroup = require("../node_modules/svgo/plugins/moveElemsAttrsToGroup");
var moveGroupAttrsToElems = require("../node_modules/svgo/plugins/moveGroupAttrsToElems");
var prefixIds = require("../node_modules/svgo/plugins/prefixIds");
var removeComments = require("../node_modules/svgo/plugins/removeComments");
var removeDesc = require("../node_modules/svgo/plugins/removeDesc");
var removeDimensions = require("../node_modules/svgo/plugins/removeDimensions");
var removeDoctype = require("../node_modules/svgo/plugins/removeDoctype");
var removeEditorsNSData = require("../node_modules/svgo/plugins/removeEditorsNSData");
var removeElementsByAttr = require("../node_modules/svgo/plugins/removeElementsByAttr");
var removeEmptyAttrs = require("../node_modules/svgo/plugins/removeEmptyAttrs");
var removeEmptyContainers = require("../node_modules/svgo/plugins/removeEmptyContainers");
var removeEmptyText = require("../node_modules/svgo/plugins/removeEmptyText");
var removeHiddenElems = require("../node_modules/svgo/plugins/removeHiddenElems");
var removeMetadata = require("../node_modules/svgo/plugins/removeMetadata");
var removeNonInheritableGroupAttrs = require("../node_modules/svgo/plugins/removeNonInheritableGroupAttrs");
var removeRasterImages = require("../node_modules/svgo/plugins/removeRasterImages");
var removeScriptElement = require("../node_modules/svgo/plugins/removeScriptElement");
var removeStyleElement = require("../node_modules/svgo/plugins/removeStyleElement");
var removeTitle = require("../node_modules/svgo/plugins/removeTitle");
var removeUnknownsAndDefaults = require("../node_modules/svgo/plugins/removeUnknownsAndDefaults");
var removeUnusedNS = require("../node_modules/svgo/plugins/removeUnusedNS");
var removeUselessDefs = require("../node_modules/svgo/plugins/removeUselessDefs");
var removeUselessStrokeAndFill = require("../node_modules/svgo/plugins/removeUselessStrokeAndFill");
var removeViewBox = require("../node_modules/svgo/plugins/removeViewBox");
var removeXMLNS = require("../node_modules/svgo/plugins/removeXMLNS");
var removeXMLProcInst = require("../node_modules/svgo/plugins/removeXMLProcInst");
var sortAttrs = require("../node_modules/svgo/plugins/sortAttrs");

function SVGO(options) {
    var self = this;
    var plugins = options.plugins;
    options.plugins = [];

    Object.keys(plugins).forEach(function(key){
      var value = plugins[key];
      var plugin = {};
      plugin[key] = eval(key);
      switch(typeof value) {
        case 'boolean':
          if (value)
            options.plugins.push(plugin);
          break;
        case 'string':
          plugin.options = value;
          options.plugins.push(plugin);
          break;
        }
    });

    this.options = CONFIG(options);
    this.optimize = function(svgstr) {
        if (self.options.error)
            throw "Configuration error: " + self.options.error;
        var passes = self.options.multipass ? 10 : 1;
        var lastSize;
        var newSize = Number.POSITIVE_INFINITY;
        var counter = 0;
        var errors = [];
        SVG2JS(svgstr, function(svgjs) {
            if (svgjs.error) {
                // If we don't have anything yet, throw an exception.
                throw "Error before optimization: " + svgjs.error
            }
            while (counter++ <= self.passes && newSize < lastSize) {
                lastSize = newSize;
                try {
                    svgjs = self._optimize(svgjs, self.options.plugins);
                    newSize = JSON.stringify(self.svgjs.content).length
                } catch (exc) {
                    // Return the best we can without further recursion.
                    if (self.counter == 0)
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
        });
        return {
            data: JS2SVG(self.svgjs, self.options.js2svg).data,
            errors: errors,
            passes: counter
        };
    };
}

SVGO.prototype._optimize = function(svgjs, plugins) {
    // Optimization round..
    svgjs = PLUGINS(svgjs, {}, plugins);
    if (svgjs.error) {
        // If we don't have anything yet, throw an exception.
        throw "Error during optimization: " + svgjs.error
    }
    // If all went well keep the result.
    return svgjs;
};

module.exports = function(options, data) {
    options = JSON.parse(options)
    options['full'] = true;
    var svgo_ctxt = new SVGO(options);
    return svgo_ctxt.optimize(data);
}