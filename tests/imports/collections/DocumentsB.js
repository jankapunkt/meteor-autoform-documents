import { Mongo } from 'meteor/mongo'

const methods = {
  get: { name: 'docsb.get' },
  insert: { name: 'docsb.insert' },
  update: { name: 'docsb.update' },
}

export const DocumentsB = {
  name: 'documentsb',
  label: 'Documents B',
  methods,
  schema: {
    title: String,
    description: String,
  },
  publication: 'docsb.all'
}

export const DocumentsBCollection = new Mongo.Collection(DocumentsB.name)
DocumentsBCollection.schema = DocumentsB.schema
