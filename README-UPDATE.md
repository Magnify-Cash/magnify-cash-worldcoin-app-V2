# Magnify Cash Web Version

## Overview

This is a modified version of the Magnify Cash application that has been optimized for web use without requiring World ID authentication or World Wallet. All UI functionality, popups, and user flows have been preserved, but authentication requirements have been removed.

## Changes Made

The following changes have been implemented to make the application usable by anyone on the web:

1. **Authentication Bypass**: The `ProtectedRoute` component has been modified to always allow access to protected routes.

2. **Mock World ID Integration**: The `MiniKitProvider` has been updated to use mock functionality instead of actual World ID authentication.

3. **Mock User Data**: Mock user profile data, wallet balances, transaction history, and loan data are initialized in localStorage when the application starts.

4. **Mock API Services**: API calls to World ID or World Wallet services have been replaced with mock implementations that simulate successful responses.

5. **Demo Banner**: A banner has been added to inform users that they are using a demo version without actual authentication.

## How to Use

1. **Installation**: Clone the repository and install dependencies:
   ```
   npm install
   ```
   or
   ```
   pnpm install
   ```

2. **Development**: Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   pnpm dev
   ```

3. **Build**: Build the application for production:
   ```
   npm run build
   ```
   or
   ```
   pnpm build
   ```

## Demo Mode Limitations

Since this is a demo version without actual authentication:

1. No real blockchain transactions are performed
2. All wallet balances and transaction history are simulated
3. Loan requests and repayments are stored locally and not on any blockchain
4. User profile data is mocked and stored in localStorage

## Testing

To verify that the application works correctly:

1. Navigate to all routes in the application
2. Verify that all UI components and popups display correctly
3. Test all interactive elements
4. Check that mock data is displayed appropriately

## Future Improvements

1. Add environment variable toggle to switch between authenticated and non-authenticated modes
2. Improve mock data generation for more realistic scenarios
3. Add analytics to track user interactions with the demo version 