import React, { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string | null;
    onChange: (url: string | null) => void;
    bucket?: string;
    folder?: string;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, bucket = "images", folder = "uploads", className }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const { toast } = useToast();

    const handleUpload = useCallback(
        async (file: File) => {
            if (!file.type.startsWith("image/")) {
                toast({ variant: "destructive", title: "Please upload an image file" });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast({ variant: "destructive", title: "Image must be less than 5MB" });
                return;
            }

            setIsUploading(true);
            try {
                const fileExt = file.name.split(".").pop();
                const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);

                if (uploadError) throw uploadError;

                const {
                    data: { publicUrl },
                } = supabase.storage.from(bucket).getPublicUrl(fileName);

                onChange(publicUrl);
                toast({ title: "Image uploaded successfully" });
            } catch (error) {
                console.error("Upload error:", error);
                toast({ variant: "destructive", title: "Failed to upload image" });
            } finally {
                setIsUploading(false);
            }
        },
        [bucket, folder, onChange, toast]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    const handleRemove = async () => {
        if (value) {
            try {
                // Extract file path from URL
                const url = new URL(value);
                const pathParts = url.pathname.split("/");
                const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join("/");

                await supabase.storage.from(bucket).remove([filePath]);
            } catch (error) {
                console.error("Error removing file:", error);
            }
        }
        onChange(null);
    };

    return (
        <div className={cn("space-y-2", className)}>
            {value ? (
                <div className="relative inline-block">
                    <img src={value} alt="Uploaded" className="h-32 w-32 rounded-lg object-cover border" />
                    <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={handleRemove}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ) : (
                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
                        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
                        isUploading && "pointer-events-none opacity-50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground text-center">
                                Drag & drop an image, or{" "}
                                <label className="text-primary cursor-pointer hover:underline">
                                    browse
                                    <Input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
