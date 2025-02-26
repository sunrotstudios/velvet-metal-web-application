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
        "rounded-[32px] border-4 border-black",
        "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        "p-8 md:p-12"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Upload */}
        <div
          className={cn(
            "border-4 border-black rounded-xl p-6",
            "bg-yellow-100",
            isDragging ? "translate-x-[-2px] translate-y-[-2px]" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="block text-lg font-bold mb-4 text-center">
            Profile Picture
          </label>

          {previewUrl ? (
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={previewUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover rounded-full border-4 border-black"
              />
              <button
                type="button"
                onClick={removeAvatar}
                className={cn(
                  "absolute -top-2 -right-2 p-2",
                  "bg-white border-4 border-black rounded-full",
                  "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  "transition-all"
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="text-lg font-bold cursor-pointer hover:underline"
              >
                Upload Avatar
              </label>
              <p className="text-sm mt-2">Drag & drop or click to upload</p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {[
            { name: "display_name", type: "text", placeholder: "Display Name" },
            { name: "email", type: "email", placeholder: "Email" },
            { name: "password", type: "password", placeholder: "Password" },
            {
              name: "confirmPassword",
              type: "password",
              placeholder: "Confirm Password",
            },
          ].map((field) => (
            <Input
              key={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name as keyof ProfileFormData]}
              onChange={handleChange}
              required
              className={cn(
                "h-14 bg-white text-lg",
                "border-4 border-black rounded-xl",
                "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                "focus:translate-x-[-2px] focus:translate-y-[-2px]",
                "transition-all placeholder:text-black/50"
              )}
            />
          ))}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-14 bg-purple-100 text-xl font-bold",
            "border-4 border-black rounded-xl",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            "hover:translate-x-[-2px] hover:translate-y-[-2px]",
            "active:shadow-none active:translate-x-0 active:translate-y-0",
            "transition-all"
          )}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Continue"}
        </Button>

        {/* Sign In Link */}
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
    </motion.div>
  );
}
