/** Server for my recipe web app. */


const app = require("./app");
const cors = require('cors');

app.use(cors());

app.listen(3001, () => {
  console.log(`Server starting on port 3001`);
});
