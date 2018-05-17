import { Meteor } from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';

import SimpleSchema from 'simpl-schema';

import './autoform-documents.html';
import './autoform-documents.css';

// extend autoform with bpmn modeler
AutoForm.addInputType('documents', {
  template: 'afDocuments',
  valueOut() {
    return this.val();
  },
  valueIn(initialValue) {
    return initialValue;
  },
});

let extSchema;


Template.afDocuments.onCreated(function () {
  const instance = this;
  instance.state = new ReactiveDict();
  instance.state.set('listMode', false);
  instance.autorun(function () {

    const updated = instance.state.get('updated');
    if (updated) {
      instance.state.set('updated', false);
    }

    const { data } = instance;
    const { atts } = data;
    const { methods } = atts;

    extSchema = new SimpleSchema(atts.schema, {tracker: Tracker});
    instance.state.set('label', atts.label);
    instance.state.set('selectOptions', data.selectOptions);
    instance.state.set('dataSchemaKey', atts['data-schema-key']);
    instance.state.set('collectionName', atts.collection);
    instance.state.set('getDocMethodName', methods.get);
    instance.state.set('insertDocMethodName', methods.insert);
    instance.state.set('updateDocMethodName', methods.update);
    instance.state.set('firstOption', atts.firstOption);
    instance.state.set('loadComplete', true);
  });
});

Template.afDocuments.helpers({
  loadComplete() {
    return Template.instance().state.get('loadComplete');
  },
  label() {
    return Template.instance().state.get('label');
  },
  documents() {
    return Template.instance().state.get('selectOptions');
  },
  firstOption() {
    return Template.instance().state.get('firstOption');
  },
  dataSchemaKey() {
    return Template.instance().state.get('dataSchemaKey');
  },
  listMode() {
    return Template.instance().state.get('listMode');
  },
  isSelected(id) {
    return Template.instance().state.get('target') === id;
  },
  target() {
    return Template.instance().state.get('target');
  },
  targetLabel() {
    const target = Template.instance().state.get('target');
    const selectOptions = Template.instance().state.get('selectOptions');
    const doc = selectOptions.find(el => el.value === target);
    return doc && doc.label;
  },
  insertTarget() {
    return Template.instance().state.get('insertTarget');
  },
  editTarget() {
    return Template.instance().state.get('editTarget');
  },
  extSchema() {
    return extSchema;
  }
});

Template.afDocuments.events({
  'click .afDocumentsFirstOption'(event, templateInstance) {
    event.preventDefault();
    templateInstance.state.set('listMode', true);
  },
  'click .afDocumentsAddButton'(event, templateInstance) {
    event.preventDefault();
    templateInstance.state.set('editTarget', null);
    templateInstance.state.set('insertTarget', true);
    $('.afDocumentsFormModal').modal('show');
  },
  'click .afDocumentsUnselect'(event, templateInstance) {
    event.preventDefault();
    templateInstance.state.set('editTarget', null);
    templateInstance.state.set('insertTarget', false);
    templateInstance.state.set('target', null);
    $('#afDocumentHiddenInput').val(null);

  },
  'click .afDocumentsEditButton'(event, templateInstance) {
    event.preventDefault();
    event.stopPropagation();
    const target = $(event.currentTarget).attr('data-target');
    templateInstance.state.set('insertTarget', false);
    const getDocMethodName = templateInstance.state.get("getDocMethodName");
    Meteor.call(getDocMethodName, { _id: target }, (err, res) => {
      console.log(res);
      templateInstance.state.set('editTarget', res);
    });

    $('.afDocumentsFormModal').modal('show');
  },
  'click .afDocumentsEntry'(event, templateInstance) {
    event.preventDefault();
    const value = $(event.currentTarget).attr('data-target');
    $('#afDocumentHiddenInput').val(value);
    templateInstance.state.set('target',value);
    templateInstance.state.set('listMode', false);
  },
  'click .afDocumentsSelectButtons'(event, templateInstance) {
    event.preventDefault();
    const listMode = templateInstance.state.get('listMode');
    templateInstance.state.set('listMode', !listMode);
  },
  'submit #afDocumentsExternalDocInsertForm'(event, templateInstance) {
    event.preventDefault();
    const values = AutoForm.getFormValues('afDocumentsExternalDocInsertForm');
    const insertMethodName = templateInstance.state.get('insertDocMethodName');
    Meteor.call(insertMethodName, values.insertDoc, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      templateInstance.state.set('target', res);
      templateInstance.state.set('insertTarget', false);
      templateInstance.state.set('listMode', false);
      templateInstance.state.set('updated', true);
      $('.afDocumentsFormModal').modal('hide');
    });
  },
  'submit #afDocumentsExternalDocEditForm'(event, templateInstance) {
    event.preventDefault();
    const values = AutoForm.getFormValues('afDocumentsExternalDocEditForm');
    const editTarget = templateInstance.state.get('editTarget');
    const updateMethodName = templateInstance.state.get('updateDocMethodName');
    console.log(editTarget, values.updateDoc)
    Meteor.call(updateMethodName, {_id: editTarget._id, modifier:values.updateDoc }, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      templateInstance.state.set('editTarget', null);
      templateInstance.state.set('updated', true);
      $('.afDocumentsFormModal').modal('hide');
    });
  },
});
