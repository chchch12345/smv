# error-log-file
a package to log errors directly to a error.log file with helpers

## usage
```javascript
const log = require('error-log-file')

await log('something went wrong')

// Optionnal arguments
await log('there was an error', {fileName: 'error.txt'})
await log('there was an error', {date: new Date('2012')})

// Output sample
// [2018-12-19|15-54-44] a very useful error message log 
```