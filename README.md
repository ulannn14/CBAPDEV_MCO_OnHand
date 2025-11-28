# OnHand

### CBAPDEV MCO Project

OnHand is a web application that connects customers with verified service providers for household and repair services.
It aims to make it easier to find trusted help for tasks like plumbing, electrical repair, and cleaning — all in one platform.

* **GitHub:** https://github.com/ulannn14/CBAPDEV_MCO_OnHand
* **Render:** https://cbapdev-mco-onhand.onrender.com/ 

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

## Dependencies

* bcrypt
* dotenv
* express
* express-handlebars
* express-session
* express-validator
* hbs
* mongoose
* multer
* nodemon

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
node seed.js
```

or to clear existing data and reinsert everything:

```
node seed.js --reset
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

## Test Users / View Sample Data

You may log in using these accounts to see sample data across the website.
* username: gwyeigh, password: 1234
* username: mackenlhy, password: 1234
* username: lncrlsbrt, password: 1234
* username: aloisuh, password: 1234
* username: juandelacruz, password: password!11
* username: arianagrande, password: arianagrande1!