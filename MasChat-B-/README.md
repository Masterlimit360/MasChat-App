# MasChat Backend

A Spring Boot backend application for the MasChat social media platform.

## Features

- User authentication and authorization with JWT
- Social media features (posts, comments, likes, stories, reels)
- Friend system and messaging
- Marketplace functionality
- AI chat integration
- MassCoin cryptocurrency system
- File upload support
- Real-time notifications

## Technology Stack

- **Framework**: Spring Boot 3.5.0
- **Database**: PostgreSQL
- **ORM**: Hibernate/JPA
- **Migration**: Flyway
- **Security**: Spring Security with JWT
- **Build Tool**: Maven
- **Java Version**: 17

## Deployment on Render

### Prerequisites

1. A Render account
2. A PostgreSQL database (you can create one on Render)

### Step 1: Create PostgreSQL Database on Render

1. Go to your Render dashboard
2. Click "New" → "PostgreSQL"
3. Choose a name (e.g., "maschat-db")
4. Select a plan (Free tier is fine for testing)
5. Choose a region
6. Click "Create Database"

### Step 2: Deploy the Backend

1. Connect your GitHub repository to Render
2. Click "New" → "Web Service"
3. Select your repository
4. Configure the service:
   - **Name**: maschat-backend
   - **Environment**: Docker
   - **Region**: Same as your database
   - **Branch**: main
   - **Root Directory**: MasChat-B- (if your backend is in a subdirectory)
   - **Build Command**: Leave empty (Docker will handle this)
   - **Start Command**: Leave empty (Docker will handle this)

### Step 3: Configure Environment Variables

In your Render service settings, add these environment variables:

#### Required Variables:
- `SPRING_PROFILES_ACTIVE`: render
- `DATABASE_URL`: Your PostgreSQL connection URL from Render
- `DATABASE_USERNAME`: Your database username
- `DATABASE_PASSWORD`: Your database password
- `JWT_SECRET`: A secure random string for JWT signing

#### Optional Variables:
- `JWT_EXPIRATION`: 86400000 (24 hours in milliseconds)
- `PORT`: 8080 (Render will set this automatically)

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. The first deployment may take 5-10 minutes

## Local Development

### Prerequisites

- Java 17
- Maven
- PostgreSQL

### Setup

1. Clone the repository
2. Navigate to the backend directory: `cd MasChat-B-`
3. Create a PostgreSQL database named `MasChatDB`
4. Update `src/main/resources/application.properties` with your database credentials
5. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Database Setup

The application uses Flyway for database migrations. The initial schema will be created automatically when you first run the application.

## API Documentation

The application exposes REST APIs for:

- Authentication (`/api/auth/*`)
- Users (`/api/users/*`)
- Posts (`/api/posts/*`)
- Comments (`/api/comments/*`)
- Friends (`/api/friends/*`)
- Messages (`/api/messages/*`)
- Marketplace (`/api/marketplace/*`)
- MassCoin (`/api/masscoin/*`)
- AI Chat (`/api/ai-chat/*`)

## Health Check

The application provides a health check endpoint at `/actuator/health` for monitoring.

## File Upload

The application supports file uploads for:
- Profile pictures
- Cover photos
- Post images/videos
- Story media
- Reel videos

Files are stored in the `uploads/` directory.

## Security

- JWT-based authentication
- Password encryption with BCrypt
- CORS configuration for frontend integration
- Input validation and sanitization

## Monitoring

- Health check endpoint: `/actuator/health`
- Application info: `/actuator/info`
- Logging configured for production

## Troubleshooting

### Common Issues

1. **Database Connection Failed**: Ensure your database URL, username, and password are correct
2. **Port Already in Use**: Change the port in application.properties or use the PORT environment variable
3. **Migration Errors**: Check that your database is accessible and has the correct permissions

### Logs

Check the application logs in Render dashboard for detailed error information.

## Support

For issues and questions, please check the logs and ensure all environment variables are properly configured. 