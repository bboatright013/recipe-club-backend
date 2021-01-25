/** Server for my recipe web app. */


const app = require("./app");
const cors = require('cors');

app.use(cors());

app.listen(process.env.PORT || 3001, () => {

    console.log(`Server starting`);
  }
});
