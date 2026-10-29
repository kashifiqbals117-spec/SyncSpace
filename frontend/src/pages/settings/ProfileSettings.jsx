import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { uploadApi } from '../../services/api/uploadApi.js';
import { Topbar } from '../../components/layout/Topbar.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Avatar } from '../../components/common/Avatar.jsx';
import { User, Mail, Image, UploadCloud, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export const ProfileSettings = () => {
  const { onOpenMobile } = useOutletContext();
  const { user, updateProfile, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side quick check
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WebP, GIF, SVG).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5 MB.', 'error');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const response = await uploadApi.uploadAvatar(file);
      const newAvatarUrl = response.data.url;
      setAvatarUrl(newAvatarUrl);
      if (response.data.user) {
        updateUser(response.data.user);
      }
      showToast('Photo uploaded to Cloudinary and profile updated!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload photo to Cloudinary.', 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl.trim() || null,
      });
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar onOpenMobile={onOpenMobile} breadcrumbs={[{ label: 'Profile Settings' }]} />

      <div className="p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-brand-400" />
            User Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile, Cloudinary avatar, and display preferences
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
          {/* Avatar Section with Cloudinary Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <Avatar src={avatarUrl || user?.avatarUrl} name={name || user?.name} size="xl" />
              <div>
                <h3 className="text-base font-semibold text-slate-100">{name || 'Your Name'}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Member since {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>

            {/* Cloudinary File Upload Trigger */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                icon={UploadCloud}
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploadingPhoto}
              >
                Upload Photo
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Avatar Image URL (or Cloudinary URL)"
              type="url"
              icon={Image}
              placeholder="https://res.cloudinary.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              helperText="Upload a photo above, or paste an existing HTTPS image link."
            />

            <div className="flex justify-end pt-3">
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
                Save Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
