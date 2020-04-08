

# React Native Image Crop

This is a simple library for pompting the user to crop an image. The interface is interactive and allows dragging / resizing of the crop window.

![rn-image-crop demo](https://github.com/iKrushYou/rn-image-crop/blob/master/docs/demo.gif?raw=true)

*Note: still in development, theming is in progress*

[Snack Example](https://snack.expo.io/RzkUYII3K)

## Installation

```
yarn add rn-image-crop
```

## Usage

### Include the component

```
import ImageCrop from "rn-image-crop";
```

### Place it in your view

```javascript
// see /example folder
<ImageCrop  
  open={showImageCrop}  
  image={Image.resolveAssetSource(imageToCrop)}  
  onClose={() => setShowImageCrop(false)}  
  onCropImage={(image) => {  
      setCroppedImage(image)  
      setShowImageCrop(false)  
  }}  
/>
```
- This will present a modal to the user when `open` is set to `true` and will display whatever image is passed along to `image`
- Note: if you are loading an image from disk and not the network, you must wrap the image like `Image.resolveAssetSource(image)`


## Props

| Prop        | Default | Type                         | Description                                                                                                                                     |
| ----------- | --------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`   | `false`     | `boolean `                     | Whether or not the modal should be open.                                                                                                                  |
| `image` | `null`     | `image` | Must be an actual image or a URI. If loaded from disk, wrap in `Image.resolveAssetSource(image)` |                                                                                      
| `onClose` |      | `func` | Function triggered when user presses the `Cancel` button. |   
| `onCropImage` |      | `func` | Function triggered when user presses the `Crop` button.<br/>`(image, crop: {originX, originY, width, height}) => {}` |   
|
