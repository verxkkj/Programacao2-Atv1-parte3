import { ToDo, Item } from "./core";

const filepath = "./lista.json";
const todo = new ToDo(filepath);
const port = 3000;

const server = Bun.serve({
    port: port,

    async fetch(request: Request) {
        const url = new URL(request.url);
        const method = request.method;
        const pathname = url.pathname;
        const searchParams = url.searchParams;

        console.log(`${method} ${pathname}`);


        if (pathname === "/items" && method === "GET") {
            const items = await todo.getItems();


            const page = parseInt(searchParams.get("page") || "1");
            const limit = parseInt(searchParams.get("limit") || "10");

            const start = (page - 1) * limit;
            const end = start + limit;

            const paginated = items.slice(start, end);

            return new Response(JSON.stringify(paginated.map(i => i.toJSON())), {
                headers: { "Content-Type": "application/json" }
            });
        }


        if (pathname === "/items" && method === "POST") {
            try {
                const body = await request.json();
                const { description } = body;

                if (typeof description !== "string" || description.trim() === "") {
                    return new Response(JSON.stringify({ error: "Descrição inválida" }), { status: 400 });
                }

                const item = new Item(description);
                await todo.addItem(item);

                return new Response(JSON.stringify(item.toJSON()), { status: 201 });
            } catch {
                return new Response(JSON.stringify({ error: "Erro ao adicionar" }), { status: 500 });
            }
        }


        if (pathname === "/items" && method === "PUT") {
            try {
                const index = parseInt(searchParams.get("index") || "");

                if (isNaN(index)) {
                    return new Response(JSON.stringify({ error: "Índice inválido" }), { status: 400 });
                }

                const items = await todo.getItems();


                if (index < 0 || index >= items.length) {
                    return new Response(JSON.stringify({ error: "Item não existe" }), { status: 409 });
                }

                const body = await request.json();
                const { description } = body;

                if (typeof description !== "string" || description.trim() === "") {
                    return new Response(JSON.stringify({ error: "Descrição inválida" }), { status: 400 });
                }

                const item = new Item(description);
                await todo.updateItem(index, item);

                return new Response(JSON.stringify(item.toJSON()), { status: 200 });
            } catch {
                return new Response(JSON.stringify({ error: "Erro ao atualizar" }), { status: 500 });
            }
        }


        if (pathname === "/items" && method === "DELETE") {
            try {
                const index = parseInt(searchParams.get("index") || "");

                if (isNaN(index)) {
                    return new Response(JSON.stringify({ error: "Índice inválido" }), { status: 400 });
                }

                await todo.removeItem(index);

                return new Response(JSON.stringify({ message: "Removido" }), { status: 200 });
            } catch {
                return new Response(JSON.stringify({ error: "Erro ao remover" }), { status: 500 });
            }
        }

        if (pathname === "/items/search" && method === "GET") {
            const name = searchParams.get("name") || "";
            const items = await todo.getItems();

            const filtered = items.filter(item =>
                item.description.toLowerCase().includes(name.toLowerCase())
            );

            return new Response(JSON.stringify(filtered.map(i => i.toJSON())));
        }

        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }
});

console.log(`Servidor rodando em http://localhost:${port}`);