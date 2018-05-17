import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';

import './list.html';

Template.list.onCreated(function () {
  const instance = this;
  instance.state = new ReactiveDict();
  instance.autorun(function () {
    instance.state.set('loadComplete', false);
    const data = Template.currentData();
    instance.state.set('collection', data.collection);
    instance.state.set('loadComplete', true);
  });
});

Template.list.helpers({
  documents() {
    const collectionName = Template.instance().state.get('collection');
    if (!collectionName) return null;
    return Mongo.Collection.get(collectionName).find();
  },
  showInsert() {
    return Template.instance().state.get('showInsert');
  },
  loadComplete() {
    return Template.instance().state.get('loadComplete');
  },
  collectionSchema() {
    const collectionName = Template.instance().state.get('collection');
    if (!collectionName) return null;
    return Mongo.Collection.get(collectionName).schema;
  }
});

Template.main.events({

  'click .edit-entry'(event) {
    event.preventDefault();
    const target = $(event.currentTarget).attr('data-target');
    Session.set("editTarget", target);
  },

});