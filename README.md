# WALL.E - Smart Waste Classification Platform

WALL.E is a comprehensive, end-to-end platform designed to revolutionize municipal waste management through citizen engagement, gamification, and advanced Artificial Intelligence. 

The platform allows citizens to report unattended waste by taking a picture and uploading it. Our custom-trained Faster RCNN Artificial Intelligence automatically classifies the waste into Wet, Dry, E-Waste, or Mixed categories. This data is then securely routed to the Municipal Corporation via an Admin Dashboard, complete with automated analytics and gamification rewards for the citizens.

## Project Architecture

The project is divided into three main microservices:

1. **Frontend**: A modern, responsive web application built with Next.js, React, and Tailwind CSS. It serves the Citizen Portal, Municipal Dashboard, and Admin Control Panel.
2. **Backend**: A robust Node.js and Express API backed by MongoDB. It handles user authentication, report management, gamification logic, and analytics aggregation.
3. **Model (AI Service)**: A Python Flask microservice that loads our custom-trained Faster RCNN ResNet50-FPN model. It accepts images from the backend, runs object detection, and returns the waste classification results.

## Key Features

- **AI-Powered Waste Classification**: Real-time object detection using a custom PyTorch Faster RCNN model.
- **Citizen Gamification**: Users earn points, level up, and unlock badges (like "Eco Champion") by reporting waste.
- **Municipal Analytics**: Dynamic Admin Dashboard that aggregates waste reports by area and waste type.
- **Automated Reporting**: Admins can instantly send formatted HTML analytics reports directly to the municipal corporation via email.
- **Secure Architecture**: JWT-based authentication with strict role-based access control (Citizen, Municipal, Admin).

## Getting Started

To run the entire platform locally, you will need to start all three services. Please refer to the specific `README.md` files located in each of the three directories (`Frontend/`, `Backend/`, and `Model/`) for detailed setup and run instructions.
