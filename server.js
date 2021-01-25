/** Server for my recipe web app. */


const app = require("./app");
const cors = require('cors');
const port = process.env.PORT || 3001; 
app.use(cors());

app.listen(port, () => {

    console.log(`Server starting on ${port}`);
  }
);
