import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { Tracker } from 'meteor/tracker'
import { Template } from 'meteor/templating'
import { ReactiveDict } from 'meteor/reactive-dict'
import { $ } from 'meteor/jquery'
import { formIsValid } from './helpers'
import SimpleSchema from 'simpl-schema'

import './autoform-documents.css'
import './autoform-documents.html'

const extSchema = {}
const extMethods = {}

const MethodNames = {
  get: 'get',
  insert: 'insert',
  update: 'update',
  remove: 'remove'
}

const Buttons = {
  insert: {
    label: 'Create',
    classes: 'btn btn-success'
  },
  update: {
    label: 'Submit',
    classes: 'btn btn-primary'
  }
}

Template.afDocuments.onCreated(function () {
  const instance = this
  instance.state = new ReactiveDict()

  instance.state.set('listMode', false)
  if (instance.data.value) {
    instance.state.set('target', instance.data.value)
  }

  // create an instance id to distinct
  // between the given external methods
  const instanceId = Random.id()
  extMethods[ instanceId ] = {}
  instance.instanceId = instanceId
  extSchema[ instanceId ] = new SimpleSchema(instance.data.atts.schema, { tracker: Tracker })

  /**
   * Adds a method by it's type.
   * @param name one of get, insert, update, remove
   * @param method the method to be called or used for Meteor.call
   * @throws Error if type of method is neither
   */
  function addMethod (name, method) {
    const methodTyoe = typeof method
    if (methodTyoe === 'string') {
      instance.state.set(`${name}DocMethodName`, method)
    } else if (methodTyoe === 'function') {
      extMethods[ instanceId ][ name ] = method
    } else {
      throw new Error(`[autoform-documents] unexpected method type [${method}] for [${name}]`)
    }
  }

  function callMethod (methodType, argsObj, onResult) {
    const callback = (err, res) => {
      if (err) {
        console.error(err)
      } else {
        onResult(res)
      }
    }
    const extMeth = extMethods[ instanceId ][ methodType ]
    if (extMeth) {
      extMeth(argsObj, callback)
    } else {
      const methodName = instance.state.get(`${methodType}DocMethodName`)
      Meteor.call(methodName, argsObj, callback())
    }
  }

  instance.callMethod = callMethod

  // add the required methods for
  // retrieving and manipulating
  // the dependant collection
  const { methods } = instance.data.atts
  addMethod(MethodNames.get, methods.get)
  addMethod(MethodNames.insert, methods.insert)
  addMethod(MethodNames.update, methods.update)

  // keep remove optional as this
  // is rather unusual to do within a form
  if (methods.remove) {
    addMethod(MethodNames.remove, methods.remove)
  }

  instance.autorun(() => {
    // trigger new autorun
    const updated = instance.state.get('updated')
    if (updated) {
      instance.state.set('updated', false)
    }
    const data = Template.currentData()
    const { atts } = data

    instance.state.set('disabled', atts.hasOwnProperty('disabled'))
    instance.state.set('label', atts.label)
    instance.state.set('firstOption', atts.firstOption)
    instance.state.set('selectOptions', data.selectOptions)
    instance.state.set('dataSchemaKey', atts[ 'data-schema-key' ])
    instance.state.set('loadComplete', true)
  })
})

Template.afDocuments.onDestroyed(function onAfDocumentsDestroyed () {
  delete extMethods[ this.instanceId ]
})

Template.afDocuments.helpers({
  instanceId () {
    return Template.instance().state.get('instanceId')
  },
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
  disabled () {
    return Template.instance().state.get('disabled')
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
    const target = Template.instance().state.get('target')
    if (!target) return null
    const selectOptions = Template.instance().state.get('selectOptions')
    return selectOptions.find(entry => entry.value === target)
  },

  afDocumentsFormContext () {
    const instance = Template.instance()
    const editTarget = instance.state.get('editTarget')
    const insertTarget = instance.state.get('insertTarget')
    const disabled = instance.state.get('disabled')
    const formType = disabled ? 'disabled' : 'normal'

    let formId, type

    if (!editTarget && !insertTarget) {
      return null
    } else if (editTarget && insertTarget) {
      throw new Error('[autoform-documents] unexpected editTarget and insertTarget')
    }

    if (insertTarget) {
      formId = 'afDocumentsExternalDocInsertForm'
      type = MethodNames.insert
    }

    if (editTarget) {
      formId = 'afDocumentsExternalDocEditForm'
      type = MethodNames.update
    }

    const buttons = instance.data.atts.buttons
    const targetButton = Object.assign({}, Buttons[ type ], (buttons && buttons[ type ]))

    return {
      id: formId,
      disabled: disabled,
      formType: formType,
      doc: editTarget,
      schema: extSchema[instance.instanceId],
      buttonClasses: targetButton.classes,
      buttonContent: targetButton.label
    }
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
    templateInstance.$('.afDocumentsFormModal').modal('show')
  },
  'click .afDocumentsUnselect' (event, templateInstance) {
    event.preventDefault()
    templateInstance.state.set('editTarget', null)
    templateInstance.state.set('insertTarget', false)
    templateInstance.state.set('target', null)
    templateInstance.$('#afDocumentHiddenInput').val(null)
  },
  'click .afDocumentsEditButton' (event, templateInstance) {
    event.preventDefault()
    event.stopPropagation()
    const targetId = $(event.currentTarget).attr('data-target')
    templateInstance.state.set('insertTarget', false)
    templateInstance.callMethod(MethodNames.get, { _id: targetId }, editTarget => {
      templateInstance.state.set('editTarget', editTarget)
      templateInstance.$('.afDocumentsFormModal').modal('show')
    })
  },
  'click .afDocumentsApplyButton' (event, templateInstance) {
    event.preventDefault()
    templateInstance.state.set('listMode', false)
  },
  'click .afDocumentsEntry' (event, templateInstance) {
    event.preventDefault()
    const value = $(event.currentTarget).attr('data-target')
    templateInstance.$('#afDocumentHiddenInput').val(value)
    templateInstance.state.set('target', value)
  },
  'click .afDocumentsSelectButtons' (event, templateInstance) {
    event.preventDefault()
    const listMode = templateInstance.state.get('listMode')
    templateInstance.state.set('listMode', !listMode)
  },
  'submit #afDocumentsExternalDocInsertForm' (event, templateInstance) {
    event.preventDefault()
    const insertDoc = formIsValid(extSchema, 'afDocumentsExternalDocInsertForm')
    if (!insertDoc) return

    templateInstance.callMethod(MethodNames.insert, insertDoc, docId => {
      templateInstance.state.set('updated', true)
      templateInstance.state.set('target', docId)
      templateInstance.state.set('insertTarget', false)
      templateInstance.state.set('listMode', false)
      templateInstance.$('.afDocumentsFormModal').modal('hide')
    })
  },
  'submit #afDocumentsExternalDocEditForm' (event, templateInstance) {
    event.preventDefault()

    const updateDoc = formIsValid(extSchema, 'afDocumentsExternalDocEditForm', true)
    if (!updateDoc) return

    const editTarget = templateInstance.state.get('editTarget')
    templateInstance.callMethod(MethodNames.update, { _id: editTarget._id, modifier: updateDoc }, () => {
      templateInstance.state.set('editTarget', null)
      templateInstance.state.set('updated', true)
      templateInstance.$('.afDocumentsFormModal').modal('hide')
    })
  }
})
