/* global AutoForm */
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { Template } from 'meteor/templating'
import { ReactiveDict } from 'meteor/reactive-dict'
import { $ } from 'meteor/jquery'

import SimpleSchema from 'simpl-schema'

import './autoform-documents.html'
import './autoform-documents.css'

// extend autoform with bpmn modeler
AutoForm.addInputType('documents', {
  template: 'afDocuments',
  valueOut () {
    return this.val()
  },
  valueIn (initialValue) {
    return initialValue
  }
})

let extSchema

Template.afDocuments.onCreated(function () {
  const instance = this
  instance.state = new ReactiveDict()
  instance.state.set('listMode', false)
  instance.autorun(() => {
    // trigger new autorun
    const updated = instance.state.get('updated')
    if (updated) {
      instance.state.set('updated', false)
    }

    const data = Template.currentData()
    const { atts } = data
    const { methods } = atts

    extSchema = new SimpleSchema(atts.schema, { tracker: Tracker })
    instance.state.set('label', atts.label)
    instance.state.set('selectOptions', data.selectOptions)
    instance.state.set('dataSchemaKey', atts[ 'data-schema-key' ])
    instance.state.set('collectionName', atts.collection)
    instance.state.set('getDocMethodName', methods.get)
    instance.state.set('insertDocMethodName', methods.insert)
    instance.state.set('updateDocMethodName', methods.update)
    instance.state.set('firstOption', atts.firstOption)
    instance.state.set('loadComplete', true)

    const currentTarget = instance.state.get('target')
    if (!currentTarget && data.value) {
      instance.state.set('target', data.value)
    }
  })
})

Template.afDocuments.helpers({
  loadComplete () {
    return Template.instance().state.get('loadComplete')
  },
  label () {
    return Template.instance().state.get('label')
  },
  documents () {
    return Template.instance().state.get('selectOptions')
  },
  firstOption () {
    return Template.instance().state.get('firstOption')
  },
  dataSchemaKey () {
    return Template.instance().state.get('dataSchemaKey')
  },
  listMode () {
    const instance = Template.instance()
    const listMode = instance.state.get('listMode')
    if (listMode) {
      // ensure target list item is visible if one is selected
      const target = instance.state.get('target')
      if (target) {
        setTimeout(() => {
          const el = $(`.li-${target}`).get(0)
          el.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      }
    }
    return listMode
  },
  isSelected (id) {
    return Template.instance().state.get('target') === id
  },
  target () {
    return Template.instance().state.get('target')
  },
  targetLabel () {
    const target = Template.instance().state.get('target')
    const selectOptions = Template.instance().state.get('selectOptions')
    const doc = selectOptions.find(el => el.value === target)
    return doc && doc.label
  },
  insertTarget () {
    return Template.instance().state.get('insertTarget')
  },
  editTarget () {
    return Template.instance().state.get('editTarget')
  },
  extSchema () {
    return extSchema
  }
})

Template.afDocuments.events({
  'click .afDocumentsFirstOption' (event, templateInstance) {
    event.preventDefault()
    templateInstance.state.set('listMode', true)
  },
  'click .afDocumentsAddButton' (event, templateInstance) {
    event.preventDefault()
    event.stopPropagation()
    templateInstance.state.set('editTarget', null)
    templateInstance.state.set('insertTarget', true)
    $('.afDocumentsFormModal').modal('show')
  },
  'click .afDocumentsUnselect' (event, templateInstance) {
    event.preventDefault()
    templateInstance.state.set('editTarget', null)
    templateInstance.state.set('insertTarget', false)
    templateInstance.state.set('target', null)
    $('#afDocumentHiddenInput').val(null)
  },
  'click .afDocumentsEditButton' (event, templateInstance) {
    event.preventDefault()
    event.stopPropagation()
    const targetId = $(event.currentTarget).attr('data-target')
    templateInstance.state.set('insertTarget', false)
    const getDocMethodName = templateInstance.state.get('getDocMethodName')
    Meteor.call(getDocMethodName, { _id: targetId }, (err, res) => {
      if (err) {
        console.error(err)
      } else {
        templateInstance.state.set('editTarget', res)
      }
    })
    $('.afDocumentsFormModal').modal('show')
  },
  'click .afDocumentsApplyButton' (event, templateInstance) {
    event.preventDefault()
    templateInstance.state.set('listMode', false)
  },
  'click .afDocumentsEntry' (event, templateInstance) {
    event.preventDefault()
    const value = $(event.currentTarget).attr('data-target')
    $('#afDocumentHiddenInput').val(value)
    templateInstance.state.set('target', value)
  },
  'click .afDocumentsSelectButtons' (event, templateInstance) {
    event.preventDefault()
    const listMode = templateInstance.state.get('listMode')
    templateInstance.state.set('listMode', !listMode)
  },
  'submit #afDocumentsExternalDocInsertForm' (event, templateInstance) {
    event.preventDefault()
    const values = AutoForm.getFormValues('afDocumentsExternalDocInsertForm')
    const insertMethodName = templateInstance.state.get('insertDocMethodName')
    Meteor.call(insertMethodName, values.insertDoc, (err, docId) => {
      if (err) {
        console.error(err)
      } else {
        templateInstance.state.set('updated', true)
        templateInstance.state.set('target', docId)
        templateInstance.state.set('insertTarget', false)
        templateInstance.state.set('listMode', false)
        $('.afDocumentsFormModal').modal('hide')
      }
    })
  },
  'submit #afDocumentsExternalDocEditForm' (event, templateInstance) {
    event.preventDefault()
    const values = AutoForm.getFormValues('afDocumentsExternalDocEditForm')
    const editTarget = templateInstance.state.get('editTarget')
    const updateMethodName = templateInstance.state.get('updateDocMethodName')
    Meteor.call(updateMethodName, { _id: editTarget._id, modifier: values.updateDoc }, (err, res) => {
      if (err) {
        console.error(err)
      } else {
        templateInstance.state.set('editTarget', null)
        templateInstance.state.set('updated', true)
        $('.afDocumentsFormModal').modal('hide')
      }
    })
  }
})
