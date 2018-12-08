# meteor-autoform-documents
View documents, create new documents or update documents within your autoform.



## Installation

Install via

```bash
meteor add jkuester:autoform-documents
```

## Usage

The following example uses a `SimpleSchema` based schema that can be passed for example to a `quickForm`.
Consider the following collection:

```javascript
{
  doc: {
    // we will only store the id of the doc
    // to keep the database clean and tidy
    type: String,
    
    // you could justr display the name of the other collection
    label: 'Doc from another collection',
    
    autoform: {
      // required to load the template
      type: 'documents',
      
      // Methods are required to handle
      // the findOne, insert, update, remove
      // of the external collection without
      // coupling the collection to the template.
      // All methods work with the three examples below
      methods: {
        
        // example 1: get from synced client
        // note, there is a callback in case the doc is not
        // synced via subscription but retrieved e.g. by method
        get (docId, callback) {
          callback(null, SomeCollection.findOne(docId))
        },
        
        // example 2: externally call the method
        insert (insertDoc, callback) {
          Meteor.call('insertSomeDoc', insertDoc, callback)
        },
        
        // example 3: pass only the method name
        // and the method will be called from the template.
        // note, that the arguments which are passed to the
        // method are designed in accordance to the 
        // AutoForm.getFormValues insertDoc / updateDoc
        update: 'someUpdateMethodName',
      },
      
      // a schema of the other collection is required to
      // render to form for the external docs correctly
      schema: SomeCollection.schema,
      
      // provide a first option like for any other
      // select based component in AutoForm
      firstOption: () => i18n.get('form.selectOne'),
      
      // provide the list of selectable docs,
      // this example assumes, that there are fields
      // like title or description but you can choose any
      // values you like.
      options() {
        return SomeCollection
          .find()
          .fetch()
          .map(doc => ({
            value: doc._id,
            label: doc.title,
            description: doc.description
          }))
      },
      
      // you can configure appearance
      // and labeling of the submit button
      buttons: {
        insert: {
          classes: 'btn btn-success',
          label: () => i18n.get('actions.insert')
        },
        update: {
          classes: 'btn btn-primary',
          label: () => i18n.get('actions.update')
        }
      }
    }
  }
}
```

**Bootstrap Bug**

Note, that there is a [bootstrap bug for Modals that are placed within a list-group-item](https://github.com/twbs/bootstrap/issues/25206). 
The bug applies for this template, if it is used within an array (Autoform displays it using a list-group).
To prevent the bug, you need to add the following line to your application's CSS:

```css
.list-group-item, .list-group-item:hover{ z-index: auto; }
```

## Changelog

**1.4.0**

* invalid state handling added
* fixed schema and modal bugs when multiple instances of the template are used in a form
* submit button styling via schema added
* included formIsValid check for every submit
* fix borders for lists
* removed unused css
* added formIsValid helper to check form and add sticky validation errors
* methods args for template can now be meteor method names or external functions
* html layout bootstrap 4 compatible modal
* removed unused test file
* extracted autoform extension def into own file


**1.3.0**

* Set existing value (e.g. in updte form) before autorun so deselecting value is supported
* Optionally map a "description" field

## Lince 

MIT, See License File