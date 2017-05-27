# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## Unreleased

Added:

* Added `options.headers`, `options.query` and `options.body`
* Added `headers`, `query` and `body` extensions in JSON schema
* Added variable expansion for `endpoint`, `headers`, `query` and `body`
  extensions in JSON schema
* Added support for Node.js v5 and v7

Changed:

* Deprecate `params` extension in JSON schema
* Replaced [JaySchema](https://github.com/natesilva/jayschema) with [Ajv](https://github.com/epoberezkin/ajv) for schema validation
* Updated dependencies


## 1.0.0 - 2016-11-16

Added:

* Added support for Node.js v6.x series

Changed:

* Updated dependencies

Removed:

* Dropped support for Node.js v0.x series
