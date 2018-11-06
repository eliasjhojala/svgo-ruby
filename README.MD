# A Ruby wrapper for Node SVGO

Removes metadata and editor data elements and attributes that are redundant
from SVG files. Can strip files so they are optimised for web use. Go to 
[SVGO](https://github.com/svg/svgo) for more documentation on features.

## How this works

[`execjs`](https://github.com/rails/execjs) is used to run the Node SVGO as a 
library. The SVGO library returns a JavaScript Promise, which is currently not
supported by `execjs` and probably never will be. `setTimeout` and sleep-like
functions are also disabled in `execjs` so we can't wait for the Promise to get
fulfilled. Therefore there is a small wrapper JavaScript in this repository 
that calls all the components that SVGO is made up of, but without the 
`Promise`. It also wraps up the configuration of plugins the way it is expected
by SVGO's components. Lastly `require` is not supported by `execjs` so all of 
this is transpiled to one monolithic JavaScript file - that is completely 
self-contained, using [browserify](http://browserify.org/).

__NOTE:__ `execjs` supports a variety of JavaSript runtimes, notably 
[`therubyracer`](https://github.com/cowboyd/therubyracer), but `therubyracer`
depends on an ancient [`libv8`](https://github.com/cowboyd/libv8), which 
doesn't support some of the modern syntax used in SVGO. Therefore `mini_racer`
(a drop in replacement for `therubyracer`) is a dependency, which uses a much
more recent `libv8`.

If you have [Node](https://nodejs.org/) installed you could also use that as a 
runtime. 

## How to use?

### As a library

As intended: a Ruby library. Add it to your Gemfile or *.gemspec file and
install it.

#### Method 1 (Recommended)

By supplying a block that modifies the default options in `SvgoOptions`.

```ruby
require('svgo')
svg_file = "path/to/a.svg"
svgo = SvgOptimizer.new() do | options |
    options.plugins << :removeRasterImages # (disabled by default)
    options.plugins.delete(:cleanupIDs) # (enabled by default)
    options.js2svg.pretty = true
end
svgo.optimize(File.read(svg_file))
# => <svg xmlns="http://www.w3.org/2000/svg" ...
```

#### Method 2

You can manually pass options to the class that correspond to 
[SVGO](https://github.com/svg/svgo)'s documentation.

```ruby
require('svgo')
svg_file = "path/to/a.svg"
options = {
    floatPrecision: 7,
    js2svg: {
        pretty: true
    },
    multipass: false
}
svgo = SvgOptimizer.new(options)
svgo.optimize(File.read(svg_file))
# => <svg xmlns="http://www.w3.org/2000/svg" ...

# OR..

svgo.optimize_file(svg_file)
# => <svg xmlns="http://www.w3.org/2000/svg" ...
```

You can also choose the plugins to use, you can either pass the exact plugins you want with their configuration, or you can modify the default plugin list.

```ruby
require('svgo')
svg_file = "path/to/a.svg"
options = {
    plugins: {
        :addAttributesToSVGElement=>true,
        :addClassesToSVGElement=>true,
        :cleanupAttrs=>false,
        :cleanupEnableBackground=>true,
        :cleanupIDs=>false,
        :cleanupListOfValues=>true,
        :cleanupNumericValues=>true,
        :collapseGroups=>true,
        #etc..
    }
}
svgo = SvgOptimizer.new(options)
```

### As a CLI tool

Strictly speaking this mode is for testing only. But if you can't install NodeJS, and you do have a Ruby environment and you really need a CLI tool, you might be able to squeeze out some optimised files from this utility.

``` bash
gem install svgo-ruby
svgo-ruby --pretty < test/fixtures/ruby.svg > test/fixtures/ruby.optim.svg
ls -hl test/fixtures
total 72
-rw-r--r--  1 user  staff   9.5K Nov  5 22:16 ruby.optim.svg
-rw-r--r--  1 user  staff    23K Nov  5 22:12 ruby.svg
```

### As a CLI tool from docker

Because this uses a Node utility from a monolithic JavaScript environment which
is highly dependent on whatever version is available on your system, etc.
There is a Dockerfile which should always build correctly and run the CLI tool.

This is also only intended for testing purposes.

``` bash
docker build -t svgo ./
docker run -i svgo < test/fixtures/ruby.svg > test/fixtures/ruby.optim.svg
-rw-r--r--  1 user  staff   9.5K Nov  5 22:16 ruby.optim.svg
-rw-r--r--  1 user  staff    23K Nov  5 22:12 ruby.svg
```

## Building Node SVGO from source

Because `execjs`