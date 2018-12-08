/* global AutoForm */

AutoForm.addInputType('documents', {
  template: 'afDocuments',
  valueOut () {
    return this.val()
  },
  valueIn (initialValue) {
    return initialValue
  }
})
