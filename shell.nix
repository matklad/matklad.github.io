with import <nixpkgs> {}; mkShell {
  packages = [ 
    (writeShellScriptBin "serve" "bundle exec jekyll serve --livereload")
    (writeShellScriptBin "install" "rm ./vendor -rf && bundle install")
    ruby libffi pkg-config
  ];
}
