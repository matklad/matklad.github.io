with import <nixpkgs> {};
pkgs.mkShell {
  buildInputs = [
    pkgconfig openssl cmake zlib libgit2 python llvm_7 libxml2
  ];
}
