/* eslint-env meteor */
Package.describe({
  name: 'jkuester:autoform-documents',
  version: '1.2.0',
  // Brief, one-line summary of the package.
  summary: 'Select or create documents and link them in your current form.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/jankapunkt/meteor-autoform-documents.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom('1.7')
  api.use('ecmascript')
  api.use('templating@1.3.2')
  api.use('underscore')
  api.use('random')
  api.use('tracker')
  api.use('reactive-dict')
  api.use('dburles:mongo-collection-instances@0.3.5')
  api.use('aldeed:autoform@6.3.0')
  api.addFiles([
    'autoform-documents.html',
    'autoform-documents.css',
    'autoform-documents.js'
  ], 'client')
})
