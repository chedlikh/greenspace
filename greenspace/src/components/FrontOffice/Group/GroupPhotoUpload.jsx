import { useState, useRef } from 'react';
import { useUploadGroupProfilePhoto, useUploadGroupCoverPhoto } from '../../../services/group';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import { Image } from 'feather-icons-react';

const GroupPhotoUpload = ({ groupId }) => {
    const [profileFile, setProfileFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const profileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const { mutate: uploadProfilePhoto, isLoading: isUploadingProfile } = useUploadGroupProfilePhoto();
    const { mutate: uploadCoverPhoto, isLoading: isUploadingCover } = useUploadGroupCoverPhoto();

    const handleProfileUpload = () => {
        if (profileFile) {
            uploadProfilePhoto({ groupId, file: profileFile }, {
                onSuccess: () => {
                    toast.success('Profile photo uploaded successfully!');
                    setProfileFile(null);
                    if (profileInputRef.current) profileInputRef.current.value = '';
                },
                onError: (error) => {
                    toast.error(`Failed to upload profile photo: ${error.message}`);
                },
            });
        } else {
            toast.warn('Please select a profile photo to upload.');
        }
    };

    const handleCoverUpload = () => {
        if (coverFile) {
            uploadCoverPhoto({ groupId, file: coverFile }, {
                onSuccess: () => {
                    toast.success('Cover photo uploaded successfully!');
                    setCoverFile(null);
                    if (coverInputRef.current) coverInputRef.current.value = '';
                },
                onError: (error) => {
                    toast.error(`Failed to upload cover photo: ${error.message}`);
                },
            });
        } else {
            toast.warn('Please select a cover photo to upload.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Photos</h2>
            <div className="space-y-6">
                <div>
                    <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700">
                        Profile Photo
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                        <input
                            type="file"
                            id="profilePhoto"
                            ref={profileInputRef}
                            accept="image/*"
                            onChange={(e) => setProfileFile(e.target.files[0])}
                            className="p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                        <button
                            onClick={handleProfileUpload}
                            disabled={isUploadingProfile}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                        >
                            {isUploadingProfile ? <LoadingSpinner size="sm" /> : <><Image size={18} className="inline mr-2" /> Upload</>}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="coverPhoto" className="block text-sm font-medium text-gray-700">
                        Cover Photo
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                        <input
                            type="file"
                            id="coverPhoto"
                            ref={coverInputRef}
                            accept="image/*"
                            onChange={(e) => setCoverFile(e.target.files[0])}
                            className="p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                        <button
                            onClick={handleCoverUpload}
                            disabled={isUploadingCover}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                        >
                            {isUploadingCover ? <LoadingSpinner size="sm" /> : <><Image size={18} className="inline mr-2" /> Upload</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupPhotoUpload;