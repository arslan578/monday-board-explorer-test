# Lupapps Developer Home Assignment

### 🚀 Quick Start

Before you begin, make sure you have the following installed on your machine:

- Docker Desktop: https://www.docker.com/products/docker-desktop
- Yarn: https://classic.yarnpkg.com/en/docs/install

> ⚠️ This project uses `yarn`. If you don’t have it installed, you can install it globally using:
> `npm install -g yarn`

---

### ✅ Your Tasks

You will use the monday.com GraphQL API to complete the following tasks. 
You are expected to find the relevant queries yourself using the API documentation:
👉 https://developer.monday.com/api-reference/reference/boards

1. **Fetch All Boards**  
   Retrieve the list of boards in your monday.com account and print their names and IDs.

2. **Fetch All Items from a Specific Board**  
   Select one board (manually or by ID) and retrieve all of its items. Print each item's name and ID.

3. **Fetch Linked Items from a connect_boards Column**
   Identify a column of type connect_boards on one of your boards.
   Use the API docs to understand how to fetch the related items from the connected board.
   Print the names and IDs of those linked items.


> Please write the GraphQL queries based on monday.com's documentation. I'm looking to evaluate your ability to read API docs, structure queries, and organize code.

---

### 📂 Project Structure

- `src/index.ts`: Main logic file
- `.env`: Place your monday token here
- `Dockerfile`, `docker-compose.yml`: Full local TypeScript dev environment

---

### 🧪 How to Run

1. Copy `.env.example` to `.env`
2. Paste your monday.com token into the `.env` file
3. Run the environment:
```bash
docker-compose up
```

---

### 📌 Output Example

Expected console output:
```
Board ID: 123456 | Board Name: Project Board
Item ID: 654321 | Item Name: Design Task
Connected Item ID: 789012 | Connected Item Name: Client Brief
```

---

### 💡 Notes

- Use TypeScript only
- Avoid using `any` — define types clearly
- Use async/await with error handling
- Structure your code professionally

Good luck!
