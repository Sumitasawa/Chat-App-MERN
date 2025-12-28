import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

/* Convert image to base64 */
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const ProfilePage = () => {
  const navigate = useNavigate();
  const { authUser, updateProfile } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [tempImage, setTempImage] = useState(null);
  const [loading, setLoading] = useState(false);

  /* Sync user data */
  useEffect(() => {
    if (authUser) {
      setTempBio(authUser.bio || "");
    }
  }, [authUser]);

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setTempImage(file);
  };

  const handleSave = async () => {
    if (loading) return;

    try {
      setLoading(true);

      let imageBase64;
      if (tempImage) {
        imageBase64 = await toBase64(tempImage);
      }

      await updateProfile({
        bio: tempBio,
        profilePic: imageBase64,
      });

      setIsEditing(false);
      setTempImage(null);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0b1d] text-white flex justify-center items-start p-6">
      <div className="w-full max-w-md bg-white/10 border border-gray-600 rounded-xl p-6 shadow-lg">
        {/* Profile Image */}
        <div className="flex flex-col items-center gap-4">
          <img
            src={
              tempImage
                ? URL.createObjectURL(tempImage)
                : authUser.profilePic || assets.avatar_icon
            }
            alt="profile"
            className="w-28 h-28 rounded-full object-cover border-2 border-violet-500"
          />

          {isEditing && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
                id="profileImage"
              />
              <label
                htmlFor="profileImage"
                className="text-sm text-violet-400 cursor-pointer"
              >
                Change Profile Image
              </label>
            </>
          )}
        </div>

        {/* Name */}
        <h2 className="text-center text-xl font-semibold mt-4">
          {authUser.userName}
        </h2>

        {/* Bio */}
        <div className="mt-6">
          <p className="text-sm text-gray-300 mb-2">Bio</p>

          {isEditing ? (
            <textarea
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              rows={4}
              className="w-full bg-transparent border border-gray-500 rounded-md p-3 outline-none text-white resize-none"
            />
          ) : (
            <p className="text-gray-200 bg-white/5 p-3 rounded-md">
              {authUser.bio}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex-1 bg-violet-600 transition py-2 rounded-md font-medium
                  ${
                    loading
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-violet-700"
                  }`}
              >
                {loading ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setTempBio(authUser.bio || "");
                  setTempImage(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 transition py-2 rounded-md font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-violet-600 hover:bg-violet-700 transition py-2 rounded-md font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
