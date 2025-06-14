import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface Board {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
}

interface Column {
  id: string;
  title: string;
  type: string;
}


interface BoardsResponse {
  data: {
    boards: Board[];
  };
}

interface ItemsResponse {
  data: {
    boards: Array<{
      items_page: {
        items: Item[];
      };
    }>;
  };
}

interface ColumnsResponse {
  data: {
    boards: Array<{
      columns: Column[];
    }>;
  };
}

class MondayClient {
  private apiUrl = 'https://api.monday.com/v2';
  private headers: Record<string, string>;

  constructor(apiToken: string) {
    this.headers = {
      'Authorization': apiToken,
      'Content-Type': 'application/json',
    };
  }

  private async query<T>(graphql: string): Promise<T> {
    const response = await axios.post(this.apiUrl, { query: graphql }, { headers: this.headers });
    
    if (response.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
    }
    
    return response.data;
  }

  async getBoards(): Promise<Board[]> {
    const graphql = `
      query {
        boards {
          id
          name
        }
      }
    `;

    const response = await this.query<BoardsResponse>(graphql);
    return response.data.boards;
  }

  async getItems(boardId: string): Promise<Item[]> {
    const graphql = `
      query {
        boards(ids: [${boardId}]) {
          items_page {
            items {
              id
              name
            }
          }
        }
      }
    `;

    const response = await this.query<ItemsResponse>(graphql);
    return response.data.boards[0]?.items_page?.items || [];
  }

  async getColumns(boardId: string): Promise<Column[]> {
    const graphql = `
      query {
        boards(ids: [${boardId}]) {
          columns {
            id
            title
            type
          }
        }
      }
    `;

    const response = await this.query<ColumnsResponse>(graphql);
    return response.data.boards[0]?.columns || [];
  }
}

async function run() {
  const token = process.env.MONDAY_API_TOKEN;
  
  if (!token) {
    console.error('Missing MONDAY_API_TOKEN');
    process.exit(1);
  }

  const client = new MondayClient(token);

  try {
    const boards = await client.getBoards();
    
    boards.forEach(board => {
      console.log(`Board ID: ${board.id} | Board Name: ${board.name}`);
    });

    for (const board of boards) {
      console.log(`Board ID: ${board.id} | Board Name: ${board.name}`);
      
      const items = await client.getItems(board.id);
      
      items.forEach(item => {
        console.log(`Item ID: ${item.id} | Item Name: ${item.name}`);
      });


    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
