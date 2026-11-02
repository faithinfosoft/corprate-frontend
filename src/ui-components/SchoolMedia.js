import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../Global.js";
import Breadcum from "./Breadcum";
import print_toast from "../utilities/Toaster.js";
import useAuth from "../utilities/useAuth";
import { useParams } from "react-router-dom";
import * as imageCompression from "browser-image-compression";

const SchoolMedia = () => {
  const { school_activity_id } = useParams();
  const [activity, setActivity] = useState(null);
  const [file_path, setFilePath] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentPageImages, setCurrentPageImages] = useState(1);
  const [currentPageVideos, setCurrentPageVideos] = useState(1);

  const itemsPerPage = 5;
  const totalPagesImages = Math.ceil(media.length / itemsPerPage);
  const indexOfLastImage = currentPageImages * itemsPerPage;
  const indexOfFirstImage = indexOfLastImage - itemsPerPage;
  const currentMedia = media.slice(indexOfFirstImage, indexOfLastImage);

  const totalPagesVideos = Math.ceil(videos.length / itemsPerPage);
  const indexOfLastVideo = currentPageVideos * itemsPerPage;
  const indexOfFirstVideo = indexOfLastVideo - itemsPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  const [videoLink, setVideoLink] = useState([]);

  const [breadcum, setBreadcum] = useState([
    { Title: "School Activity", Link: "/" },
    { Title: "School Media", Link: "" },
  ]);

  const fetchActivityDetails = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolactivitydetails/view_activity_media/${school_activity_id}`
      );

      if (response.data.status && response.data.data.length > 0) {
        setActivity(response.data.data[0]);
      } else {
        setActivity(null);
        print_toast("No activity found for this ID.", "warning");
      }
    } catch (error) {
      console.error("Error fetching activity details", error);
      print_toast("Failed to fetch activity details!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityDetails();
  }, [school_activity_id]);

  const fetchMediaFiles = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolactivitydetails/view_activity_media/${school_activity_id}`
      );

      if (response.data.status && response.data.data.length > 0) {
        setMedia(response.data.data);
      } else {
        setMedia([]);
        print_toast("No images found for this activity.", "warning");
      }
    } catch (error) {
      console.error("Error fetching media files:", error);
      print_toast("Failed to fetch media files!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaFiles();
  }, [school_activity_id]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolactivitydetails/view_activity_media/${school_activity_id}`
      );

      if (response.data.status && response.data.data.length > 0) {
        const filteredVideos = response.data.data.filter(
          (item) => item.media_type === "video"
        );
        setVideos(filteredVideos);
      } else {
        setVideos([]);
        print_toast("No videos found for this activity.", "warning");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      print_toast("Failed to fetch videos!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [school_activity_id]);

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleAddImage = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      print_toast("error", "Please select at least one image.");
      return;
    }

    const formData = new FormData();

    for (const file of selectedFiles) {
      try {
        // Compression options
        const options = {
          maxSizeMB: 1, // Max size 1MB
          maxWidthOrHeight: 800, // Resize to max 800px
          useWebWorker: true, // Improve performance
        };

        // Compress the image
        const compressedFile = await imageCompression.default(file, options);
        console.log("Original:", file.size, "Compressed:", compressedFile.size);

        // Append compressed image
        formData.append("images[]", compressedFile);
      } catch (error) {
        console.error("Compression error:", error);
        print_toast("error", "Image compression failed.");
        return;
      }
    }

    formData.append("fk_school_activity_id", school_activity_id);

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolactivitydetails/upload_images`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        print_toast("success", "Images uploaded successfully!");
        setSelectedFiles([]);
        fetchMediaFiles();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to upload images."
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      print_toast("error", "An error occurred while uploading images.");
    }
  };

  const handleDeleteImage = async (mediaFileId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${globalVariables.api_url}/schoolactivitydetails/delete_image/${mediaFileId}`
      );

      if (response.data.success) {
        print_toast("success", "Image deleted successfully!");
        setMedia((prevMedia) =>
          prevMedia.filter((item) => item.media_file_id !== mediaFileId)
        );
      } else {
        print_toast("error", "Failed to delete image.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      print_toast("error", "An error occurred while deleting the image.");
    }
  };

  const handleAddVideos = async (e) => {
    e.preventDefault();

    const linksArray = Array.isArray(videoLink) ? videoLink : [videoLink];

    if (linksArray.length === 0 || !linksArray[0].trim()) {
      print_toast("error", "Please enter at least one video link.");
      return;
    }

    const formData = new FormData();
    linksArray.forEach((link) => {
      formData.append("video_links[]", link.trim());
    });
    formData.append("fk_school_activity_id", school_activity_id);

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolactivitydetails/uploadVideos`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        print_toast("success", "Video uploaded successfully!");
        setVideoLink("");
        fetchVideos();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to upload video."
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      print_toast("error", "An error occurred while uploading the video.");
    }
  };

  const extractVideoId = (url) => {
    if (!url || typeof url !== "string") return "";

    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/
    );

    return match ? match[1] : "";
  };

  const handleDeleteVideo = async (mediaFileId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolactivitydetails/delete_video`,
        { media_file_id: mediaFileId }
      );

      if (response.data.success) {
        print_toast("success", "Video deleted successfully!");
        fetchVideos();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to delete video."
        );
      }
    } catch (error) {
      console.error("Delete error:", error);
      print_toast("error", "An error occurred while deleting the video.");
    }
  };

  return (
    <div className="container mt-4">
      <Breadcum items={breadcum} title="School Media" />
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">School Activity Media</h5>
        </div>

        <div className="card-body">
          {loading ? (
            <p>Loading activity details...</p>
          ) : activity ? (
            <>
              <div className="row">
                <div className="col-md-12">
                  <h6 className="fw-bold d-flex">
                    <span style={{ width: "150px" }}>Title:</span>
                    <span className="fw-normal">{activity.activity_title}</span>
                  </h6>
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-md-12">
                  <h6 className="fw-bold d-flex">
                    <span style={{ width: "150px" }}>Start Date:</span>
                    <span className="fw-normal">{activity.created_date}</span>
                  </h6>
                </div>
                <div className="col-md-12">
                  <h6 className="fw-bold d-flex">
                    <span style={{ width: "150px" }}>No of Days:</span>
                    <span className="fw-normal">{activity.no_of_days}</span>
                  </h6>
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-md-12">
                  <div className="d-flex">
                    <h6 className="fw-bold d-flex">
                      <span style={{ width: "150px" }}>Description:</span>
                    </h6>
                    <p
                      className="fw-normal mb-0"
                      dangerouslySetInnerHTML={{
                        __html:
                          activity.description || "No description available",
                      }}
                    ></p>
                  </div>
                </div>
              </div>

              <hr className="my-3" />
            </>
          ) : (
            <p>No activity data available.</p>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">School Activity Images</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">
                        Sl No
                      </th>
                      <th scope="col" className="text-center">
                        Image
                      </th>
                      <th scope="col" className="text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMedia.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No Images Added yet
                        </td>
                      </tr>
                    ) : (
                      currentMedia.map((item, index) => (
                        <tr key={item.media_file_id}>
                          <td className="text-center">
                            {indexOfFirstImage + index + 1}
                          </td>
                          <td>
                            <img
                              src={`${globalVariables.img_url}/uploads/school_media/${item.file_path}`}
                              alt="Media"
                              width="100"
                            />
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                handleDeleteImage(item.media_file_id)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between mt-3">
                <button
                  className="btn btn-primary"
                  disabled={currentPageImages === 1}
                  onClick={() => setCurrentPageImages(currentPageImages - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {currentPageImages} of {totalPagesImages}
                </span>

                <button
                  className="btn btn-primary"
                  disabled={currentPageImages === totalPagesImages}
                  onClick={() => setCurrentPageImages(currentPageImages + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Add Images</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddImage}>
                <input
                  type="file"
                  className="form-control"
                  id="fileInput"
                  multiple
                  onChange={handleFileChange}
                />
                <button type="submit" className="btn btn-success m-1">
                  Save
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">School Activity Videos</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">
                        Sl No
                      </th>
                      <th scope="col" className="text-center">
                        Video
                      </th>
                      <th scope="col" className="text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentVideos.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No Videos Added Yet
                        </td>
                      </tr>
                    ) : (
                      currentVideos.map((item, index) => {
                        const videoId = extractVideoId(item.file_path);
                        return (
                          <tr key={item.media_file_id}>
                            <td className="text-center">
                              {indexOfFirstVideo + index + 1}
                            </td>
                            <td>
                              {videoId ? (
                                <iframe
                                  width="200"
                                  height="120"
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title="YouTube Video"
                                  frameBorder="0"
                                  allowFullScreen
                                ></iframe>
                              ) : (
                                <span>Invalid Video Link</span>
                              )}
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  handleDeleteVideo(item.media_file_id)
                                }
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="d-flex justify-content-between mt-3">
                <button
                  className="btn btn-primary"
                  disabled={currentPageVideos === 1}
                  onClick={() => setCurrentPageVideos(currentPageVideos - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {currentPageVideos} of {totalPagesVideos}
                </span>

                <button
                  className="btn btn-primary"
                  disabled={currentPageVideos === totalPagesVideos}
                  onClick={() => setCurrentPageVideos(currentPageVideos + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Add Videos</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddVideos}>
                <input
                  type="text"
                  className="form-control"
                  id="videoInput"
                  placeholder="Enter YouTube video link"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                />
                <button type="submit" className="btn btn-success m-1">
                  Save
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolMedia;
