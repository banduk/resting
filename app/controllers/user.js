module.exports = {
  *authenticate(next) {
    this.responseData = {
      user: {
        name: 'banduk',
        id: this.request.body.user.id,
      },
      status: 200,
    }
    yield next
  },
}
