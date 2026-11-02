import { useRef, useState, useEffect } from "react";
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css"; // Import the CSS
import setCanvasPreview from "../setCanvasPreview";
import print_toast from "../utilities/Toaster.js"; // Assuming you have a toast notification utility

const ASPECT_RATIO = 3 / 4; // Passport photo aspect ratio
const MIN_DIMENSION = 150;

const ImageCropperCandicate = ({ closeModal, updateAvatar, image }) => {
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(image);
  const [crop, setCrop] = useState();
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!image) return;

    if (typeof image === 'string') {
      setImgSrc(image);
      return;
    }

    const file = image;
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageElement = new Image();
      const imageUrl = reader.result?.toString() || "";
      imageElement.src = imageUrl;

      imageElement.addEventListener("load", (e) => {
        if (error) setError("");
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
          setError("Image must be at least 150 x 150 pixels.");
          return setImgSrc("");
        }
        setImgSrc(imageUrl);
      });
    });
    reader.readAsDataURL(file);
  }, [image]);

  const onSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageElement = new Image();
      const imageUrl = reader.result?.toString() || "";
      imageElement.src = imageUrl;

      imageElement.addEventListener("load", (e) => {
        if (error) setError("");
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
          setError("Image must be at least 150 x 150 pixels.");
          return setImgSrc("");
        }
        setImgSrc(imageUrl);
      });
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

    const crop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidthInPercent,
      },
      ASPECT_RATIO,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  };

  const handleCropImage = async () => {
    if (!crop || !imgRef.current || !previewCanvasRef.current) return;

    setIsProcessing(true); // Disable the button and start processing

    try {
      const pixelCrop = convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height);

      // Render the cropped portion onto the canvas
      setCanvasPreview(imgRef.current, previewCanvasRef.current, pixelCrop);

      // Get the cropped image as a data URL
      // Get the cropped image as a data URL
      const dataUrl = previewCanvasRef.current.toDataURL("image/jpeg", 0.7);
      await updateAvatar(dataUrl); // Update avatar with cropped image
      print_toast("Image cropped successfully!"); // Notify the user
    } catch (error) {
      console.error("Error cropping the image: ", error);
      print_toast("Error cropping the image. Please try again."); // Notify the user
    } finally {
      setIsProcessing(false); // Re-enable the button after cropping
      closeModal(); // Close the modal after processing
    }
  };

  return (
    <>
      <label className="block mb-3 w-fit">
        <input
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-gray-700 file:text-sky-300 hover:file:bg-gray-600"
        />
      </label>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {imgSrc && (
        <div className="flex flex-col items-center">
          <ReactCrop
            crop={crop}
            onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
            keepSelection
            aspect={ASPECT_RATIO}
            minWidth={MIN_DIMENSION}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Upload"
              style={{ maxHeight: "70vh" }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
          <button
            className="text-white btn btn-primary mt-4"
            onClick={handleCropImage}
            disabled={!crop || !imgSrc || isProcessing} // Disable button while processing
          >
            {isProcessing ? "Cropping Image..." : "Crop Image"}
          </button>
        </div>
      )}
      {crop && (
        <canvas
          ref={previewCanvasRef}
          className="mt-4"
          style={{
            display: "none",
            border: "1px solid black",
            objectFit: "contain",
            width: 150,
            height: 150,
          }}
        />
      )}
    </>
  );
};

export default ImageCropperCandicate;
