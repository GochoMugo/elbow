/*
 * Command-line interface
 *
 * The MIT License (MIT)
 * Copyright (c) 2015-2017 GochoMugo <mugo@forfuture.co.ke>
 */


/* eslint-disable no-process-exit */


// built-in modules
import path from "path";


// installed modules
import _ from "lodash";
import parser from "commander";
import out from "cli-output";


// own modules
import elbow from ".";
import pkg from "../package.json";


parser
  .version(pkg.version)
  .option("-l, --list [schema-dir]", "list schemas [./schema]")
  .parse(process.argv);


// listing schemas
if (parser.list) {
  let dirpath = parser.list;

  // default to $PWD/schema if no path is provided
  if (dirpath === true) {
    dirpath = path.join(process.cwd(), "schema");
  }

  // listing schemas
  elbow.schemas(dirpath, function(error, schemas) {
    if (error) {
      out.error(`error listing schemas: ${error}`);
      return process.exit(1);
    }

    const keys = _.keys(schemas);

    // if no schema was found
    if (keys.length === 0) {
      return out.error("no schema found");
    }

    out.success("listing schemas\n");
    schemas.forEach(function(schema) {
      console.log(`  ${schema.methods} ${schema.endpoint} (${schema.description}) -> ${schema.filepath}`);
    });
  });
}
