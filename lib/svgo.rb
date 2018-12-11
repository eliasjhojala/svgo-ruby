require 'mini_racer'
require 'json'
require 'pry'
require 'ostruct'

PLUGINS_DEFAULT = [
    :addAttributesToSVGElement,
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
            plugins: PLUGINS_DEFAULT.map { | p | [ p, true ] }.to_h,
            multipass: false
        )
        yield @options if block_given?
    end

    def get_options(*args)
        options = @options.to_h
        options[:js2svg] = options[:js2svg].to_h
        options[:plugins] = options[:plugins].map { | plugin, params |
          {plugin => params}
        }
        options
    end

    def to_s
        get_options.to_json
    end

    def js2svg
        @options.js2svg
    end

    def js2svg=(js2svg)
        @options.js2svg = js2svg
    end

    def plugins
        @options.plugins
    end

    def plugins=(plugins)
        @options.plugins = plugins
    end

    def floatPrecision
        @options.floatPrecision
    end

    def floatPrecision=(floatPrecision)
        @options.floatPrecision = floatPrecision
    end

    def multipass
        @options.multipass
    end

    def multipass=(multipass)
        @options.multipass = multipass
    end

    def [](key)
        @options[key.to_sym]
    end

    def runtime
        @options.runtime
    end

    def runtime=(runtime)
        @options.runtime = runtime
    end
end

class SvgOptimizer
    attr_accessor :options
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
        if not @options[:plugins].is_a? Array
            raise StandardError.new("`options.plugins` should be an Array.")
        end
        @options[:plugins] = @options[:plugins].map { | p |
          p.is_a?(Hash) ? p : {p => true}
        }
        svgo_js = File.expand_path("../../svgo-js/svgo-built.js", __FILE__)
        svgo_module = File.open(svgo_js, "r:utf-8", &:read)
        @context = MiniRacer::Context.new
        @context.eval svgo_module
        @context.call("svgo", {setup: @options})
    end

    def optimize(svg_data)
        result = @context.call("svgo", {optimize: svg_data.to_s})
        if not result
            raise StandardError.new("Bad response from JavaScript runtime.")
        end
        if result['errors'].length > 0
            if result['errors'].length > 1
                err = %Q(Errors occurred: \n - #{result['errors'].join("\n - s")})
            else
                err = "An error occurred: #{result['errors'][0]}"
            end
            raise StandardError.new(err)
        end
        result
    end

    def optimize_file(svg_file)
        optimize(File.read(svg_file))
    end
end
