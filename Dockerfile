# Backend Dockerfile for .NET 8 API
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5139

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

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5139
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "FinalExam3.dll"]
