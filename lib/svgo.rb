require 'execjs'
require 'json'
require 'pry'

class SvgOptimizer
    def initialize(options)
        valid_svgo_opts = [:js2svg, :plugins, :multipass, :floatPrecision]
        @config = options.select { |k,_| valid_svgo_opts.include? k }.to_json
        svgo_js = File.expand_path("../../svgo-js/svgo-built.js", __FILE__)
        svgo_module = File.open(svgo_js, "r:utf-8", &:read)
        @context = ExecJS.compile(svgo_module)
    end

    def optimize(svg_data)
        @context.call("svgo", @config, svg_data.to_s);
    end

    def optimize_file(svg_file)
        optimize(File.read(svg_file))
    end
end
