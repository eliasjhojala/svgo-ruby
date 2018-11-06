require 'execjs'
require 'json'
require 'pry'
require 'ostruct'

PLUGINS_DEFAULT = [
    :addAttributesToSVGElement,
    :addClassesToSVGElement,
    :cleanupAttrs,
    :cleanupEnableBackground,
    :cleanupIDs,
    :cleanupListOfValues,
    :cleanupNumericValues,
    :collapseGroups,
    :convertColors,
    :convertPathData,
    :convertShapeToPath,
    :convertStyleToAttrs,
    :convertTransform,
    :inlineStyles,
    :mergePaths,
    :minifyStyles,
    :moveElemsAttrsToGroup,
    :moveGroupAttrsToElems,
    :prefixIds,
    :removeComments,
    :removeDesc,
    :removeDimensions,
    :removeDoctype,
    :removeEditorsNSData,
    :removeEmptyAttrs,
    :removeEmptyContainers,
    :removeEmptyText,
    :removeHiddenElems,
    :removeMetadata,
    :removeNonInheritableGroupAttrs,
    :removeTitle,
    :removeUnknownsAndDefaults,
    :removeUnusedNS,
    :removeUselessDefs,
    :removeUselessStrokeAndFill,
    :removeViewBox,
    :removeXMLProcInst
]

class SvgoOptions
    def initialize
        @options = OpenStruct.new(
            js2svg: OpenStruct.new(pretty: false),
            plugins: PLUGINS_DEFAULT,
            floatPrecision: 6,
            multipass: false
        )
        yield @options if block_given?
    end

    def get_options(*args)
        options = @options.to_h
        options[:js2svg] = options[:js2svg].to_h
        options
    end

    def to_s
        get_options.to_json
    end

    def js2svg
        @options.js2svg
    end

    def js2svg=(arg)
        @options.js2svg = arg
    end

    def plugins
        @options.plugins
    end

    def plugins=(arg)
        @options.plugins = arg
    end

    def floatPrecision
        @options.floatPrecision
    end

    def floatPrecision=(arg)
        @options.floatPrecision = arg
    end

    def multipass
        @options.multipass
    end

    def multipass=(arg)
        @options.multipass = arg
    end

    def [](key)
        @options[key.to_sym]
    end
end

class SvgOptimizer
    def initialize(options=SvgoOptions.new)
        yield options if block_given?
        if options.is_a? SvgoOptions
            @options = options.get_options
        else
            @options = options
        end
        if not @options[:plugins]
            @options[:plugins] = PLUGINS_DEFAULT
        end
        if @options[:plugins].is_a? Array
            @options[:plugins] = @options[:plugins].map {|p| [p, true]}.to_h
        end
        svgo_js = File.expand_path("../../svgo-js/svgo-built.js", __FILE__)
        svgo_module = File.open(svgo_js, "r:utf-8", &:read)
        @context = ExecJS.compile(svgo_module)
    end

    def optimize(svg_data)
        @context.call("svgo", @options.to_json, svg_data.to_s);
    end

    def optimize_file(svg_file)
        optimize(File.read(svg_file))
    end
end
