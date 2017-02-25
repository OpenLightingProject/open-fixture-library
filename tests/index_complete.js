// for (let man of fs.readdirSync('../fixtures')) {
//   manDir = path.join('../fixtures', man);

//   // only directories
//   if (fs.statSync(manDir).isDirectory()) {
//     statusCodes['200'].push(man);

//     for (let fixture of fs.readdirSync(manDir)) {
//       const ext = path.extname(fixture);
//       if (ext == '.json') {
//         statusCodes['200'].push(path.join(man, path.basename(fixture, ext)));
//       }
//     }
//   }
// }