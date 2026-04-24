export class Item {
    private description: string;
    private completed: boolean;

    constructor(description: string, completed: boolean = false) {
        this.description = description;
        this.completed = completed;
    }

    updateDescription(newDescription: string) {
        this.description = newDescription;
    }

    markAsCompleted() {
        this.completed = true;
    }

    markAsPending() {
        this.completed = false;
    }

    isCompleted() {
        return this.completed;
    }

    toJSON() {
        return {
            description: this.description,
            completed: this.completed
        };
    }
}

export class ToDo {
    private filepath: string;
    private items: Promise<Item[]>;

    constructor(filepath: string) {
        this.filepath = filepath;
        this.items = this.loadFromFile();
    }

    private async loadFromFile() {
        const file = Bun.file(this.filepath);

        if (!(await file.exists())) {
            return [];
        }

        const data = await file.text();

        return JSON.parse(data).map(
            (itemData: any) => new Item(itemData.description, itemData.completed)
        );
    }

    private async saveToFile() {
        try {
            const items = await this.items;
            const file = Bun.file(this.filepath);
            const data = JSON.stringify(items, null, 2);
            await Bun.write(file, data);
        } catch (error) {
            console.error("Erro ao salvar:", error);
        }
    }

    async addItem(item: Item) {
        const items = await this.items;
        items.push(item);
        await this.saveToFile();
    }

    async getItems() {
        return await this.items;
    }

    async updateItem(index: number, newItem: Item) {
        const items = await this.items;

        if (index < 0 || index >= items.length) {
            throw new Error("Index fora do limite");
        }

        items[index] = newItem;
        await this.saveToFile();
    }

    async removeItem(index: number) {
        const items = await this.items;

        if (index < 0 || index >= items.length) {
            throw new Error("Index fora do limite");
        }

        items.splice(index, 1);
        await this.saveToFile();
    }

    async markItemAsCompleted(index: number) {
        const items = await this.items;

        if (index < 0 || index >= items.length) {
            throw new Error("Index fora do limite");
        }

        items[index].markAsCompleted();
        await this.saveToFile();
    }

    async markItemAsPending(index: number) {
        const items = await this.items;

        if (index < 0 || index >= items.length) {
            throw new Error("Index fora do limite");
        }

        items[index].markAsPending();
        await this.saveToFile();
    }

    async findItemByDescription(description: string): Promise<Item[]> {
        const items = await this.items;
        return items.filter(
            (item) => item.toJSON().description.includes(description)
        );
    }
}