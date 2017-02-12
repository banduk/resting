const Serializer = require('./serializer')

class User extends Serializer {
  authenticate(responseData) {
    return {
      body: { name: responseData.user.name },
      status: responseData.status,
    }
  }
}

module.exports = User
