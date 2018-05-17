Package.describe({
  name: 'jkuester:autoform-documents',
  version: '0.1.0',
  // Brief, one-line summary of the package.
  summary: 'Select or create documents and link them in your current form.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/jankapunkt/meteor-autoform-documents.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.6.1.1');
  api.use('ecmascript');
  api.use('templating');
  api.use('underscore');
  api.use('random');
  api.use('jquery');
  api.use('tracker');
  api.use('reactive-dict');
  api.use('dburles:mongo-collection-instances');
  api.use('aldeed:autoform@6.3.0');
  api.addFiles([
    'autoform-documents.html',
    'autoform-documents.css',
    'autoform-documents.js',
  ], 'client');
});
