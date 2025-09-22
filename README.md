# Natalify E-commerce Platform

A complete e-commerce solution with React frontend and Node.js/Express backend, ready for deployment on Netlify.

## Project Structure

```
.
├── natalify-frontend/     # React frontend application
├── natalify-backend/      # Node.js backend (for local development)
├── netlify/               # Netlify deployment configuration
│   └── functions/         # Netlify Functions (API for production)
└── README.md              # This file
```

## Deployment to Netlify

This project is configured for easy deployment to Netlify. Follow these steps:

1. Push the entire project to a GitHub repository
2. Connect your GitHub repository to Netlify
3. Set the build settings in Netlify:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify (if needed)
5. Deploy!

### Environment Variables

For local development, copy `.env.example` to `.env` in both frontend and backend directories and update the values.

For Netlify deployment, set the following environment variables in the Netlify dashboard:
- `JWT_SECRET` - Secret key for JWT token generation
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_SECRET_KEY` - Your Stripe secret key (for Netlify Functions)

## Local Development

### Frontend

```bash
cd natalify-frontend
npm install
npm run dev
```

### Backend (for local development only)

```bash
cd natalify-backend
npm install
npm run dev
```

## Features

- Product catalog with categories and search
- Shopping cart functionality
- Order management
- Admin dashboard
- Payment processing (Stripe and bKash)
- Contact form
- Responsive design with Tailwind CSS

## Technologies Used

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios for API requests
- Stripe.js for payment processing

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT for authentication
- Stripe API
- bKash payment gateway

## Netlify Functions

The backend API is implemented as Netlify Functions for production deployment. The functions are located in `netlify/functions/` and are automatically deployed with the frontend.

## Support

For support, contact the development team.