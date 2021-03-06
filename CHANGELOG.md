# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## Unreleased

Added:
* Added support for Node.js v10, v11

Changed:
* Dropped support for Node.js v4, v5, v6, v7, v8
* Updated dependencies


## 1.1.1 - 2017-09-29

Changed:

* Update dependencies (`superagent` critical vulnerability)


## 1.1.0 - 2017-07-31

Added:

* Added `options.headers`, `options.query`, `options.body` and `options.extensions`
* Added `headers`, `query`, `body`, `export` extensions in JSON schema
* Added variable expansion for `endpoint`, `headers`, `query` and `body`
  extensions in JSON schema
* Added setup hook (`options.before`, `options.beforeUrl`)
* Added support for Node.js v5, v7 and v8

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
