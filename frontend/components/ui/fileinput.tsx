import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, CheckCircle } from "lucide-react";

interface FileInputProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  accept?: string;
  helperText?: string;
  value?: File | null;
}

export const FileInput = ({
  id,
  name,
  label,
  required = false,
  onChange,
  error,
  accept = "image/*",
  helperText,
  value,
}: FileInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="relative">
        <div className="border border-gray-300 rounded-md overflow-hidden hover:border-gray-400 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 transition-all duration-200">
          <label
            htmlFor={id}
            className="flex items-center cursor-pointer p-2 gap-2"
          >
            <div className="bg-gray-100 p-2 rounded-md">
              {value ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Upload className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <span className="text-gray-700 flex-1 truncate">
              {value ? value.name : `Choose ${label}`}
            </span>
            <Input
              id={id}
              name={name}
              type="file"
              accept={accept}
              onChange={onChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>

      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
    </div>
  );
};
