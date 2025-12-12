# Backend Dockerfile for .NET 8 API
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["FinalExam3.csproj", "./"]
RUN dotnet restore "FinalExam3.csproj"

# Copy all source code
COPY . .

# Build the application
RUN dotnet build "FinalExam3.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FinalExam3.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create data directory for SQLite
RUN mkdir -p /app/Data

# Railway uses PORT environment variable
ENV ASPNETCORE_ENVIRONMENT=Production

# Use shell form to allow $PORT substitution
CMD ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet FinalExam3.dll
