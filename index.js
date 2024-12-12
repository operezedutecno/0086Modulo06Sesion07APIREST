const http = require("http");
const url = require("url");
const { v4: uuidv4 } = require('uuid');
const { readFileSync, writeFileSync } = require("fs");
const PORT = process.env.PORT || 3000;

// Ubicación del archivo de persistencia.
const dataAnimales = `${__dirname}/data/animales.txt`

const servidor = http.createServer((req, res) => {
    const metodo = req.method;
    const urlParsed = url.parse(req.url, true)
    const pathName = urlParsed.pathname

    // console.log(urlParsed);

    if(pathName == "/animales") {
        if(metodo == "GET") {
            res.setHeader("Content-Type","application/json");
            const params = urlParsed.query;
            // console.log(params);
            const contentString = readFileSync(dataAnimales, "utf-8");
            let contentJS = JSON.parse(contentString);
            contentJS = contentJS.filter( animal => {
                if(params.habitat && animal.habitat.toUpperCase() == params.habitat.toUpperCase()) {
                    return true
                }

                if(params.especie && animal.especie.toUpperCase() == params.especie.toUpperCase()) {
                    return true
                }

                if(!params.habitat && !params.especie) {
                    return true
                }

                return false
            })
            res.end(JSON.stringify({ message: "Listado de animales", data: contentJS }))
        } else if(metodo == "POST") {
            let body="";
            req.on("data", (chunk) => {
                body += chunk.toString()
            })

            req.on("end", () => {
                res.setHeader("Content-Type","application/json");
                body = JSON.parse(body);
                const contentString = readFileSync(dataAnimales, "utf-8");
                const contentJS = JSON.parse(contentString);

                const encontrado = contentJS.some(animal => {
                    return String(animal.especie).toLowerCase() == String(body.especie).toLowerCase() &&
                        String(animal.nombre).toLowerCase() == String(body.nombre).toLowerCase()
                })

                if(encontrado) {
                    res.writeHead(409)
                    return res.end(JSON.stringify({ message: "No es posible registrar, el animal ya existe en nuestros registros"}))
                }

                const animal = {
                    id: uuidv4(),
                    nombre: body.nombre,
                    edad: body.edad,
                    especie: body.especie,
                    habitat: body.habitat
                }

                contentJS.push(animal);
                writeFileSync(dataAnimales, JSON.stringify(contentJS),"utf-8");

                res.writeHead(201);
                res.end(JSON.stringify({message: "Registro exitoso", data: animal}));
            })
            
        } else if(metodo == "PUT") {
            res.setHeader("Content-Type", "application/json");
            let body = "";
            req.on("data", (parte) => {
                body += parte.toString()
            })

            req.on("end", () => {
                body = JSON.parse(body);
                console.log(body);
                const contentString = readFileSync(dataAnimales, "utf-8");
                let contentJS = JSON.parse(contentString);

                let busqueda = contentJS.findIndex(animal => animal.id == body.id)
                if(busqueda != -1) {

                    const encontrado = contentJS.some(animal => {
                        return String(animal.especie).toLowerCase() == String(body.especie).toLowerCase() &&
                        String(animal.nombre).toLowerCase() == String(body.nombre).toLowerCase() &&
                        animal.id != body.id
                    })

                    if(encontrado) {
                        res.writeHead(409);
                        return res.end(JSON.stringify({ message: "Ya existe otro animal con el mismo nombre y especie"}))
                    }

                    contentJS[busqueda] = { ...contentJS[busqueda], ...body }
                    writeFileSync(dataAnimales, JSON.stringify(contentJS), "utf-8")
                    return res.end(JSON.stringify({ message: "Animal modificado con éxito", data: contentJS[busqueda]}))
                }

                res.writeHead(404);
                return res.end(JSON.stringify({ message: "Id de animal no encontrado"}))
            })
            
        } else if(metodo == "DELETE") {
            res.setHeader("Content-Type", "application/json");
            const params = urlParsed.query
            const contentString = readFileSync(dataAnimales, "utf-8");
            let contentJS = JSON.parse(contentString);

            let busqueda = contentJS.findIndex(animal => animal.id == params.id)
            if(busqueda != -1) {
                const eliminado = contentJS.splice(busqueda, 1)
                writeFileSync(dataAnimales, JSON.stringify(contentJS), "utf-8")
                return res.end(JSON.stringify({ message: "Animal eliminado con éxito", data: eliminado}))
            }

            res.writeHead(404);
            return res.end(JSON.stringify({ message: "Id de animal no encontrado"}))
        }
    }

    

    res.end("Llamado a nuestra API "+metodo)

}).listen(port, () => {
    console.log(`Aplicación ejecutandose por el puerto ${port}`);
})

module.exports = { servidor, port }