const router = require("express").Router();
const bycrypt = require("bcryptjs");
const secrets = require("./secrets");
const jwt = require("jsonwebtoken");
const Users = require('../users/user-model.js');

router.post("/register", (req, res) => {
  let user = req.body;
  const rounds = process.env.HASH_ROUNDS || 8;
  const hash = bycrypt.hashSync(user.password, rounds);
  user.password = hash;
  Users.addUser(user).then((newUser) => {
    res.status(201).json(newUser);
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({message: 'unexpected error in database '})});
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;
  console.log(username, password)
  Users.login(username)
  .then(([user]) => {
    console.log('this is inside the function',user)
    if(user && bycrypt.compareSync(password, user.password)){
      const token = tokenMaker(user);
      console.log(user.id)
      res.status(200).json({
        message: `welcome ${user.username}`, 
        token , 
        userId: user.id})
    }else{
      res.status(404).json({message: 'invalid credientals'})
    }
  })
  .catch(err => res.status(500).json({message: 'unexpected error in database'}));
});

function tokenMaker(newUser) {
  const payload = {
    userId: newUser.id,
    userName: newUser.username,
  };

  const secret = secrets.jwtSecret;

  const options = {
    expiresIn: "1d",
  };

  return jwt.sign(payload, secret, options);
}

module.exports = router;
