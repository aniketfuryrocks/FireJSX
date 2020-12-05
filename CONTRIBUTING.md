# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change. 

Please note we have a [Code of conduct](CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

## Running

Make sure you have typescript compiler installed and available as tsc.

1. run `yarn install` to install all dependencies.
2. run `yarn dev` if u are in a unix like env. Windows users should run typescript compiler manually. Make sure a typescript outputs to a dist folder.
3. run `yarn test` inside the test dir and follow along.

`yarn dev` does not run tsc with watch flag. U can run it manually.

## Pull Request Process

1. Update `changelog.md` file, and describe all changes in detail
2. Increase the version number in `Globals.ts` and `package.json` file to the new version that this
   Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
3. Compile all **typescript** files according to the **tsconfig** file.