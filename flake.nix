{
  description = "Cohabitat.cc development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    modern-resume-env.url = "github:coderbunker/modern-resume-env/main";
  };

  outputs = { self, nixpkgs, flake-utils, modern-resume-env }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        # Shared packages from environment
        envPkgs = modern-resume-env.lib.${system}.pkgsGroup;

        # Extended versions script
        admin-versions = pkgs.writeShellScriptBin "versions" ''
          ${modern-resume-env.packages.${system}.versions}/bin/versions
        '';
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            admin-versions
          ]
          ++ envPkgs.core
          ++ envPkgs.runtime
          ++ envPkgs.cicd
          ++ envPkgs.docker
          ++ envPkgs.lint
          ++ envPkgs.db;

          shellHook = modern-resume-env.lib.${system}.shellUtils + ''
            ${modern-resume-env.lib.${system}.sopsHook}
            ${modern-resume-env.lib.${system}.setupHooks}
            log_interactive "🛡️ cohabitat.cc development environment active"
          '';
        };
      }
    );
}
