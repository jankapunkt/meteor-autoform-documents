import { Mongo } from 'meteor/mongo';
import { DocumentsB, DocumentsBCollection } from "./DocumentsB";

export const DocumentsA = {
  name: 'documentsa',
  label: 'Documents A',
  schema: {
    title: String,
    description: String,
    reference: {
      type: String,
      label:"Reference",
      autoform: {
        type: 'documents',
        collection: DocumentsB.name,
        label: DocumentsB.label,
        labelField: 'title',
        firstOption: "select one",
        schema:DocumentsB.schema,
        methods: {
          get: DocumentsB.methods.get.name,
          insert: DocumentsB.methods.insert.name,
          update: DocumentsB.methods.update.name,
        },
        options() {
          const docs = DocumentsBCollection.find().fetch().map(el => {
            return { value: el._id, label: el.title }
          });
          return docs;
        }
      }
    }
  }
};

export const DocumentsACollection = new Mongo.Collection(DocumentsA.name);
DocumentsACollection.schema = DocumentsA.schema;