The intern is gone and left an unfinished app behind them.
Your both is breathing down you neck. "We need this tomorrow", they say, "and in tip top shape!".
"No problem, boss", you answer, while day dreaming about the upcoming weekend.
"It should be a piece of cake", you think. But you haven't looked at the code yet.

The app's goal is to make sure each product coming out of the door has been properly labelled with
a "Lot number". The employees will scan a QR code on the product, which contains the lot number, then 
they will take a photo of the related product and the app will record both.

Examples of QR codes are in the folder /ExampleQRCodes. "errorCode.png" will make the app fail.

Node version v17.3.x

yarn install
yarn run android



- Fix typescript warnings and errors in MultiPhotoCapture.tsx
- Find out why the app fails when scanning errorCode.png, and fix the problem.
- Fix the warning showing up when rendering the list of products.
- Add touch to focus, when tapping on the camera:
  - a circle 64px in diameter should appear for 2 seconds at the tap location.
  - the camera should focus on the related area. See documentation here: 
    https://react-native-camera.github.io/react-native-camera/docs/rncamera#autofocuspointofinterest
- (BONUS) Make the redux store persistent (right now it's only in memory, so it's cleared on restart).
- (BONUS) Make the list of photo + lot numbers on the home page prettier:
  - add sensible margin vertically and horizontally between each rows.
  - make each item in a row, with lot number on the left, and photo on the right.


