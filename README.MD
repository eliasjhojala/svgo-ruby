[![Gem Version](https://badge.fury.io/rb/svgo.svg)](https://badge.fury.io/rb/svgo)
[![License](https://img.shields.io/github/license/greenhost/svgo-ruby.svg)](https://github.com/greenhost/svgo-ruby/blob/master/LICENSE.txt)

# A Ruby wrapper for Node SVGO

Removes metadata and editor data elements and attributes that are redundant
from SVG files. Can strip files so they are optimised for web use. Go to
[SVGO](https://github.com/svg/svgo) for more documentation on features.

# Note to users of 1.x versions

`execjs` is no longer used as a wrapper around JavaScript run times, instead
[`mini_racer`](https://github.com/discourse/mini_racer) is used directly. That
means one dependency is removed. `mini_racer` was already a dependency so it
should not make a difference during installation.



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

You can also choose the plugins to use, you can either pass the exact plugins
you want with their configuration, or you can modify the default plugin list.

```ruby
require('svgo')
svg_file = "path/to/a.svg"
options = {
    plugins: {
        addAttributesToSVGElement: true,
        addClassesToSVGElement: true,
        cleanupAttrs: false,
        cleanupEnableBackground: true,
        cleanupIDs: false,
        cleanupListOfValues: true,
        collapseGroups: true,
        cleanupNumericValues: true,
        #etc..
    }
}
svgo = SvgOptimizer.new(options)
```

### As a CLI tool

Strictly speaking this mode is for testing only. But if you can't install
NodeJS, and you do have a Ruby environment and you really need a CLI tool, you
might be able to squeeze out some optimised files from this utility.

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

## How this works

[`mini_racer`](https://github.com/discourse/mini_racer) is used to run the
Node SVGO as a library. The SVGO library returns a JavaScript Promise, which
is currently not supported by `mini_racer` and perhaps never will be.
`setTimeout` and sleep-like functions are also disabled in `mini_racer` so we
can't wait for the Promise to get fulfilled. Therefore there is a small
wrapper JavaScript in this repository
that calls all the components that SVGO is made up of, but without the
`Promise`. It also wraps up the configuration of plugins the way it is expected
by SVGO's components. Lastly `require` is not supported by `mini_racer` so all
of this is transpiled to one monolithic JavaScript file - that is completely
self-contained, using [browserify](http://browserify.org/).

### Transpiling Node SVGO

__TL;DR:__ A transpiled version of SVGO is included in the repository, so you
don't need to transpile anything.

Because `mini_racer` supports only self-contained modules, and does not allow
`require()`, `Promise` etc.. The SGVO library is wrapped in a JavaScript that
requires all the main parts of SVGO and makes an SVGO function without
JavaScript Promises. The wrapper is then transpiled to a self-contained module
using [browserify](http://browserify.org/).

The transpile command can be found in the `Rakefile`. Assuming you have
[Node](https://nodejs.org/) and [yarn](https://yarnpkg.com/en/) installed on
your system, you can then run:

``` bash
yarn install
rake
```

__Note__: if you do not have `yarn` you can run `npm install` instead, but if
you install Node modules often, you probably should do yourself a favour check
out [yarn](https://yarnpkg.com/en/).
