# [1.3.0](https://github.com/vuejs/jsx-vue2/compare/v1.2.4...v1.3.0) (2022-07-06)

## other

#### Features

* add importSource option ([#284](https://github.com/vuejs/jsx-vue2/issues/284)) ([abffc65](https://github.com/vuejs/jsx-vue2/commit/abffc65))
* rework the `compositionAPI` option of the preset to support Vue 2.7 ([e7d094e](https://github.com/vuejs/jsx-vue2/commit/e7d094e))



# [1.2.4](https://github.com/vuejs/jsx-vue2/compare/v1.2.3...v1.2.4) (2020-10-27)

## other

#### Bug Fixes

* **composition-api-render-instance:** store currentInstance in variable for render instance ([#168](https://github.com/vuejs/jsx-vue2/issues/168)) ([a3525bf](https://github.com/vuejs/jsx-vue2/commit/a3525bf))



# [1.2.3](https://github.com/vuejs/jsx-vue2/compare/v1.2.2...v1.2.3) (2020-10-20)

## other

#### Bug Fixes

* v-model/v-on should apply before arrow-functions transform ([#167](https://github.com/vuejs/jsx-vue2/issues/167)) ([319932e](https://github.com/vuejs/jsx-vue2/commit/319932e)), closes [#87](https://github.com/vuejs/jsx-vue2/issues/87) [/github.com/vuejs/jsx/issues/165#issuecomment-712603569](https://github.com//github.com/vuejs/jsx/issues/165/issues/issuecomment-712603569)



# [1.2.2](https://github.com/vuejs/jsx-vue2/compare/v1.2.1...v1.2.2) (2020-10-17)

## other

#### Bug Fixes

* functional-vue & inject-h should traverse before JSX plugin ([#166](https://github.com/vuejs/jsx-vue2/issues/166)) ([8969609](https://github.com/vuejs/jsx-vue2/commit/8969609)), closes [#165](https://github.com/vuejs/jsx-vue2/issues/165)



# [1.2.1](https://github.com/vuejs/jsx-vue2/compare/v1.2.0...v1.2.1) (2020-10-16)

## other

#### Bug Fixes

* add composition-api packages to dependencies ([cd9db9f](https://github.com/vuejs/jsx-vue2/commit/cd9db9f))



# [1.2.0](https://github.com/vuejs/jsx-vue2/compare/v1.1.2...v1.2.0) (2020-10-16)

## other

#### Features

* add [@vue](https://github.com/vue)/composition-api support ([#142](https://github.com/vuejs/jsx-vue2/issues/142)) ([ecc6ed6](https://github.com/vuejs/jsx-vue2/commit/ecc6ed6))
* allow prior babel plugins to traverse JSX tree throughly, close [#86](https://github.com/vuejs/jsx-vue2/issues/86) ([b49fa8a](https://github.com/vuejs/jsx-vue2/commit/b49fa8a))
* change all sugar plugins to work without pre-traversing the Program ([0943580](https://github.com/vuejs/jsx-vue2/commit/0943580))



# [1.1.2](https://github.com/vuejs/jsx-vue2/compare/v1.1.1...v1.1.2) (2019-11-09)

## other

#### Bug Fixes

* add [@babel](https://github.com/babel)/core to peerDependencies ([f60f316](https://github.com/vuejs/jsx-vue2/commit/f60f316))



# [1.1.1](https://github.com/vuejs/jsx-vue2/compare/v1.1.0...v1.1.1) (2019-10-11)

## other

#### Bug Fixes

* **v-model:** create non-existent properties as reactive ([05b9b3a](https://github.com/vuejs/jsx-vue2/commit/05b9b3a))



# [1.1.0](https://github.com/vuejs/jsx-vue2/compare/v1.0.0...v1.1.0) (2019-07-23)

## other

#### Bug Fixes

* support for `.passive` modifier ([01177c8](https://github.com/vuejs/jsx-vue2/commit/01177c8))



# [1.0.0](https://github.com/vuejs/jsx-vue2/compare/v1.0.0-beta.3...v1.0.0) (2019-05-08)

## other

#### Bug Fixes

* Support props with underscore, close [#55](https://github.com/vuejs/jsx-vue2/issues/55) ([852481c](https://github.com/vuejs/jsx-vue2/commit/852481c))



# [1.0.0-beta.3](https://github.com/vuejs/jsx-vue2/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2019-03-22)

## other

#### Bug Fixes

* filter out jsx comments in `getChildren` ([7f0c84c](https://github.com/vuejs/jsx-vue2/commit/7f0c84c)), closes [#46](https://github.com/vuejs/jsx-vue2/issues/46)
* fix incorrect repository urls ([99380b3](https://github.com/vuejs/jsx-vue2/commit/99380b3))



# [1.0.0-beta.2](https://github.com/vuejs/jsx-vue2/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2019-01-11)

## other

#### Bug Fixes

* remove extraneous peer deps ([29414a7](https://github.com/vuejs/jsx-vue2/commit/29414a7))
* Trim whitespaces properly, fix [#37](https://github.com/vuejs/jsx-vue2/issues/37) ([54c75ee](https://github.com/vuejs/jsx-vue2/commit/54c75ee))
#### Features

* Support root-level attributes, close [#32](https://github.com/vuejs/jsx-vue2/issues/32) ([96b182c](https://github.com/vuejs/jsx-vue2/commit/96b182c))



# 1.0.0-beta.1 (2018-12-25)

## other

#### Bug Fixes

* Add events at the begining of argument list ([0604214](https://github.com/vuejs/jsx-vue2/commit/0604214))
* Add staticClass as root attribute ([cd3bab1](https://github.com/vuejs/jsx-vue2/commit/cd3bab1))
* Do not trim all spaces ([c5ebfac](https://github.com/vuejs/jsx-vue2/commit/c5ebfac))
* Fix failing tests ([21213df](https://github.com/vuejs/jsx-vue2/commit/21213df))
* Force html & svg tags to always be treated as string tags ([12a311e](https://github.com/vuejs/jsx-vue2/commit/12a311e))
* proper support for camelCase ([a903610](https://github.com/vuejs/jsx-vue2/commit/a903610))
* Support camelCase directives ([6a43377](https://github.com/vuejs/jsx-vue2/commit/6a43377))
* Support default export in functional component ([7e6f893](https://github.com/vuejs/jsx-vue2/commit/7e6f893))
* throw an error if v-model is used with a string ([82d6bcb](https://github.com/vuejs/jsx-vue2/commit/82d6bcb))
#### Features

* Add release utilities ([4bb22fb](https://github.com/vuejs/jsx-vue2/commit/4bb22fb))
* add support for argument and modifiers for directives ([0085b8f](https://github.com/vuejs/jsx-vue2/commit/0085b8f))
* change the syntax for argument and modifiers ([b1c8036](https://github.com/vuejs/jsx-vue2/commit/b1c8036))
* Event modifiers for v-on ([cef09bb](https://github.com/vuejs/jsx-vue2/commit/cef09bb))
* implement babel preset ([1137c1d](https://github.com/vuejs/jsx-vue2/commit/1137c1d))
* Support vModel in kebab-case components ([dc0e29f](https://github.com/vuejs/jsx-vue2/commit/dc0e29f))
* Treat string as component if declared in scope ([51ca488](https://github.com/vuejs/jsx-vue2/commit/51ca488))



