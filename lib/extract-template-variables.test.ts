// Example test cases for the variable extraction utility

import { extractGoTemplateVariables, mergeVariablesWithJson } from '@/lib/extract-template-variables'

// Test HTML with Go template variables
const testHtml1 = `
<html>
  <body>
    <h1>{{.firstName}} {{.lastName}}</h1>
    <p>{{.formDay}}</p>
    {{range .items}}
      <div>{{.itemName}} - {{.itemPrice}}</div>
    {{end}}
    {{if .showDetails}}
      <div>{{.details}}</div>
    {{end}}
  </body>
</html>
`

// Test HTML with range unpacking syntax
const testHtml2 = `
<html>
  <body>
    {{range $i, $s := .natureOfBusiness}}
      <div>{{$i}} - {{$s}}</div>
    {{end}}
    {{range $key, $value := .orders}}
      <p>{{$key}}: {{$value}}</p>
    {{end}}
    {{range $item := .products}}
      <span>{{$item}}</span>
    {{end}}
  </body>
</html>
`
// Test extraction
const variables1 = extractGoTemplateVariables(testHtml1)
console.log('Extracted variables from testHtml1:', variables1)
// Expected: ['details', 'firstName', 'formDay', 'itemName', 'itemPrice', 'lastName', 'showDetails']

// Test extraction with range unpacking
const variables2 = extractGoTemplateVariables(testHtml2)
console.log('Extracted variables from testHtml2:', variables2)
// Expected: ['natureOfBusiness', 'orders', 'products']

// Test merging with existing JSON
const existingJson = JSON.stringify({ firstName: 'John', lastName: 'Doe' }, null, 2)
const merged = mergeVariablesWithJson(existingJson, variables1)
console.log('Merged variables:', merged)
// Expected: Should add all missing variables with empty string values

// Test with empty HTML
const variables3 = extractGoTemplateVariables('')
console.log('Variables from empty HTML:', variables3)
// Expected: []

// Test with no new variables
const allExistingJson = JSON.stringify({
  firstName: 'John',
  lastName: 'Doe',
  formDay: '2024-01-15',
  itemName: 'Item',
  itemPrice: '99.99',
  details: 'Details',
  showDetails: true,
}, null, 2)
const merged2 = mergeVariablesWithJson(allExistingJson, variables1)
console.log('Merged when all exist:', merged2 === allExistingJson)
// Expected: true (no new variables added)
