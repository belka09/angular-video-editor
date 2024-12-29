# Video Editor App

This project is a modern web-based video editing application that allows users to manage and edit video timelines with ease. It supports previewing, exporting, and rendering videos using a user-friendly interface.

This project consists of **two parts**:
- **Frontend**: A web-based UI built with Angular.
- **Backend**: A server powered by Node.js and Express for processing video files.

---

## Table of Contents
1. [Features](#features)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Usage](#usage)
5. [License](#license)

---

## Features

### Frontend
- **Drag-and-Drop Video Management**: Add, reorder, and remove videos.
- **Interactive Timeline**: Manage video timelines with second-by-second precision.
- **Preview Player**: Preview videos starting from specific timestamps.
- **Toaster Notifications**: Real-time feedback for user actions (success, warnings, errors).
- **Loader Overlay**: Full-screen loader for asynchronous actions.

### Backend
- **Video Processing**: Combines and trims videos based on timeline configuration.
- **File Management**: Manages video uploads, temporary files, and exports.
- **RESTful API**: Endpoints for uploading, processing, and retrieving video files.

---

## Requirements

### General
- **Node.js**: Version 16.x or later
- **npm**: Version 7.x or later
- **Angular CLI**: Version 15.x or later
- **FFmpeg**: Must be installed on your system for the backend to process video files.

> **Note**: FFmpeg is a command-line tool for video and audio processing. Install it from [FFmpeg.org](https://ffmpeg.org/).

---

## Installation

### 1. Clone the Repository

```properties
git clone https://github.com/your-username/wafflle-video-editor.gitÏ
```  

### 2. Install Dependencies

Backend

```properties
cd server
npm install
```  

Frontend
```properties
cd web
npm install
```  

## Usage
Start the Backend Server:

Navigate to the server directory and run:

```properties
npm run start
``` 

The server will be available at http://localhost:3000.

Start the Frontend Application:

Navigate to the web directory and run:

```properties
ng serve
```  

The frontend will be available at http://localhost:4200.

##  Access the Application
Visit http://localhost:4200 in your web browser.

## License
This project is licensed under the MIT License. See the LICENSE file for details.