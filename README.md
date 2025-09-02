# MedRotate - Frontend

**A medical-student clinical notes web application designed for medical students to efficiently take and organize notes during their ward rotations.**

Live Demo: https://josephs2025-bot.github.io/MedRotate/ (*Replace with your actual GitHub Pages URL*)

## 👋 Welcome to My Project!

Hello! I'm Joseph, a beginner developer embarking on my journey into full-stack web development. MedRotate is my first significant project, built as part of my learning path. It's been an incredible challenge, filled with moments of frustration and immense satisfaction. This README documents not just what the app does, but the process and learning behind it.

## 🚀 Overview

MedRotate is the frontend for a Progressive Web App (PWA) that allows medical students to:
*   Create different folders for various medical rotations (e.g., Cardiology, Surgery).
*   Take quick, date-stamped notes within each rotation.
*   Access their notes offline using the browser's local storage.
*   Enjoy a clean, intuitive, and medically-themed user interface.

The frontend is currently deployed on **GitHub Pages** and is designed to connect to a separate backend API.

## 🛠️ Tech Stack

As a beginner, I chose technologies that are widely supported and have great learning resources:

*   **HTML5:** For the semantic structure of the application.
*   **CSS3:** For styling, with modern features like Flexbox, CSS Grid, and Variables (custom properties).
*   **Vanilla JavaScript (ES6+):** For all the application logic, DOM manipulation, and API calls.
*   **Font Awesome:** For the intuitive medical icons throughout the UI.
*   **GitHub Pages:** For simple and free static site hosting.

## ✨ Features Implemented

*   **Responsive UI:** A clean, responsive layout that works on desktop and mobile.
*   **Rotation Management:** A sidebar to view, select, and create different clinical rotations.
*   **Note Taking Modal:** A polished modal popup to write and save new notes.
*   **Local Storage:** All data is currently persisted in the browser's local storage, allowing for full offline functionality.
*   **Date-Stamping:** Every note is automatically tagged with the current date.

## 🧪 Development Process & Learning Journey

This project was my classroom. Here's how I built it:

1.  **Planning & Design:** I started by sketching the UI on paper and writing down the core features. I knew I wanted a sidebar for rotations and a main content area for notes.
2.  **Static Structure (HTML):** I built the basic skeleton first: the header, the sidebar list, the note cards, and the modals.
3.  **Making it Pretty (CSS):** This was the most fun part. I spent time choosing a color scheme that felt professional yet modern. I learned a ton about CSS Grid for the note cards and Flexbox for aligning elements. Getting the modals to look right was a particular challenge!
4.  **Breathing Life into it (JavaScript):** This was the biggest hurdle. I started by just using `console.log` to make sure buttons were clicking. Then I built the functions to:
    *   Save and load data from `localStorage`.
    *   Dynamically render rotations and notes to the DOM.
    *   Open and close the modals.
5.  **The Great Hurdle - The Save Button:** For a long time, my save button didn't work. It was a humbling experience. Through debugging in the browser console, I learned about event listeners and how to prevent default form behaviors. Fixing this single issue taught me more about JavaScript than any tutorial.
6.  **Deployment:** Pushing the code to GitHub and enabling GitHub Pages was surprisingly straightforward. Seeing my app live on the internet for the first time was an amazing feeling.

## ⚠️ Challenges Faced

*   **The Dreaded Save Button:** As mentioned, this was my biggest initial roadblock. It taught me the importance of careful debugging and understanding event propagation.
*   **State Management:** Keeping track of the "current rotation" and which notes to display was tricky with just vanilla JS. It made me appreciate why frameworks like React exist.
*   **Async Operations:** Initially, I didn't understand why my API calls (which I added later) were returning `undefined`. I had to learn about Promises and the `async/await` syntax, which was a game-changer.
*   **CSS Specificity:** Sometimes my styles wouldn't apply because of conflicting CSS rules. I learned to use the browser's inspector tool to diagnose these issues.

## 🔮 Next Steps & Future Improvements

*   **Backend Integration:** The next major step is to connect this frontend to my Python/Flask backend and replace local storage with a real database (PostgreSQL).
*   **Authentication:** Add user login and registration so that notes are private to each user.
*   **Rich Text Editing:** Allow for formatting text (bold, bullets) in notes.
*   **Search Functionality:** Let users search through their notes.
*   **PWA Enhancements:** Make it installable on phones and computers for a truly app-like experience.

I have to acknowledge that this has been such a task, with more moments of frustration than there has been satisfaction. As a dedicated medic and a beginner in tech, I like to cerebrate my small winnings as I brace to face the bigger challenges, seeing them as opportunites of growth. The ultimate goal ramains venturing into healthtech, advancing healthcare delivery through technological solutions. I will always come back to this project, to make it better, solve what is not working, and give efforts to my missional mandate. 


*This project is a testament to the fact that with persistence and a willingness to learn, beginners can build something real and impactful. Thank you for checking it out!*
