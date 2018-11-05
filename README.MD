# A Ruby wrapper for Node SVGO

Removes metadata and editor data elements and attributes that are redundant
from SVG files. Can strip files so they are optimised for web use. Go to [SVGO]
(https://github.com/svg/svgo) for more documentation on features.

## How to use?

### As a library

As intended: a Ruby library. Add it to your Gemfile or *.gemspec file and
install it.

You can pass options to the class that correspond to [SVGO]
(https://github.com/svg/svgo)'s documentation.

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
