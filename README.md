# Student Companion

Student Companion is an all-in-one productivity tool designed for students to manage their academic life efficiently. This web application combines five essential features to help students stay organized, productive, and motivated.

## Features

### 1. Notes Manager
- Save text notes or upload PDF files by subject
- Edit and delete notes
- Search functionality for quick access

### 2. To-Do / Task List
- Create daily or subject-based tasks
- Add time-based reminders
- Mark tasks as complete

### 3. Attendance Tracker
- Track attendance per subject
- Calculate total attendance percentage
- Show warning if attendance is low

### 4. Motivational Quotes
- Display one new quote daily
- Allow users to save favorite quotes
- Load quotes from a public API or local data

### 5. Personal Expense Tracker
- Add and track daily expenses
- Categorize expenses (Food, Transport, Books, etc.)
- Show monthly totals and category-wise spending
- Display data using a pie chart

## Tech Stack

- **Frontend**: React.js
- **Styling**: Tailwind CSS
- **Authentication & Database**: Firebase (Auth + Firestore)
- **Charts**: Chart.js

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd student-companion
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password) and Firestore
   - Update the Firebase configuration in `src/firebase/config.js` with your project credentials

4. Start the development server:
   ```
   npm start
   ```

## Usage

1. Register a new account or login with your credentials
2. Navigate between features using the sidebar
3. Add, edit, or delete items in each feature section
4. Track your progress and stay organized!

## Project Structure

```
student-companion/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── attendance/     # Attendance tracker components
│   │   ├── expenses/       # Expense tracker components
│   │   ├── layout/         # Layout components (Navbar, Sidebar)
│   │   ├── notes/          # Notes manager components
│   │   ├── quotes/         # Motivational quotes components
│   │   ├── tasks/          # Task list components
│   │   └── Dashboard.js    # Main dashboard component
│   ├── firebase/           # Firebase configuration
│   ├── App.js              # Main application component
│   ├── index.js            # Entry point
│   └── index.css           # Global styles with Tailwind
├── package.json
├── tailwind.config.js
└── README.md
```

## Customization

- Modify the Tailwind configuration in `tailwind.config.js` to customize the theme colors
- Add or modify categories in the Expense Tracker
- Customize the local quotes data in the Quotes component

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React.js](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Chart.js](https://www.chartjs.org/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Quotable API](https://github.com/lukePeavey/quotable) for motivational quotes
