const app = require('../src/index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const db = require('../src/dbClient')

chai.use(chaiHttp)

describe('User REST API', () => {
  beforeEach(() => {
    // Clean DB before each test
    db.flushdb()
  })

  after(() => {
    app.close()
    db.quit()
  })

  describe('POST /user', () => {
    it('create a new user', (done) => {
      const user = {
        username: 'sergkudinov',
        firstname: 'Sergei',
        lastname: 'Kudinov'
      }

      chai.request(app)
        .post('/user')
        .send(user)
        .then((res) => {
          chai.expect(res).to.have.status(201)
          chai.expect(res.body.status).to.equal('success')
          chai.expect(res).to.be.json
          done()
        })
        .catch((err) => {
          throw err
        })
    })

    it('pass wrong parameters', (done) => {
      const user = {
        firstname: 'Sergei',
        lastname: 'Kudinov'
      }

      chai.request(app)
        .post('/user')
        .send(user)
        .then((res) => {
          chai.expect(res).to.have.status(400)
          chai.expect(res.body.status).to.equal('error')
          chai.expect(res).to.be.json
          done()
        })
        .catch((err) => {
          throw err
        })
    })
  })

  // TODO Create test for the get method
  describe('GET /user', () => {
    it('get a user by username', (done) => {
      const user = {
        username: 'jane',
        firstname: 'Jane',
        lastname: 'Doe'
      }

      // d’abord créer l’utilisateur
      chai.request(app)
        .post('/user')
        .send(user)
        .then((res) => {
          chai.expect(res).to.have.status(201)
          // ensuite tester GET
          chai.request(app)
            .get('/user/jane')
            .then((res) => {
              chai.expect(res).to.have.status(200)
              chai.expect(res.body.status).to.equal('success')
              chai.expect(res.body.msg).to.deep.include(user)
              done()
            })
            .catch((err) => { throw err })
        })
        .catch((err) => { throw err })
    })

    it('cannot get a user when it does not exist', (done) => {
      chai.request(app)
        .get('/user/ghost')
        .then((res) => {
          chai.expect(res).to.have.status(404)
          chai.expect(res.body.status).to.equal('error')
          done()
        })
        .catch((err) => { throw err })
    })
  })
})
