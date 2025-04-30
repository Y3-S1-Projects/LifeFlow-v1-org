# Blood Donation Application

## Overview

This is a comprehensive blood donation application designed to connect blood donors with individuals and organizations in need. The application facilitates the process of finding blood donation camps, scheduling appointments, managing user profiles, and providing educational resources about blood donation. It consists of a robust backend built with Node.js and a user-friendly frontend developed with React and Next.js.

## Features

### Core Features

-   **User Registration and Authentication:** Secure registration and login for donors, organizers, and administrators.
-   **Donor Management:** Users can create and manage their profiles, including blood type, medical history, and donation history.
-   **Camp Management:** Organizers can create, update, and manage blood donation camps.
-   **Appointment Scheduling:** Donors can schedule appointments at available blood donation camps.
-   **Search Functionality:** Users can search for nearby blood donation camps.
- **Contact**: Users can contact the admins through a contact us form
- **FAQ**: Users can find answers to frequently asked questions on the faq page
- **Chatbot**: Users can interact with a chatbot to find info regarding blood donation
-   **Notifications:** System notifications for upcoming appointments, new camp announcements, and other important events.
- **Admin Management**: Admins can manage users, organizers, camps and more
- **Organizer Management**: Organizers can manage camps, view donations, and more

### Admin Features

-   **Dashboard:** Overview of all the application activities.
-   **User Management:** Add, edit, or remove users.
-   **Organizer Management:** Review and manage blood drive organizers.
-   **Camp Management:** Approve and manage blood donation camps.
- **Report Generation**: Admins can generate reports

### Organizer Features

- **Dashboard**: View all relevant information
- **Camp Management**: Add, edit and delete camps.
-   **Profile Management:** Organizers can manage their profiles.
-   **Verify Users**: Verify users who register as organizers.

### Donor Features

- **Dashboard**: View all relevant information for donors
-   **Profile Management:** Donors can manage their profiles.
-   **Appointment Management:** Donors can view and manage their appointments.
- **Eligibility**: Donors can take the eligibility form to determine if they are eligible to donate.
- **Donation Tracking**: Donors can keep track of their donations
- **Self-Assessment**: Donors can assess their self
- **Achievements**: Donors can view the achievements that they have earned.

## Technologies Used

### Backend

-   **Node.js:** JavaScript runtime environment for server-side development.
-   **Express.js:** Web application framework for Node.js, used to build APIs and handle routing.
-   **MongoDB:** NoSQL database for storing application data.
- **Multer:** Middleware for handling multipart/form-data
- **Nodemailer**: Send emails to users
-   **Mongoose:** MongoDB object modeling tool designed to work in an asynchronous environment.
-   **JSON Web Tokens (JWT):** For secure authentication and authorization.
- **Bcrypt**: For hashing user passwords

### Frontend

-   **React:** JavaScript library for building user interfaces.
-   **Next.js:** React framework for building server-rendered and statically generated web applications.
-   **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **Radix UI**: For the implementation of UI elements
-   **Axios:** Promise-based HTTP client for making API requests.
-   **React Hook Form:** For managing form states and validation.
- **Zod**: For data validation
- **Sonner**: For creating notifications
- **React-Calendar**: For implementing the calendar in the UI

## Setup and Installation

### Backend Setup

1.  **Clone the repository:**
```
bash
    git clone https://github.com/Y3-S1-Projects/LifeFlow-v1-org.git
    cd backend
    
```
2.  **Install dependencies:**
```
bash
    npm install
    
```
3.  **Environment Variables:**

    -   Create a `.env` file in the `backend` directory.
    -   Add the following environment variables:
```
        PORT=<port>
        MONGODB_URI=<mongodb-connection-string>
        JWT_SECRET=<jwt-secret>
        EMAIL_USER=<email-user>
        EMAIL_PASSWORD=<email-password>
        
```
4. **Run the application**
```
    npm run dev
    
```
### Frontend Setup

1.  **Navigate to the frontend directory:**
```
bash
    cd frontend
    
```
2.  **Install dependencies:**
```
bash
    npm install
    
```
3.  **Environment Variables:**
    -   Create a `.env.local` file in the `frontend` directory.
    - Add the following environment variable:
```
        NEXT_PUBLIC_API_URL=http://localhost:3000
    
```
4.  **Run the application:**
```
bash
    npm run dev
    
```
