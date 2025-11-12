# OnHand

### CBAPDEV MCO Project

OnHand is a web application that connects customers with verified service providers for household and repair services.
It aims to make it easier to find trusted help for tasks like plumbing, electrical repair, and cleaning — all in one platform.

---

## Group Members

**Group #1 — CBAPDEV**

* Leigh Gwyneth M. Albo
* Lian Carlos M. Barte
* Rlsrain Mackenlhy G. Orcullo
* Allysa Luise Nelfa D. Villamor

---

## Tech Stack

**Frontend:** Handlebars (HBS), HTML, CSS, JavaScript
**Backend:** Node.js, Express.js
**Database:** MongoDB (via Mongoose)

---

## Features

* User authentication (login, registration, logout)
* User verification (valid ID, NBI clearance for providers)
* User profiles (bio, location, working hours, and ratings)
* Feed system (customers can post requests; providers can post offers)
* Chat system for negotiation between users
* Booking tracking (Ongoing, To Rate, Done)
* Rating and report system after transactions
* Search, filter, and sort (by location, service, urgency, etc.)

---

## Prerequisites

Before running the project, make sure you have the following installed:

* Node.js (version 18 or higher)
  Includes **npm**, the Node Package Manager used to install project dependencies.
* MongoDB Community Server

You can check if they’re installed by running:

```
node -v
npm -v
mongod --version
```

---

## Installation Guide

Run the following commands in your command prompt (CMD):

```
# 1. Clone the repository
git clone https://github.com/ulannn14/CBAPDEV_MCO_OnHand.git

# 2. Navigate into the folder
cd CBAPDEV_MCO_OnHand

# 3. Install dependencies
npm install
```

### (Optional) Seed the Database

To preload the database with sample data for testing, run:

```
node seedData.js
```

or to clear existing data and reinsert everything:

```
node seedData.js --reset
```

---

## Run the Application

Start the server using:

```
nodemon index.js
```

or if you don’t have nodemon installed:

```
node index.js
```

Once it starts successfully, you’ll see:

```
Connected to MongoDB at: mongodb://localhost:27017/onhand
app listening at port 9090
```

Then open your browser and go to:
**[http://localhost:9090/](http://localhost:9090/)**

---

## Notes

* The default port is **9090**.
* MongoDB runs locally at `mongodb://localhost:27017/onhand`.
* Seed data includes 5 sample users, posts, messages, bookings, ratings, and reports.

---

## Credits

Developed by **Group #1 — CBAPDEV**
as part of the **OnHand Web Application Project**.

---

✅ **Instructions:**

1. Copy all the text above.
2. Paste it into your project root.
3. Save as `README.md`.

GitHub and VS Code will render it perfectly — walang extra formatting, walang emojis.
