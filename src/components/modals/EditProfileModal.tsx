import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { User, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/services/storage';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user?.user_metadata?.avatar_url || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let avatarUrl = user?.user_metadata?.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}/${Math.random()}.${fileExt}`;

        try {
          const publicUrl = await storage.uploadFile('avatars', fileName, avatarFile);
          avatarUrl = publicUrl;
        } catch (error) {
          console.error('Error uploading avatar:', error);
          throw error;
        }
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          avatar_url: avatarUrl,
        },
      });

      if (error) throw error;

      // No need to manually refresh - auth context handles this automatically
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white/80" />
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 p-1 rounded-full bg-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-white/10 border-0 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              {uploading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
