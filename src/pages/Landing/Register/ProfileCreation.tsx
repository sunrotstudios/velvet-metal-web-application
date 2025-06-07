import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileCreationProps {
  onSubmit: (data: ProfileFormData) => Promise<void>;
  loading: boolean;
}

export interface ProfileFormData {
  email: string;
  display_name: string;
  password: string;
  confirmPassword: string;
  avatar: File | null;
}

export function ProfileCreation({ onSubmit, loading }: ProfileCreationProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileFormData>({
    email: "",
    display_name: "",
    password: "",
    confirmPassword: "",
    avatar: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image must be less than 2MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFormData((prev) => ({ ...prev, avatar: file }));
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      await handleFileUpload(file);
    } else {
      toast.error("Please upload an image file");
    }
  }, []);

  const removeAvatar = useCallback(() => {
    setFormData((prev) => ({ ...prev, avatar: null }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    await onSubmit(formData);
  };

  return (
    <motion.div
      className={cn(
        "w-full max-w-[600px] bg-white",
        "rounded-xl sm:rounded-[32px] border-2 sm:border-4 border-black",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        "p-3 sm:p-6 md:p-8"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Desktop Form - Matching mobile style */}
      <form onSubmit={handleSubmit} className="hidden md:block space-y-6">
        {/* Form Box */}
        {/* Top Row: Avatar and Main Fields */}
        <div className="grid grid-cols-[auto_1fr] gap-6 mb-5">
          {/* Avatar Upload - Desktop */}
          <div
            className={cn(
              "border-3 border-black rounded-lg bg-yellow-300 p-0 w-36 h-36 flex flex-col items-center justify-center relative overflow-hidden",
              isDragging ? "translate-x-[-2px] translate-y-[-2px]" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute top-0 right-0 p-1 bg-white border-b-3 border-l-3 border-black transition-all z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 mb-2" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatar-upload-desktop"
                />
                <label
                  htmlFor="avatar-upload-desktop"
                  className="text-base font-bold cursor-pointer text-center"
                >
                  UPLOAD PHOTO
                </label>
                <p className="text-xs mt-2 text-center">Drag & drop or click</p>
              </>
            )}
          </div>

          {/* Top Form Fields */}
          <div className="space-y-4">
            <Input
              name="display_name"
              type="text"
              placeholder="DISPLAY NAME"
              value={formData.display_name}
              onChange={handleChange}
              required
              className={cn(
                "h-14 bg-white text-base",
                "border-3 border-black rounded-lg",
                "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                "placeholder:text-black/60 px-3",
                "font-bold"
              )}
            />
            <Input
              name="email"
              type="email"
              placeholder="EMAIL"
              value={formData.email}
              onChange={handleChange}
              required
              className={cn(
                "h-14 bg-white text-base",
                "border-3 border-black rounded-lg",
                "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                "placeholder:text-black/60 px-3",
                "font-bold"
              )}
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="space-y-4">
          <Input
            name="password"
            type="password"
            placeholder="PASSWORD"
            value={formData.password}
            onChange={handleChange}
            required
            className={cn(
              "h-14 bg-white text-base w-full",
              "border-3 border-black rounded-lg",
              "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
              "placeholder:text-black/60 px-3",
              "font-bold"
            )}
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="CONFIRM PASSWORD"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={cn(
              "h-14 bg-white text-base w-full",
              "border-3 border-black rounded-lg",
              "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
              "placeholder:text-black/60 px-3",
              "font-bold"
            )}
          />
        </div>

        {/* Desktop Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-14 bg-purple-500 text-white text-xl font-black",
            "border-3 border-black rounded-lg",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            "transition-all"
          )}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "CONTINUE"}
        </Button>

        {/* Desktop Sign In Link */}
        <div className="text-center">
          <p className="text-lg">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-bold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>

      {/* Mobile Form - Neo-brutalist style */}
      <form onSubmit={handleSubmit} className="md:hidden space-y-4">
        {/* Mobile Form with Avatar and Fields */}
        <div className="bg-white border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3">
          {/* Top Row: Avatar and Main Fields */}
          <div className="grid grid-cols-[auto_1fr] gap-3 mb-3">
            {/* Avatar Upload - Mobile */}
            <div
              className={cn(
                "border-3 border-black rounded-lg bg-yellow-300 p-0 w-20 h-20 flex flex-col items-center justify-center relative overflow-hidden",
                isDragging ? "translate-x-[-2px] translate-y-[-2px]" : ""
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute top-0 right-0 p-0.5 bg-white border-b-2 border-l-2 border-black transition-all z-10"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-1" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="text-[10px] font-bold cursor-pointer text-center"
                  >
                    UPLOAD PHOTO
                  </label>
                </>
              )}
            </div>

            {/* Top Form Fields */}
            <div className="space-y-2">
              <Input
                name="display_name"
                type="text"
                placeholder="DISPLAY NAME"
                value={formData.display_name}
                onChange={handleChange}
                required
                className={cn(
                  "h-9 bg-white text-sm",
                  "border-3 border-black rounded-lg",
                  "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                  "placeholder:text-black/60 px-2",
                  "font-bold"
                )}
              />
              <Input
                name="email"
                type="email"
                placeholder="EMAIL"
                value={formData.email}
                onChange={handleChange}
                required
                className={cn(
                  "h-9 bg-white text-sm",
                  "border-3 border-black rounded-lg",
                  "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                  "placeholder:text-black/60 px-2",
                  "font-bold"
                )}
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="space-y-2">
            <Input
              name="password"
              type="password"
              placeholder="PASSWORD"
              value={formData.password}
              onChange={handleChange}
              required
              className={cn(
                "h-9 bg-white text-sm w-full",
                "border-3 border-black rounded-lg",
                "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                "placeholder:text-black/60 px-2",
                "font-bold"
              )}
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="CONFIRM PASSWORD"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={cn(
                "h-9 bg-white text-sm w-full",
                "border-3 border-black rounded-lg",
                "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                "placeholder:text-black/60 px-2",
                "font-bold"
              )}
            />
          </div>
        </div>

        {/* Mobile Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-11 bg-purple-500 text-white text-base font-black",
            "border-3 border-black rounded-lg",
            "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
            "transition-all"
          )}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CONTINUE"}
        </Button>

        {/* Mobile Sign In Link */}
        <div className="text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-bold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
}
