const fs = require('fs');

module.exports = (file, json) => {
  file && json && fs.writeFile(file, JSON.stringify(json, null, 2), (err) => {
    if (err) throw err;
    console.log('\n> Token file written:', file);
  });
};
