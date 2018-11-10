import { Template } from 'meteor/templating'
import { Tracker } from 'meteor/tracker'
import { Meteor } from 'meteor/meteor'
import { ReactiveDict } from 'meteor/reactive-dict'

import SimpleSchema from 'simpl-schema'
import '../startup/both'
import '../imports/list/list'
import { SharedState } from '../imports/shared/SharedState'
import { DocumentsA, DocumentsACollection } from '../imports/collections/DocumentsA'
import { DocumentsB, DocumentsBCollection } from '../imports/collections/DocumentsB'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import popper from 'popper.js'

global.Popper = popper

AutoForm.setDefaultTemplate('bootstrap4')

const schemaA = new SimpleSchema(DocumentsA.schema, { tracker: Tracker })
const schemaB = new SimpleSchema(DocumentsB.schema, { tracker: Tracker })

Template.main.onCreated(function () {
  const instance = this
  instance.state = new ReactiveDict()
  instance.state.set('showDocuments', 'a')
  instance.autorun(function () {
    console.log('autorun', new Date())
    const docsASub = instance.subscribe(DocumentsA.publication)
    const docsBSub = instance.subscribe(DocumentsB.publication)

    if (docsASub.ready()) {
      instance.state.set('docsAReady', true)
    }
    if (docsBSub.ready()) {
      instance.state.set('docsBReady', true)
    }
  })
})

Template.main.helpers({
  loadComplete () {
    return Template.instance().state.get('docsAReady') &&
      Template.instance().state.get('docsBReady')
  },
  showDocuments (target) {
    return Template.instance().state.get('showDocuments') === target
  },
  showInsert () {
    return Template.instance().state.get('showInsert')
  },
  schema () {
    const type = Template.instance().state.get('showDocuments')
    switch (type) {
      case 'a':
        return schemaA
      case 'b':
        return schemaB
      default:
        throw new Error('unknown type, can\'t find schema')
    }
  },
  collection (type) {
    switch (type) {
      case 'a':
        return DocumentsA.name
      case 'b':
        return DocumentsB.name
      default:
        throw new Error('unknown collection')
    }
  },
  editTarget () {
    return SharedState.get('editTarget')
  },
  doc (_id) {
    const type = Template.instance().state.get('showDocuments')
    switch (type) {
      case 'a':
        return DocumentsACollection.findOne(_id)
      case 'b':
        return DocumentsBCollection.findOne(_id)
      default:
        throw new Error('unknown collection')
    }
  }
})

Template.main.events({

  'click .nav-tab' (event, templateInstance) {
    event.preventDefault()
    const target = templateInstance.$(event.currentTarget).attr('data-target')
    console.log('target', target)
    templateInstance.state.set('showInsert', false)
    templateInstance.state.set('showDocuments', target)
  },

  'click #new-entry' (event, templateInstance) {
    event.preventDefault()
    templateInstance.state.set('showInsert', true)
  },

  'submit #insertForm' (event, templateInstance) {
    event.preventDefault()
    const insertDoc = AutoForm.getFormValues('insertForm').insertDoc
    const type = Template.instance().state.get('showDocuments')
    switch (type) {
      case 'a':
        DocumentsACollection.insert(insertDoc)
        break
      case 'b':
        DocumentsBCollection.insert(insertDoc)
        break
      default:
        throw new Error('unknown type, can\'t find collection')
    }
    templateInstance.state.set('showInsert', false)
  }
})
