# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "codys-house"
  spec.version       = "0.1.0"
  spec.authors       = ["Chris Connelly"]
  spec.email         = ["me@chrisconnelly.dev"]

  spec.summary       = "A simple jekyll theme made up from Cody House componants."
  spec.homepage      = "TODO: Put your gem's website or public repo URL here."
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_data|_layouts|_includes|_sass|LICENSE|README|_config\.yml)!i) }

  spec.add_runtime_dependency "jekyll", "~> 4.3"
  spec.add_development_dependency "bundler"
end
