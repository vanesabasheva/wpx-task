# wpx-task

# Calorie Counter Backend

## Overview

This is a backend API for tracking patient calories using Vanilla Node.js with TypeScript and MySQL.

### 1. Clone the Repository

### 2. Install Dependencies

    npm install

### 3. Configure Environment Variables

    touch .env

    #add the following variables to .env
    #DB_HOST=localhost
    #DB_USER=db_user
    #DB_PASSWORD=db_password
    #DB_NAME=calorie_counter
    #DB_PORT=3306

### 4. Set Up Database

    # Log into MySQL
    mysql -u db_user -p

    # Inside the MySQL shell, run:
    `source ./scripts/create_tables.sql`
    `source ./scripts/seed_data.sql`

    mysql -u db_user -p db_password < scripts\create_tables.sql
    # оr on PowerShell
    Get-Content -Path .\scripts\create_tables.sql | mysql -u db_user -p db_password

    npm run start
