const chai = require("chai");
const chaiHttp = require("chai-http");
const { servidor, port } = require("./index.js")

chai.use(chaiHttp);


describe("Pruebas al servidor Node", () => {
    it("Creación del servidor", () => {
        chai.expect(servidor).to.be.a('object');
    })

    it("Definición y validación de puerto", () => {
        chai.expect(port).to.be.a("number");
    })
})


describe("Pruebas ruta listado de animales", () => {
    it("Respuesta HTTP 200", () => {
        chai.request(servidor).get("/animales").end((error, response) => {
            chai.expect(response).to.have.status(200);
        })
    })

    // it("Propiedad message en respuesta", () => {
    //     chai.request(servidor).get("/animales").end((error, response) => {
    //         const data = JSON.parse(response.text);
    //         chai.expect(data.message).to.equal("Listado de animales");
    //     })
    // })

    it("Propiedades correctas de respuesta", () => {
        chai.request(servidor).get("/animales").end((error, response) => {
            const data = JSON.parse(response.text);
            chai.expect(data.message).to.equal("Listado de animales");
            chai.expect(data.data).to.be.a("array");
        })
    })
})