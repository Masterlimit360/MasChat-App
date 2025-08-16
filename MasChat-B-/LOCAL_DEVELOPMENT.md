# MasChat Backend - Local Development Guide

This guide will help you set up and run the MasChat backend locally for development.

## Prerequisites

- **Java 17** or later
- **Maven** (or use the included Maven wrapper)
- **PostgreSQL** database server
- **Git** (for version control)

## Quick Start

### 1. Database Setup

Run the database setup script:

**Windows Command Prompt:**
```cmd
setup-local-db.bat
```

**PowerShell:**
```powershell
.\setup-local-db.ps1
```

This will:
- Check if PostgreSQL is running
- Create the `MasChatDB` database
- Verify the connection

### 2. Start the Application

Run the local startup script:

**Windows Command Prompt:**
```cmd
start-local.bat
```

**PowerShell:**
```powershell
.\start-local.ps1
```

This will:
- Check Java installation
- Verify Maven wrapper
- Start the Spring Boot application
- Open the API at `http://localhost:8080`

## Manual Setup

### Database Configuration

If you prefer to set up the database manually:

1. **Install PostgreSQL** (if not already installed)
2. **Start PostgreSQL service**
3. **Create the database**:
   ```sql
   CREATE DATABASE "MasChatDB";
   ```
4. **Ensure user access**:
   - Default user: `postgres`
   - Default password: (your PostgreSQL password)

### Application Configuration

The application is configured for local development with:

- **Database**: `localhost:5432/MasChatDB`
- **Username**: `postgres`
- **Password**: `peacemaker360` (update in `application.properties` if different)
- **Port**: `8080`
- **JPA Mode**: `update` (auto-creates tables)

### Running the Application

#### Option 1: Using Maven Wrapper
**Windows Command Prompt:**
```cmd
mvnw.cmd spring-boot:run
```

**PowerShell:**
```powershell
.\mvnw.cmd spring-boot:run
```

#### Option 2: Using Maven (if installed)
```bash
mvn spring-boot:run
```

#### Option 3: Using IDE
- Open the project in your IDE (IntelliJ IDEA, Eclipse, VS Code)
- Run `MasChatApplication.java`

## API Endpoints

Once the application is running, you can access:

- **Root**: `http://localhost:8080/`
- **Health Check**: `http://localhost:8080/api/health`
- **Actuator Health**: `http://localhost:8080/actuator/health`
- **API Documentation**: Check the controllers for available endpoints

## Development Features

### Auto-reload
The application includes Spring Boot DevTools for automatic reloading when you make changes.

### Database Migration
Flyway is configured to automatically run migrations from `src/main/resources/db/migration/`.

### Logging
Detailed logging is enabled for development. Check the console output for:
- SQL queries
- Application events
- Error details

## Troubleshooting

### Common Issues

1. **Port 8080 already in use**
   - Change the port in `application.properties`
   - Or stop the service using port 8080

2. **Database connection failed**
   - Ensure PostgreSQL is running
   - Check database credentials in `application.properties`
   - Verify database `MasChatDB` exists

3. **Java not found**
   - Install Java 17 or later
   - Add Java to your PATH
   - Verify with `java -version`

4. **Maven issues**
   - Use the included Maven wrapper (`mvnw.cmd`)
   - Or install Maven separately

### Logs

Check the console output for detailed error messages. The application logs:
- Database connection status
- Flyway migration progress
- Application startup events
- API requests and responses

## Configuration Files

- **`application.properties`**: Main configuration for local development
- **`application-docker.properties`**: Docker-specific configuration
- **`application-render.properties`**: Render deployment configuration

## Next Steps

After successful local setup:

1. **Test the API endpoints**
2. **Create test data**
3. **Connect your frontend application**
4. **Start developing new features**

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Ensure database is accessible
4. Check the troubleshooting section above 