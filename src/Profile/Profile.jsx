import React, { useState, useEffect } from 'react';
import Header from './Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEnvelope, faFolderTree, faIdCard, faLocationDot, faMobile, faUser, faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
import { faBuilding } from '@fortawesome/free-solid-svg-icons/faBuilding';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import axios from 'axios';
import ToastNotification, { showToast } from '../Utils/ToastNotification';

const Profile = () => {
  // State variables
  const [isEditable, setIsEditable] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileImage, setProfileImage] = useState('/Images/profile-img.jpg');
  const [imagePreview, setImagePreview] = useState(profileImage);

  const [profileData, setProfileData] = useState(() => {
    const savedProfileData = localStorage.getItem('profileData');
    return savedProfileData
      ? JSON.parse(savedProfileData)
      : {
          userId: '',
          name: '',
          userMail: '',
          gender: '',
          phoneNumber: '',
          address: '',
          dept: '',
          designation: '',
          branch: '',
        };
  });

  // Fetch user details from token
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setProfileData((prevData) => ({
          ...prevData,
          name: decoded.unique_name || prevData.name,
        }));
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  // Fetch user details from API
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      const decode = jwtDecode(token);
      const userId = decode.nameid;

      const fetchUserDetails = async () => {
        try {
          const userResponse = await axios.get(`https://localhost:7287/api/Users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const userDetails = userResponse.data;

          setUserEmail(userDetails.userMail);
          setUserPhone(userDetails.phoneNumber);

          setProfileData((prevData) => ({
            ...prevData,
            ...userDetails,
            gender: userDetails.gender || '',
            dept: userDetails.dept || '',
            designation: userDetails.designation || '',
          }));

          Cookies.set('userEmail', userDetails.userMail);
          Cookies.set('userPhone', userDetails.phoneNumber);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      };

      fetchUserDetails();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setProfileData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  

  // Toggle edit mode and save changes
  const toggleEditMode = async () => {
    if (isEditable) {
      const token = Cookies.get('token');
      if (token) {
        const decode = jwtDecode(token);
        const userId = decode.nameid;
        const userRole = decode.role;

        const updatedProfileData = {
          userId,
          userName: profileData.name || '',
          gender: profileData.gender || '',
          dept: profileData.dept || '',
          address: profileData.address || '',
          designation: profileData.designation || '',
          branch: profileData.branch || '',
          phoneNumber: userPhone || '',
          userMail: userEmail || '',
          user_Type: userRole,
        };

        try {
          const response = await axios.put(
            `https://localhost:7287/api/Users/${userId}`,
            updatedProfileData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          setProfileData(updatedProfileData);
          localStorage.setItem('profileData', JSON.stringify(updatedProfileData));
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }
    }
    setIsEditable(!isEditable);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setProfileImage(file);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      showToast('All fields are required!', 'warning');
      return;
    }

    const token = Cookies.get('token');
    if (token) {
      const decode = jwtDecode(token);
      const userId = decode.nameid;

      try {
        const response = await axios.put(
          `https://localhost:7287/api/Users/${userId}/password`,
          { userId, currentPassword, newPassword },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setCurrentPassword('');
          setNewPassword('');
          setShowCurrentPassword(false);
          setShowNewPassword(false);
          showToast('Password updated successfully!', 'success');
        }
      } catch (error) {
        console.error('Error updating password:', error);
        showToast('Failed to update password. Please try again.', 'error');
      }
    }

    setIsPasswordFormVisible(false);
  };

   

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-50">
      <ToastNotification />
      <Header />
      <div className="flex flex-col items-center justify-center py-10">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-indigo-800 tracking-wide">Profile</h1>
          <p className="text-gray-600 text-sm mt-2">Manage your account details and preferences</p>
        </div>
  
        {/* Profile Card */}
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8 relative">
            {/* Profile Image */}
            <div className="flex items-center justify-center relative mb-6">
              <img
                src={imagePreview}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-lg object-cover"
              />
              {isEditable && (
                <label className="absolute bottom-2 right-16 bg-indigo-500 p-2 rounded-full cursor-pointer hover:bg-indigo-600 transition duration-300">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <FontAwesomeIcon icon={faEdit} className="h-5 w-5 text-white" />
                </label>
              )}
            </div>
  
            {/* Buttons */}
            <div className="flex justify-between mb-6">
              <button
                onClick={toggleEditMode}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
              >
                {isEditable ? 'Save Profile' : 'Edit Profile'}
              </button>
              
                 
            </div>
  
            {/* Password Modal */}
            {isPasswordFormVisible && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                  <h2 className="text-2xl font-bold text-indigo-800 mb-6">Change Password</h2>
  
                  <div className="mb-4 relative">
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="mt-1 block w-full p-2 border border-gray-300 bg-gray-50 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <span
                      className="absolute right-3 top-9 text-gray-500 cursor-pointer"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <FontAwesomeIcon icon={showCurrentPassword ? faUnlock : faLock} />
                    </span>
                  </div>
  
                  <div className="mb-4 relative">
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="mt-1 block w-full p-2 border border-gray-300 bg-gray-50 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <span
                      className="absolute right-3 top-9 text-gray-500 cursor-pointer"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <FontAwesomeIcon icon={showNewPassword ? faUnlock : faLock} />
                    </span>
                  </div>
  
                  <div className="flex justify-between">
                    <button
                      onClick={handlePasswordChange}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg"
                    >
                      Save Password
                    </button>
                    <button
                      onClick={handleClosePasswordForm}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
  
            {/* Form Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Name', value: profileData.name, name: 'name', icon: faIdCard },
                { label: 'Mail Address', value: userEmail, name: 'userMail', icon: faEnvelope },
                { label: 'Phone Number', value: userPhone, name: 'phoneNumber', icon: faMobile },
                { label: 'Gender', value: profileData.gender, name: 'gender', icon: faUser },
                { label: 'Department', value: profileData.dept, name: 'dept', icon: faBuilding },
                { label: 'Designation', value: profileData.designation, name: 'designation', icon: faFolderTree },
                { label: 'Address', value: profileData.address, name: 'address', icon: faLocationDot },
                { label: 'Branch', value: profileData.branch, name: 'branch', icon: faLocationDot },
              ].map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                  <div className="mt-1 relative flex items-center">
                    <FontAwesomeIcon
                      icon={field.icon}
                      className={`absolute left-3 h-5 w-5 ${isEditable ? 'text-gray-400' : 'text-indigo-500'}`}
                    />
                    <input
                      type="text"
                      name={field.name}
                      value={field.value}
                      onChange={handleInputChange}
                      disabled={!isEditable}
                      className={`mt-1 block w-full pl-10 py-2 border ${isEditable ? 'border-gray-300' : 'border-transparent'} rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-700 ${isEditable ? 'bg-indigo-50' : 'bg-white'} font-medium`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default Profile;
