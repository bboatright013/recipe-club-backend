/** Server for my recipe web app. */


const app = require("./app");
const cors = require('cors');

app.use(cors());

app.listen(process.env.PORT || 3001, () => {
  if(process.env.PORT){
    console.log(`Server starting on ${process.env.PORT}`)
  } else {
    console.log(`Server starting on port 3001`);
  }
});
