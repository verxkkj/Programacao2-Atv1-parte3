import todo from "./core.ts";

const cache = new Map<string, Response>();

const server = Bun.serve({
  port: 3000,

  routes: {    
    "/api/todo": {
      GET: async () => {
        const items = await todo.getItems()
        return Response.json(items)
      },

      POST: async (req) => {
        const data = await req.json() as any;
        const item = data.item || null;
        if (!item)
          return Response.json('Por favor, forneça um item para adicionar.', { status: 400 });
        await todo.addItem(item);
        return Response.json(data);
      },
    },

    "/api/todo/:index": {
      PUT: async (req) => {
        const index = parseInt(req.params.index);
        if (isNaN(index))
          return Response.json('Índice inválido. um número inteiro é esperado.', { status: 400 });
        const data = await req.json() as any;
        const newItem = data.newItem || null;
        if (!newItem)
          return Response.json('Por favor, forneça um novo item para atualizar.', { status: 400 });
        try {
          await todo.updateItem(index, newItem);
          return Response.json(`Item no índice ${index} atualizado para "${newItem}".`);
        } catch (error: any) {
          return Response.json(error.message, { status: 400 });
        }
      },

      DELETE: async (req) => {
        const index = parseInt(req.params.index);
        if (isNaN(index))
          return Response.json('Índice inválido.', { status: 400 });
        try {
          await todo.removeItem(index);
          return Response.json(`Item no índice ${index} removido com sucesso.`);
        } catch (error: any) {
          return Response.json(error.message, { status: 400 });
        }
      },
    },
  },

  async fetch(req) {
    if (cache.has(req.url)) {
      const response = cache.get(req.url)!;
      return response.clone() as Response; 
    }
    const url = new URL(req.url);
    const path = url.pathname;
    const filePath = (path === '/')
      ? './public/index.html'
      : `./public${path}`;
    const file = Bun.file(filePath);
 if (await file.exists()) {
      const buffer = await file.arrayBuffer(); 
      const response = new Response(buffer, { headers: { "Content-Type": file.type } }); 
      return response; 
    }
    return new Response(`Not Found`, { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);