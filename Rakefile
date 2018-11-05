desc "Build svgo to single module."
task :build do
  sh(%q(npx browserify --standalone svgo \
    -o ./svgo-js/svgo-built.js \
    ./svgo-js/svgo-wrapper.js
  ))
end

task :install do
  sh("yarn install")
end

task :default =>  :build

