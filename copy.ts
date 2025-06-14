import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// TypeScript interfaces for Monday.com API responses
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

interface LinkedItem {
  id: string;
  name: string;
}

interface ColumnValue {
  id: string;
  type: string;
  value?: string;
  linked_items?: LinkedItem[];
}

// API Response interfaces
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

interface ConnectedItemsResponse {
  data: {
    boards: Array<{
      items_page: {
        items: Array<{
          column_values: ColumnValue[];
        }>;
      };
    }>;
  };
}

class MondayClient {
  private readonly apiUrl = 'https://api.monday.com/v2';
  private readonly headers: Record<string, string>;

  constructor(apiToken: string) {
    this.headers = {
      'Authorization': apiToken,
      'Content-Type': 'application/json',
    };
  }

  private async executeQuery<T>(query: string): Promise<T> {
    try {
      const response = await axios.post(
        this.apiUrl,
        { query },
        { headers: this.headers }
      );

      if (response.data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Request failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Task 1: Fetch all boards
  async getAllBoards(): Promise<Board[]> {
    const query = `
      query {
        boards {
          id
          name
        }
      }
    `;

    const response = await this.executeQuery<BoardsResponse>(query);
    return response.data.boards;
  }

  // Task 2: Fetch all items from a specific board
  async getBoardItems(boardId: string): Promise<Item[]> {
    const query = `
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

    const response = await this.executeQuery<ItemsResponse>(query);
    return response.data.boards[0]?.items_page?.items || [];
  }

  // Helper: Get board columns to find connect_boards columns
  async getBoardColumns(boardId: string): Promise<Column[]> {
    const query = `
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

    const response = await this.executeQuery<ColumnsResponse>(query);
    return response.data.boards[0]?.columns || [];
  }

  // Task 3: Fetch connected items from connect_boards column
  async getConnectedItems(boardId: string, columnId: string): Promise<LinkedItem[]> {
    const query = `
      query {
        boards(ids: [${boardId}]) {
          items_page {
            items {
              column_values(ids: ["${columnId}"]) {
                id
                type
                ... on BoardRelationValue {
                  linked_items {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.executeQuery<ConnectedItemsResponse>(query);
    const connectedItems: LinkedItem[] = [];

    response.data.boards[0]?.items_page?.items.forEach(item => {
      item.column_values.forEach(columnValue => {
        if (columnValue.linked_items) {
          connectedItems.push(...columnValue.linked_items);
        }
      });
    });

    return connectedItems;
  }
}

async function main(): Promise<void> {
  const apiToken = process.env.MONDAY_API_TOKEN;

  if (!apiToken) {
    console.error('Error: MONDAY_API_TOKEN not found in environment variables');
    process.exit(1);
  }

  const client = new MondayClient(apiToken);

  try {
    // Task 1: Fetch all boards
    const boards = await client.getAllBoards();
    
    boards.forEach(board => {
      console.log(`Board ID: ${board.id} | Board Name: ${board.name}`);
    });

    // Task 2: Fetch all items from the first board
    if (boards.length > 0) {
      const firstBoard = boards[0];
      const items = await client.getBoardItems(firstBoard.id);
      
      items.forEach(item => {
        console.log(`Item ID: ${item.id} | Item Name: ${item.name}`);
      });

      // Task 3: Fetch connected items from connect_boards columns
      const columns = await client.getBoardColumns(firstBoard.id);
      const connectBoardsColumns = columns.filter(column => column.type === 'board-relation');

      for (const column of connectBoardsColumns) {
        const connectedItems = await client.getConnectedItems(firstBoard.id, column.id);
        
        connectedItems.forEach(connectedItem => {
          console.log(`Connected Item ID: ${connectedItem.id} | Connected Item Name: ${connectedItem.name}`);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
