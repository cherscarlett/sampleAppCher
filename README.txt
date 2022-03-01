The intern is gone and has left an unfinished feature behind them. Your company wants to ship the app as soon as possible! "It should be a piece of cake to finish", you think. But you haven't looked at the code yet...

The app's goal is to make sure each product coming out of the door has been properly labelled with a "Lot number". The employees using the app will scan a QR code on the product, which contains the lot number, then they will take a photo of the related product and the app will record both.

Examples of QR codes are in the folder /ExampleQRCodes. "errorCode.png" will make the app fail.

Node version v17.3.x

yarn install
yarn run android


Work through as many of these goals as you can:
- [x] Fix lint warnings and lint errors in MultiPhotoCapture.tsx
- [x] Find out why the app fails when scanning errorCode.png, and fix the problem.
- [x] Fix the warning showing up when rendering the list of products.
- Add "tap to focus" when tapping on the camera view:
  - a circle 64px in diameter should appear for 2 seconds at the tap location.
  - the camera should focus on the related area. See documentation here: 
    https://react-native-camera.github.io/react-native-camera/docs/rncamera#autofocuspointofinterest
- [x] Make the redux store persistent (right now it's only in memory, so it's cleared on restart).
- Make the list of photo + lot numbers on the home page prettier:
  - [x] add sensible margin vertically and horizontally between each rows.
  - [x] make each item in a row, with lot number on the left, and photo on the right.
  - [x] Add a delete icon to each row, clicking on it should remove the item and associated files.


