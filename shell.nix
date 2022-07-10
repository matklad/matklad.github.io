# rm ./vendor -rf && nix-shell --run 'bundle install'
# nix-shell --run 'bundle exec jekyll serve --livereload'
with import <nixpkgs> {}; mkShell {
  packages = [ ruby ];
}
