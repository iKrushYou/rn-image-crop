import React, { useEffect, useState } from "react";
import {Image, ImageBackground, Modal, SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

export default function ImageCrop(props) {
  const { image, open, onClose, onCropImage } = props;

  const [imageSizeOriginal, setImageSizeOriginal] = useState(null);
  const [imageSize, setImageSize] = useState({});
  const [containerLayout, setContainerLayout] = useState(null);

  const [cropRect, setCropRect] = useState({ new: true, x: 0, y: 0, width: 0, height: 0 });
  const [cropDrag, setCropDrag] = useState({
    inBounds: false,
    startX: 0,
    startY: 0,
    location: "",
    startCropRect: cropRect,
  });

  useEffect(() => {
    if (!image) return;
    Image.getSize(image, (width, height) => {
      setImageSizeOriginal({ width, height });
    });
    setCropRect({ new: true, x: 0, y: 0, width: 0, height: 0 });
  }, [image]);

  const getRatio = () => {
    const widthRatio = (1.0 * containerLayout.width) / imageSizeOriginal.width;
    const heightRatio = (1.0 * containerLayout.height) / imageSizeOriginal.height;
    return Math.min(widthRatio, heightRatio);
  };

  useEffect(() => {
    const _imageSize = { ...imageSizeOriginal };
    if (!!imageSizeOriginal && !!containerLayout) {
      _imageSize.width *= getRatio();
      _imageSize.height *= getRatio();

      setImageSize(_imageSize);
    }
  }, [imageSizeOriginal, containerLayout]);

  const handleImageLayout = (event) => {
    console.log({ layout: event.nativeEvent.layout });
  };

  const handleImageTouchStart = (event) => {
    const {
      nativeEvent: { locationX, locationY },
    } = event;
    if (!cropRect.new) {
      const cropLocationX = locationX - cropRect.x;
      const cropLocationY = locationY - cropRect.y;

      console.log({ cropRect, cropLocationX, cropLocationY });

      const outOfBounds =
        cropLocationX < 0 || cropLocationX > cropRect.width || cropLocationY < 0 || cropLocationY > cropRect.height;

      let location = "center";

      if (cropLocationY >= cropRect.height - Math.min(cropRect.height / 4, 32)) location = "bottom";
      else if (cropLocationY < Math.min(cropRect.height / 4, 32)) location = "top";
      else if (cropLocationX >= cropRect.width - Math.min(cropRect.width / 4, 32)) location = "right";
      else if (cropLocationX < Math.min(cropRect.width / 4, 32)) location = "left";

      console.log({ location });

      setCropDrag({ inBounds: !outOfBounds, startX: locationX, startY: locationY, startCropRect: cropRect, location });
      if (!outOfBounds) return;
    }
    setCropRect({ new: true, width: 0, height: 0, x: locationX, y: locationY });
  };

  const handleImageTouchMove = (event) => {
    const {
      nativeEvent: { locationX, locationY },
    } = event;

    if (!cropRect.new && cropDrag.inBounds) {
      const deltaX = locationX - cropDrag.startX;
      const deltaY = locationY - cropDrag.startY;

      if (cropDrag.location === "center") {
        setCropRect((prev) => ({
          ...prev,
          x: cropDrag.startCropRect.x + deltaX,
          y: cropDrag.startCropRect.y + deltaY,
        }));
      }
      if (cropDrag.location === "top") {
        setCropRect((prev) => ({
          ...prev,
          y: cropDrag.startCropRect.y + deltaY,
          height: cropDrag.startCropRect.height - deltaY,
        }));
      }
      if (cropDrag.location === "bottom") {
        setCropRect((prev) => ({
          ...prev,
          height: cropDrag.startCropRect.height + deltaY,
        }));
      }
      if (cropDrag.location === "left") {
        setCropRect((prev) => ({
          ...prev,
          x: cropDrag.startCropRect.x + deltaX,
          width: cropDrag.startCropRect.width - deltaX,
        }));
      }
      if (cropDrag.location === "right") {
        setCropRect((prev) => ({
          ...prev,
          width: cropDrag.startCropRect.width + deltaX,
        }));
      }
    } else {
      const width = locationX - cropRect.x;
      const height = locationY - cropRect.y;

      setCropRect((prev) => {
        if (prev.x === 0) prev.x = locationX;
        if (prev.y === 0) prev.y = locationY;
        return {
          ...prev,
          width,
          height,
        };
      });
    }
  };

  const handleImageTouchEnd = (event) => {
    //normalize cropRect
    setCropRect((prev) => {
      prev.new = false;

      if (prev.width < 0) {
        prev.x += prev.width;
        prev.width *= -1;
      }
      if (prev.height < 0) {
        prev.y += prev.height;
        prev.height *= -1;
      }
      return { ...prev };
    });
  };

  const handleCropImage = async () => {
    if (cropRect.width === 0 || cropRect.height === 0) {
      // onCropImage(image)
    } else {
      const crop = {
        originX: cropRect.x / getRatio(),
        originY: cropRect.y / getRatio(),
        width: cropRect.width / getRatio(),
        height: cropRect.height / getRatio(),
      };

      console.log({ crop });

      const result = await ImageManipulator.manipulateAsync(
        image.uri,
        [
          {
            crop,
          },
        ],
        { format: "jpeg" }
      );

      onCropImage(result, crop);
    }
  };

  return (
    <Modal visible={open} animationType={'slide'}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        {/*<Text style={{color: 'white', padding: 8, fontSize: 16}}>Drag to start cropping</Text>*/}
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          onLayout={(event) => setContainerLayout(event.nativeEvent.layout)}
        >
          <ImageBackground
            source={image}
            resizeMode={"contain"}
            style={{ width: "100%", height: "100%", ...imageSize }}
            onTouchStart={handleImageTouchStart}
            onTouchMove={handleImageTouchMove}
            onTouchEnd={handleImageTouchEnd}
            onLayout={handleImageLayout}
          >
            <CropRectangle cropRect={cropRect} />
          </ImageBackground>
        </View>
        <View
          style={{
            flex: -1,
            paddingBottom: 16,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => onClose()}>
            <Text style={{ fontSize: 24, color: "white" }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={handleCropImage} disabled={cropRect.width === 0}>
            <Text style={{ fontSize: 24, color: cropRect.width === 0 ? "grey" : "white" }}>Crop</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function CropRectangle({ cropRect }) {
  let { x, y, width, height } = cropRect;

  if (width < 0) {
    width = -width;
    x -= width;
  }

  if (height < 0) {
    height = -height;
    y -= height;
  }

  return (
    <View
      pointerEvents={"none"}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        position: "absolute",
        top: y,
        left: x,
        width: width,
        height: height,
      }}
    >
      <View
        style={{
          position: "absolute",
          backgroundColor: "rgba(255, 0, 0, 0.2)",
          top: 0,
          left: 0,
          right: 0,
          height: Math.min(height / 4, 32),
        }}
      />
      <View
        style={{
          position: "absolute",
          backgroundColor: "rgba(255, 0, 0, 0.2)",
          bottom: 0,
          left: 0,
          right: 0,
          height: Math.min(height / 4, 32),
        }}
      />
      <View
        style={{
          position: "absolute",
          backgroundColor: "rgba(255, 0, 0, 0.2)",
          top: 0,
          left: 0,
          bottom: 0,
          width: Math.min(width / 4, 32),
        }}
      />
      <View
        style={{
          position: "absolute",
          backgroundColor: "rgba(255, 0, 0, 0.2)",
          top: 0,
          bottom: 0,
          right: 0,
          width: Math.min(width / 4, 32),
        }}
      />
    </View>
  );
}
