const chai = require('chai');
const chaiHttp = require('chai-http');

const {
    app,
    runServer,
    closeServer
} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Recipes', function() {

    // start server before tests run
    before(function() {
        return runServer();
    });
    // close server after tests have run
    after(function() {
        return closeServer();
    });

    // test on GET call to api
    it('Should list recipes on GET', function() {
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.at.least(1);
                const expectedKeys = ['name', 'ingredients'];
                res.body.forEach(function(item) {
                    item.should.be.a('object');
                    item.should.include.keys(expectedKeys);
                });
            });
    });

    // test on POST call to api
    it('Should add a recipe on POST', function() {
        const newItem = {
            name: "coffee",
            ingredients: ["coffee beans", "water"]
        };
        return chai.request(app)
            .post('/recipes')
            .send(newItem)
            .then(function(res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('id', 'name', 'ingredients');
                res.body.id.should.not.be.null;
                res.body.should.deep.equal(Object.assign(newItem, {
                    id: res.body.id
                }));
            });
    });

    // test on PUT call to api
    it("Should update a recipe on PUT", function() {
        const updateData = {
            name: 'spiced coffee',
            ingredients: ["coffee", "water", "cinnamon"]
        };
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                updateData.id = res.body[0].id;

                return chai.request(app)
                    .put(`/recipes/${updateData.id}`)
                    .send(updateData);
            })
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.deep.equal(updateData);
            });
    });

    // test on DELETE call to api
    it('should delete a recipe on DELETE', function() {
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                return chai.request(app)
                    .delete(`/recipes/${res.body[0].id}`);
            })
            .then(function(res) {
                res.should.have.status(204);
            });
    });
});
