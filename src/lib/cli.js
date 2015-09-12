/*
 * Command-line interface
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */


/* eslint-disable no-process-exit */


// built-in modules
import path from "path";


// npm-installed modules
import _ from "lodash";
import prog from "commander";
import out from "cli-output";


// own modules
import elbow from "./index";
import pkg from "../package.json";


prog
  .version(pkg.version)
  .option("-l, --list [schema-dir]", "list schemas")
  .parse(process.argv);


// listing schemas
if (prog.list) {
  let dirpath = prog.list;

  // default to $PWD/schema if no path is provided
  if (dirpath === true) {
    dirpath = path.join(process.cwd(), "schema");
  }

  // listing schemas
  elbow.schemas(dirpath, function(err, schemas) {
    if (err) {
      out.error(`error listing schemas: ${err}`);
      return process.exit(1);
    }

    let keys = _.keys(schemas);

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
