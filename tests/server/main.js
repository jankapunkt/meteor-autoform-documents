import { Meteor } from 'meteor/meteor'
import '../startup/both'

import { DocumentsA, DocumentsACollection } from '../imports/collections/DocumentsA'
import { DocumentsB, DocumentsBCollection } from '../imports/collections/DocumentsB'

Meteor.publish(DocumentsA.publication, function () {
  // security checks are all
  // up to you ....
  return DocumentsACollection.find()
})

Meteor.publish(DocumentsB.publication, function () {
  // security checks are all
  // up to you ....
  return DocumentsBCollection.find()
})

Meteor.methods({
  [ DocumentsB.methods.get.name ] (query) {
    // security checks are all
    // up to you ....
    return DocumentsBCollection.findOne(query)
  },
  [ DocumentsB.methods.insert.name ] (insertDoc) {
    // security checks are all
    // up to you ....
    return DocumentsBCollection.insert(insertDoc)
  },
  [ DocumentsB.methods.update.name ] (updateDoc) {
    // security checks are all
    // up to you ....
    return DocumentsBCollection.update(updateDoc._id, updateDoc.modifier)
  },
})