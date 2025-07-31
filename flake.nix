{
  description = "A simple notification cleaner for macOS";

  inputs = {
    devenv-root.url = "file+file:///dev/null";
    devenv-root.flake = false;
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:cachix/devenv-nixpkgs/rolling";
    devenv.url = "github:cachix/devenv";
    nix2container.url = "github:nlewo/nix2container";
    nix2container.inputs.nixpkgs.follows = "nixpkgs";
    mk-shell-bin.url = "github:rrbutani/nix-mk-shell-bin";
    systems.url = "github:nix-systems/default-darwin";
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs =
    inputs@{ flake-parts, devenv-root, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.devenv.flakeModule ];
      systems = import inputs.systems;

      perSystem =
        {
          config,
          self',
          inputs',
          pkgs,
          system,
          ...
        }:
        {
          packages.default = pkgs.buildNpmPackage {
            pname = "notification-cleaner";
            version = "1.0.0";
            src = ./.;
            buildInputs = [ pkgs.nodejs ];
            npmDepsHash = "sha256-DR4K3TMyUK3t8h1EVOzLyQHJZGFtWqJMr9/ij2nwu+8=";
            npmPackFlags = [ "--ignore-scripts" ];
            npmBuildScript = "build";

            # we would not like the node wrapper script
            postInstall = ''
              mkdir -p $out/bin
              cp $out/lib/node_modules/notification-cleaner/dist/src/index.js $out/bin/notification-cleaner
              chmod +x $out/bin/notification-cleaner
            '';

            meta = {
              description = "A simple notification cleaner for macOS";
              license = pkgs.lib.licenses.mit;
              mainProgram = "notification-cleaner";
            };
          };

          devenv.shells.default = {
            name = "notification-cleaner-shell";
            languages.javascript = {
              enable = true;
              npm.enable = true;
            };
          };

        };
      flake = {
        # The usual flake attributes can be defined here, including system-
        # agnostic ones like nixosModule and system-enumerating ones, although
        # those are more easily expressed in perSystem.

      };
    };
}
