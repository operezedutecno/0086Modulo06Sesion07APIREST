const http = require("http");
const url = require("url");
const { v4: uuidv4 } = require('uuid');
const { readFileSync, writeFileSync } = require("fs")
const port = 3000;


const dataAnimales = `${__dirname}/data/animales.txt`

http.createServer((req, res) => {
    const metodo = req.method;
    const urlParsed = url.parse(req.url, true)
    const pathName = urlParsed.pathname

    // console.log(urlParsed);

    if(pathName == "/animales") {
        if(metodo == "GET") {
            const params = urlParsed.query
            res.end("Listado de animales")
        } else if(metodo == "POST") {
            let body="";
            req.on("data", (chunk) => {
                body += chunk.toString()
            })

            req.on("end", () => {
                body = JSON.parse(body);
                const contentString = readFileSync(dataAnimales, "utf-8");
                const contentJS = JSON.parse(contentString);

                const animal = {
                    id: uuidv4(),
                    nombre: body.nombre,
                    edad: body.edad,
                    especie: body.especie,
                    habitat: body.habitat
                }

                contentJS.push(animal);
                writeFileSync(dataAnimales, JSON.stringify(contentJS),"utf-8");

                res.setHeader("Content-Type","application/json");
                res.writeHead(201);
                res.end(JSON.stringify({message: "Registro exitoso", data: animal}));
            })
            
        } else if(metodo == "PUT") {
            res.end("Editar de animales")
        } else if(metodo == "DELETE") {
            res.end("Eliminar de animales")
        }
    }

    

    // res.end("Llamado a nuestra API "+metodo)

}).listen(port, () => {
    console.log(`Aplicación ejecutandose por el puerto ${port}`);
})