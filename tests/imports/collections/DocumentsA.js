import { Mongo } from 'meteor/mongo'
import { DocumentsB, DocumentsBCollection } from './DocumentsB'

export const DocumentsA = {
  name: 'documentsa',
  label: 'Documents A',
  schema: {
    title: String,
    description: String,
    reference: {
      type: String,
      label: 'Reference',
      autoform: {
        type: 'documents',
        collection: DocumentsB.name,
        label: DocumentsB.label,
        labelField: 'title',
        firstOption: 'select one',
        schema: DocumentsB.schema,
        methods: {
          get: DocumentsB.methods.get.name,
          insert: DocumentsB.methods.insert.name,
          update: DocumentsB.methods.update.name,
        },
        options () {
          return DocumentsBCollection
            .find({})
            .fetch()
            .map(el => ({
              value: el._id,
              label: el.title
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
        }
      }
    }
  },
  publication: 'docsa.all'
}

export const DocumentsACollection = new Mongo.Collection(DocumentsA.name)
DocumentsACollection.schema = DocumentsA.schema
