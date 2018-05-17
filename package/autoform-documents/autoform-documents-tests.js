// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by autoform-documents.js.
import { name as packageName } from "meteor/jkuester:autoform-documents";

// Write your tests here!
// Here is an example.
Tinytest.add('autoform-documents - example', function (test) {
  test.equal(packageName, "autoform-documents");
});
