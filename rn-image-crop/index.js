import React, { useEffect, useState } from "react";
import { Image, ImageBackground, Modal, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import PropTypes from "prop-types";

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
    locations: [],
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

      const touchPadding = 32;

      const outOfBounds =
        cropLocationX < -touchPadding ||
        cropLocationX > cropRect.width + touchPadding ||
        cropLocationY < -touchPadding ||
        cropLocationY > cropRect.height + touchPadding;

      let locations = [];

      if (cropLocationY >= cropRect.height - Math.min(cropRect.height / 4, 32)) locations.push("bottom");
      if (cropLocationY < Math.min(cropRect.height / 4, 32)) locations.push("top");
      if (cropLocationX >= cropRect.width - Math.min(cropRect.width / 4, 32)) locations.push("right");
      if (cropLocationX < Math.min(cropRect.width / 4, 32)) locations.push("left");
      if (locations.length === 0) locations.push("center");

      setCropDrag({ inBounds: !outOfBounds, startX: locationX, startY: locationY, startCropRect: cropRect, locations });
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

      if (cropDrag.locations.includes("center")) {
        setCropRect((prev) => ({
          ...prev,
          x: cropDrag.startCropRect.x + deltaX,
          y: cropDrag.startCropRect.y + deltaY,
        }));
      }
      if (cropDrag.locations.includes("top")) {
        setCropRect((prev) => ({
          ...prev,
          y: cropDrag.startCropRect.y + deltaY,
          height: cropDrag.startCropRect.height - deltaY,
        }));
      }
      if (cropDrag.locations.includes("bottom")) {
        setCropRect((prev) => ({
          ...prev,
          height: cropDrag.startCropRect.height + deltaY,
        }));
      }
      if (cropDrag.locations.includes("left")) {
        setCropRect((prev) => ({
          ...prev,
          x: cropDrag.startCropRect.x + deltaX,
          width: cropDrag.startCropRect.width - deltaX,
        }));
      }
      if (cropDrag.locations.includes("right")) {
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
    setCropDrag((prev) => ({ ...prev, locations: [] }));
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

      onCropImage(image, crop);
    }
  };

  return (
    <Modal visible={open} animationType={"slide"}>
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
            {!!cropRect.width && !!cropRect.height && <CropRectangle cropRect={cropRect} cropDrag={cropDrag} />}
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
          <TouchableOpacity style={{ flex: 1, alignItems: "center" }} onPress={() => onClose()}>
            <Text style={{ fontSize: 24, color: "white" }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, alignItems: "center" }}
            onPress={handleCropImage}
            disabled={cropRect.width === 0}
          >
            <Text style={{ fontSize: 24, color: cropRect.width === 0 ? "grey" : "white" }}>Crop</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

ImageCrop.propTypes = {
  image: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onCropImage: PropTypes.func,
};

function CropRectangle({ cropRect, cropDrag }) {
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
        // backgroundColor: "rgba(255, 255, 255, 0.3)",
        position: "absolute",
        top: y,
        left: x,
        width: width,
        height: height,
        // overflow: "hidden",
        // margin: 3,
      }}
    >
      {new Array(4).fill(0).map((_, i) => {
        const sides = ["top", "right", "bottom", "left"];
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              [sides[i]]: -2000,
              [sides[(i + 1) % 4]]: 0,
              width: 2000,
              height: 2000,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
          />
        );
      })}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderStyle: "solid",
          borderColor: "rgba(255, 255, 255, 1)",
          borderTopWidth: cropDrag.locations.includes("top") ? 2 : 1,
          borderBottomWidth: cropDrag.locations.includes("bottom") ? 2 : 1,
          borderLeftWidth: cropDrag.locations.includes("left") ? 2 : 1,
          borderRightWidth: cropDrag.locations.includes("right") ? 2 : 1,
        }}
      />
      {new Array(4).fill(0).map((_, i) => {
        const sides = ["top", "right", "bottom", "left"];

        return (
          <React.Fragment key={i}>
            <View
              style={[
                {
                  position: "absolute",
                  [sides[(i + 2) % 4].toLowerCase()]: -2,
                  [sides[(i + 3) % 4].toLowerCase()]: -2,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  flex: -1,
                  width: 2,
                  height: Math.min(16, height),
                },
              ]}
            />
            <View
              key={i}
              style={[
                {
                  position: "absolute",
                  [sides[(i + 2) % 4].toLowerCase()]: -2,
                  [sides[(i + 3) % 4].toLowerCase()]: -2,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  flex: -1,
                  width: Math.min(16, width),
                  height: 2,
                },
              ]}
            />
          </React.Fragment>
        );
      })}
    </View>
  );
}
