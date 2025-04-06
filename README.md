# Bajet Je

## Description
This project is a full-stack application consisting of a frontend built with Angular and a backend powered by Express and MongoDB. The frontend provides a responsive user interface styled with Tailwind CSS, while the backend handles API requests and database interactions using Mongoose.

## Installation

### Frontend
1. Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm start
    ```

### Backend

1. Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file in the `backend` directory and configure the `DB_URI` variable with your MongoDB connection string.
4. Start the backend server:
    ```bash
    node src/server.js
    ```

## Usage

1. Start both the frontend and backend servers.
2. Open your browser and navigate to `http://localhost:4200/` to access the frontend.
3. The backend server will be running on `http://localhost:3000/` (or the port specified in your configuration).

## Features

- **Frontend**:
  - Built with Angular 19.
  - Styled using Tailwind CSS.
  - Modular and scalable architecture.
- **Backend**:
  - Built with Express.js.
  - MongoDB integration using Mongoose.
  - Environment variable support with `dotenv`.

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b feature-name
    ```
3. Commit your changes:
    ```bash
    git commit -m "Add feature-name"
    ```
4. Push to your branch:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact Farith Adnan at [your-email@example.com].